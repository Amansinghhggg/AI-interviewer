import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  Camera,
  Mic,
  Globe,
  Monitor,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Loader2,
  ArrowLeft
} from "lucide-react";

const PreInterviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  
  const [checks, setChecks] = useState({
    camera: { status: "pending" }, // pending, success, error
    mic: { status: "pending" },
    browser: { status: "pending" },
    internet: { status: "pending" }
  });

  const performChecks = async () => {
    // 1. Check Internet / Backend Health
    let isOnline = false;
    try {
      const { data } = await api.get("/health");
      isOnline = data.success;
    } catch (error) {
      // Don't block development entirely if there's a weird network error but navigator is online
      isOnline = navigator.onLine ? true : false;
      if (!navigator.onLine) console.warn("Backend health check failed and navigator is offline.");
    }
    setChecks(prev => ({ ...prev, internet: { status: isOnline ? "success" : "error" } }));

    // 2. Check Browser
    const isBrowserCompatible = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setChecks(prev => ({ ...prev, browser: { status: isBrowserCompatible ? "success" : "error" } }));

    if (isBrowserCompatible) {
      try {
        // 3. Check Camera & Mic
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        setChecks(prev => ({ 
          ...prev, 
          camera: { status: "success" },
          mic: { status: "success" }
        }));

        // Stop the tracks immediately as we just need permission, not recording
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        // Distinguish between camera and mic if possible, but usually it's combined in prompt
        setChecks(prev => ({ 
          ...prev, 
          camera: { status: "error" },
          mic: { status: "error" }
        }));
      }
    }
  };

  useEffect(() => {
    performChecks();
    
    const handleOnline = () => setChecks(prev => ({ ...prev, internet: { status: "success" } }));
    const handleOffline = () => setChecks(prev => ({ ...prev, internet: { status: "error" } }));
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const allChecksPassed = Object.values(checks).every(check => check.status === "success");
  const canStart = allChecksPassed && agreed;

  const handleStartInterview = async () => {
    if (!canStart) return;
    setLoading(true);
    
    try {
      const { data } = await api.post(`/interviews/${id}/start`);
      if (data.success) {
        // Request Fullscreen
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch((err) => {
            console.warn("Fullscreen request failed:", err);
          });
        }
        
        toast.success("Interview Started!");
        navigate(`/candidate/interviews/${id}/live`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === "pending") return <Loader2 className="w-5 h-5 animate-spin text-dark-400" />;
    if (status === "success") return <CheckCircle2 className="w-5 h-5 text-success-500" />;
    return <XCircle className="w-5 h-5 text-danger-500" />;
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-20 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl">
        <button
          onClick={() => navigate(`/candidate/interviews/${id}`)}
          className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Instructions
        </button>

        <div className="glass-light rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-dark-50 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-warning-400" />
            Pre-Interview Checks
          </h1>

          <p className="text-dark-300 mb-8">
            Please ensure your system meets the requirements before starting the interview.
            You will be asked to grant camera and microphone permissions. We do not record video or audio.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl border border-dark-700">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-dark-300" />
                <span className="text-dark-100 font-medium">Camera Permission</span>
              </div>
              {getStatusIcon(checks.camera.status)}
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl border border-dark-700">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-dark-300" />
                <span className="text-dark-100 font-medium">Microphone Permission</span>
              </div>
              {getStatusIcon(checks.mic.status)}
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl border border-dark-700">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-dark-300" />
                <span className="text-dark-100 font-medium">Internet Availability</span>
              </div>
              {getStatusIcon(checks.internet.status)}
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl border border-dark-700">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-dark-300" />
                <span className="text-dark-100 font-medium">Browser Compatibility</span>
              </div>
              {getStatusIcon(checks.browser.status)}
            </div>
          </div>

          {!allChecksPassed && (
            <div className="mb-8 p-4 bg-warning-500/10 border border-warning-500/20 rounded-xl text-warning-400 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>Some checks failed. Please grant necessary permissions or check your connection, and click the button below to retry.</p>
            </div>
          )}

          {!allChecksPassed ? (
            <button
              onClick={performChecks}
              className="w-full py-3 rounded-xl bg-dark-700 text-dark-100 hover:bg-dark-600 transition-colors font-medium border border-dark-600"
            >
              Retry Checks
            </button>
          ) : (
            <div className="space-y-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-1">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-5 h-5 rounded border border-dark-600 appearance-none checked:bg-primary-500 checked:border-primary-500 transition-colors cursor-pointer bg-dark-800"
                  />
                  {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-white absolute pointer-events-none" />}
                </div>
                <span className="text-dark-200 group-hover:text-dark-100 transition-colors text-sm">
                  I have read and understood all interview instructions.
                </span>
              </label>

              <button
                onClick={handleStartInterview}
                disabled={!canStart || loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-lg hover:from-primary-500 hover:to-primary-400 transition-all duration-300 shadow-lg shadow-primary-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-white" />}
                {loading ? "Starting..." : "Begin Interview"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreInterviewPage;
