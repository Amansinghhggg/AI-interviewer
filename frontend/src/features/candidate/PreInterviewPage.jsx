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

  const getStatusIcon = (status) => {
    if (status === "pending") return <Loader2 className="w-5 h-5 animate-spin text-[var(--color-on-surface-variant)]" />;
    if (status === "success") return <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />;
    return <XCircle className="w-5 h-5 text-[var(--color-error)]" />;
  };

  return (
    <div className="bg-transparent w-full font-['Inter'] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        
        <button
          onClick={() => navigate(`/candidate/interviews/${id}`)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-variant)]/50 hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] rounded-xl text-xs font-black uppercase tracking-widest transition-colors border border-[var(--color-outline-variant)]/30 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Instructions
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/30 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-primary-md3)]"></div>

          <div className="p-8 sm:p-12">
            <div className="mb-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-warning)]/10 flex items-center justify-center mx-auto mb-6 border border-[var(--color-warning)]/20 shadow-lg">
                <AlertTriangle className="w-8 h-8 text-[var(--color-warning)]" />
              </div>
              <h1 className="text-3xl font-black text-[var(--color-on-surface)] mb-4 tracking-tight uppercase">
                System Checks
              </h1>
              <p className="text-[var(--color-on-surface-variant)] text-sm font-semibold max-w-lg mx-auto">
                Please ensure your system meets the requirements before starting the interview.
                You will be asked to grant camera and microphone permissions. We do not record video or audio.
              </p>
            </div>

            <div className="space-y-4 mb-10">
              {/* Check Item 1 */}
              <div className="flex flex-col p-5 bg-[var(--color-surface-container-highest)]/20 rounded-xl border border-[var(--color-outline-variant)]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-variant)] flex items-center justify-center">
                      <Camera className="w-5 h-5 text-[var(--color-on-surface-variant)]" />
                    </div>
                    <span className="text-[var(--color-on-surface)] text-sm font-bold uppercase tracking-wider">Camera Permission</span>
                  </div>
                  {getStatusIcon(checks.camera.status)}
                </div>
                {checks.camera.status === 'error' && checks.camera.error && (
                  <p className="mt-3 text-xs text-[var(--color-error)] font-bold uppercase tracking-widest pl-14">{checks.camera.error}</p>
                )}
              </div>

              {/* Check Item 2 */}
              <div className="flex flex-col p-5 bg-[var(--color-surface-container-highest)]/20 rounded-xl border border-[var(--color-outline-variant)]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-variant)] flex items-center justify-center">
                      <Mic className="w-5 h-5 text-[var(--color-on-surface-variant)]" />
                    </div>
                    <span className="text-[var(--color-on-surface)] text-sm font-bold uppercase tracking-wider">Microphone Permission</span>
                  </div>
                  {getStatusIcon(checks.mic.status)}
                </div>
                {checks.mic.status === 'error' && checks.mic.error && (
                  <p className="mt-3 text-xs text-[var(--color-error)] font-bold uppercase tracking-widest pl-14">{checks.mic.error}</p>
                )}
              </div>

              {/* Check Item 3 */}
              <div className="flex flex-col p-5 bg-[var(--color-surface-container-highest)]/20 rounded-xl border border-[var(--color-outline-variant)]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-variant)] flex items-center justify-center">
                      <Globe className="w-5 h-5 text-[var(--color-on-surface-variant)]" />
                    </div>
                    <span className="text-[var(--color-on-surface)] text-sm font-bold uppercase tracking-wider">Internet Connection</span>
                  </div>
                  {getStatusIcon(checks.internet.status)}
                </div>
              </div>

              {/* Check Item 4 */}
              <div className="flex flex-col p-5 bg-[var(--color-surface-container-highest)]/20 rounded-xl border border-[var(--color-outline-variant)]/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-variant)] flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-[var(--color-on-surface-variant)]" />
                    </div>
                    <span className="text-[var(--color-on-surface)] text-sm font-bold uppercase tracking-wider">Browser Support</span>
                  </div>
                  {getStatusIcon(checks.browser.status)}
                </div>
              </div>
            </div>

            {!allChecksPassed && (
              <div className="mb-10 p-5 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-xl text-[var(--color-error)] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="font-bold text-sm tracking-wide">Some checks failed. Please grant necessary permissions or check your connection, and click the button below to retry.</p>
              </div>
            )}

            {!allChecksPassed ? (
              <button
                onClick={performChecks}
                className="w-full py-4 bg-[var(--color-surface-variant)] hover:bg-[var(--color-surface-variant)]/80 text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]/30 rounded-xl text-sm font-black uppercase tracking-widest transition-all"
              >
                Retry Checks
              </button>
            ) : (
              <div className="space-y-8 pt-8 border-t border-[var(--color-outline-variant)]/30">
                <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-xl hover:bg-[var(--color-surface-container-highest)]/20 transition-colors border border-transparent hover:border-[var(--color-outline-variant)]/30">
                  <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-6 h-6 rounded border-2 border-[var(--color-on-surface-variant)] appearance-none checked:bg-[var(--color-primary-md3)] checked:border-[var(--color-primary-md3)] transition-colors cursor-pointer bg-[var(--color-surface-container-low)]"
                    />
                    {agreed && <CheckCircle2 className="w-4 h-4 text-white absolute pointer-events-none" />}
                  </div>
                  <span className="text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-on-surface)] transition-colors text-sm font-bold tracking-wide pt-0.5">
                    I have read and understood all interview instructions. I agree to share my screen/camera/microphone during this session.
                  </span>
                </label>

                <button
                  onClick={handleStartInterview}
                  disabled={!canStart || loading}
                  className="w-full py-5 bg-[var(--color-primary-md3)] text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[var(--color-primary-md3)]/90 transition-all shadow-lg shadow-[var(--color-primary-md3)]/30 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Play className="w-5 h-5 mr-3 fill-current group-hover:scale-110 transition-transform" />}
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
