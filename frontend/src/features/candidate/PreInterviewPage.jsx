import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
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
import { motion } from "framer-motion";

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
      isOnline = navigator.onLine ? true : false;
      if (!navigator.onLine) console.warn("Backend health check failed and navigator is offline.");
    }
    setChecks(prev => ({ ...prev, internet: { status: isOnline ? "success" : "error" } }));

    // 2. Check Browser
    const isBrowserCompatible = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setChecks(prev => ({ ...prev, browser: { status: isBrowserCompatible ? "success" : "error" } }));

    if (isBrowserCompatible) {
      // 3. Check Camera
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setChecks(prev => ({ ...prev, camera: { status: "success", error: null } }));
        videoStream.getTracks().forEach(track => track.stop());
      } catch (error) {
        setChecks(prev => ({
          ...prev,
          camera: { status: "error", error: error.name === 'NotFoundError' ? 'No camera found' : error.message }
        }));
      }

      // 4. Check Mic
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setChecks(prev => ({ ...prev, mic: { status: "success", error: null } }));
        audioStream.getTracks().forEach(track => track.stop());
      } catch (error) {
        setChecks(prev => ({
          ...prev,
          mic: { status: "error", error: error.name === 'NotFoundError' ? 'No microphone found' : error.message }
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

  const getStatusDisplay = (status, text) => {
    if (status === "pending") {
      return (
        <div className="flex items-center gap-2 text-[var(--color-on-surface-variant)]">
          <span className="text-[10px] font-bold uppercase tracking-widest">Checking</span>
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      );
    }
    if (status === "success") {
      return (
        <div className="flex items-center gap-2 text-[var(--color-success)]">
          <span className="text-[10px] font-bold uppercase tracking-widest">{text}</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-[var(--color-error)]">
        <span className="text-[10px] font-bold uppercase tracking-widest">Failed</span>
        <XCircle className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="bg-[var(--background)] min-h-screen w-full font-['Inter'] flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-2xl">

        <button
          onClick={() => navigate(`/candidate/interviews/${id}`)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface-variant)]/50 hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors border border-[var(--color-outline-variant)]/30 mb-4"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-3xl relative overflow-hidden shadow-2xl"
        >
          <div className="p-4 sm:p-5">
            <div className="mb-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-warning)]/10 flex items-center justify-center mx-auto mb-2 border border-[var(--color-warning)]/20 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-[var(--color-warning)]" />
              </div>
              <h1 className="text-lg font-black text-[var(--color-on-surface)] mb-1 tracking-tight uppercase">
                System Checks
              </h1>
              <p className="text-[var(--color-on-surface-variant)] text-[10px] font-semibold max-w-md mx-auto leading-relaxed">
                Please ensure your system meets the requirements. We require camera and microphone access but do not record video/audio.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              {/* Check Item 1 */}
              <div className="flex flex-col p-2.5 bg-[var(--color-surface-container-highest)]/20 rounded-xl border border-[var(--color-outline-variant)]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-variant)] flex items-center justify-center">
                      <Camera className="w-3.5 h-3.5 text-[var(--color-on-surface-variant)]" />
                    </div>
                    <span className="text-[var(--color-on-surface)] text-[10px] font-bold uppercase tracking-wider">Camera</span>
                  </div>
                  {getStatusDisplay(checks.camera.status, "Verified")}
                </div>
                {checks.camera.status === 'error' && checks.camera.error && (
                  <p className="mt-1 text-[9px] text-[var(--color-error)] font-bold uppercase tracking-widest pl-9 truncate">{checks.camera.error}</p>
                )}
              </div>

              {/* Check Item 2 */}
              <div className="flex flex-col p-2.5 bg-[var(--color-surface-container-highest)]/20 rounded-xl border border-[var(--color-outline-variant)]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-variant)] flex items-center justify-center">
                      <Mic className="w-3.5 h-3.5 text-[var(--color-on-surface-variant)]" />
                    </div>
                    <span className="text-[var(--color-on-surface)] text-[10px] font-bold uppercase tracking-wider">Microphone</span>
                  </div>
                  {getStatusDisplay(checks.mic.status, "Verified")}
                </div>
                {checks.mic.status === 'error' && checks.mic.error && (
                  <p className="mt-1 text-[9px] text-[var(--color-error)] font-bold uppercase tracking-widest pl-9 truncate">{checks.mic.error}</p>
                )}
              </div>

              {/* Check Item 3 */}
              <div className="flex flex-col p-2.5 bg-[var(--color-surface-container-highest)]/20 rounded-xl border border-[var(--color-outline-variant)]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-variant)] flex items-center justify-center">
                      <Globe className="w-3.5 h-3.5 text-[var(--color-on-surface-variant)]" />
                    </div>
                    <span className="text-[var(--color-on-surface)] text-[10px] font-bold uppercase tracking-wider">Internet</span>
                  </div>
                  {getStatusDisplay(checks.internet.status, "Connected")}
                </div>
              </div>

              {/* Check Item 4 */}
              <div className="flex flex-col p-2.5 bg-[var(--color-surface-container-highest)]/20 rounded-xl border border-[var(--color-outline-variant)]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-variant)] flex items-center justify-center">
                      <Monitor className="w-3.5 h-3.5 text-[var(--color-on-surface-variant)]" />
                    </div>
                    <span className="text-[var(--color-on-surface)] text-[10px] font-bold uppercase tracking-wider">Browser</span>
                  </div>
                  {getStatusDisplay(checks.browser.status, "Compatible")}
                </div>
              </div>
            </div>

            {!allChecksPassed && (
              <div className="mb-4 p-3 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-lg text-[var(--color-error)] flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <p className="font-bold text-[10px] tracking-wide">Checks failed. Please grant permissions and retry.</p>
              </div>
            )}

            {!allChecksPassed ? (
              <button
                onClick={performChecks}
                className="w-full py-3 bg-[var(--color-surface-variant)] hover:bg-[var(--color-surface-variant)]/80 text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Retry Checks
              </button>
            ) : (
              <div className="space-y-4 pt-4 border-t border-[var(--color-outline-variant)]/30">
                <label className="flex items-center justify-center gap-2 cursor-pointer group p-1">
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-[var(--color-on-surface-variant)] appearance-none checked:bg-[var(--color-primary-md3)] checked:border-[var(--color-primary-md3)] transition-colors cursor-pointer bg-[var(--color-surface-container-low)]"
                    />
                    {agreed && <CheckCircle2 className="w-2.5 h-2.5 text-white absolute pointer-events-none" />}
                  </div>
                  <span className="text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-on-surface)] transition-colors text-[10px] font-bold tracking-wide">
                    I have read the instructions and agree to share my camera/microphone.
                  </span>
                </label>

                <button
                  onClick={handleStartInterview}
                  disabled={!canStart || loading}
                  className="w-full py-3 bg-[var(--color-primary-md3)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-primary-md3)]/90 transition-all shadow-lg shadow-[var(--color-primary-md3)]/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <Play className="w-3.5 h-3.5 mr-2 fill-current group-hover:scale-110 transition-transform" />}
                  {loading ? "STARTING..." : "BEGIN INTERVIEW"}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PreInterviewPage;
