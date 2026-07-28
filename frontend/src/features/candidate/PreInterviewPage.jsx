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
import { GlassCard } from "../../ui/primitives/GlassCard";
import { StatusBadge } from "../../ui/primitives/StatusBadge";

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
    <div className="bg-transparent min-h-screen w-full font-['Inter'] flex flex-col items-center justify-center p-4 text-[var(--color-on-surface,#dae2fd)]">
      <div className="w-full max-w-2xl space-y-4">

        <button
          onClick={() => navigate(`/candidate/interviews/${id}`)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface-variant)]/50 hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-[var(--color-outline-variant)]/30"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard padding="p-6 sm:p-8" glowEffect>
            <div className="mb-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto mb-3 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-[var(--color-on-surface)] mb-1 tracking-tight uppercase">
                Hardware System Verification
              </h1>
              <p className="text-[var(--color-on-surface-variant)] text-xs font-medium max-w-md mx-auto leading-relaxed">
                Ensure your camera, microphone, and browser meet live interview requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {/* Check Item 1 */}
              <div className="flex flex-col p-3 bg-[var(--color-surface-container-highest)]/25 rounded-2xl border border-[var(--color-outline-variant)]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--color-surface-variant)] flex items-center justify-center">
                      <Camera className="w-4 h-4 text-[var(--color-primary-md3)]" />
                    </div>
                    <span className="text-[var(--color-on-surface)] text-xs font-bold uppercase tracking-wider">Camera</span>
                  </div>
                  {getStatusDisplay(checks.camera.status, "Verified")}
                </div>
                {checks.camera.status === 'error' && checks.camera.error && (
                  <p className="mt-1.5 text-[10px] text-rose-400 font-bold uppercase tracking-widest pl-10 truncate">{checks.camera.error}</p>
                )}
              </div>

              {/* Check Item 2 */}
              <div className="flex flex-col p-3 bg-[var(--color-surface-container-highest)]/25 rounded-2xl border border-[var(--color-outline-variant)]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--color-surface-variant)] flex items-center justify-center">
                      <Mic className="w-4 h-4 text-[var(--color-primary-md3)]" />
                    </div>
                    <span className="text-[var(--color-on-surface)] text-xs font-bold uppercase tracking-wider">Microphone</span>
                  </div>
                  {getStatusDisplay(checks.mic.status, "Verified")}
                </div>
                {checks.mic.status === 'error' && checks.mic.error && (
                  <p className="mt-1.5 text-[10px] text-rose-400 font-bold uppercase tracking-widest pl-10 truncate">{checks.mic.error}</p>
                )}
              </div>

              {/* Check Item 3 */}
              <div className="flex flex-col p-3 bg-[var(--color-surface-container-highest)]/25 rounded-2xl border border-[var(--color-outline-variant)]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--color-surface-variant)] flex items-center justify-center">
                      <Globe className="w-4 h-4 text-[var(--color-secondary)]" />
                    </div>
                    <span className="text-[var(--color-on-surface)] text-xs font-bold uppercase tracking-wider">Connection</span>
                  </div>
                  {getStatusDisplay(checks.internet.status, "Online")}
                </div>
              </div>

              {/* Check Item 4 */}
              <div className="flex flex-col p-3 bg-[var(--color-surface-container-highest)]/25 rounded-2xl border border-[var(--color-outline-variant)]/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--color-surface-variant)] flex items-center justify-center">
                      <Monitor className="w-4 h-4 text-[var(--color-secondary)]" />
                    </div>
                    <span className="text-[var(--color-on-surface)] text-xs font-bold uppercase tracking-wider">Browser</span>
                  </div>
                  {getStatusDisplay(checks.browser.status, "Compatible")}
                </div>
              </div>
            </div>

            {!allChecksPassed && (
              <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="font-bold text-xs tracking-wide">Hardware verification incomplete. Grant required device permissions and click retry.</p>
              </div>
            )}

            {!allChecksPassed ? (
              <button
                onClick={performChecks}
                className="w-full py-3.5 bg-[var(--color-surface-variant)] hover:bg-[var(--color-surface-variant)]/80 text-[var(--color-on-surface)] border border-[var(--color-outline-variant)]/30 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              >
                Retry Hardware Checks
              </button>
            ) : (
              <div className="space-y-4 pt-4 border-t border-[var(--color-outline-variant)]/30">
                <label className="flex items-center justify-center gap-3 cursor-pointer group p-1">
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 rounded border-2 border-[var(--color-on-surface-variant)] appearance-none checked:bg-[var(--color-primary-md3)] checked:border-[var(--color-primary-md3)] transition-colors cursor-pointer bg-[var(--color-surface-container-low)]"
                    />
                    {agreed && <CheckCircle2 className="w-3 h-3 text-white absolute pointer-events-none" />}
                  </div>
                  <span className="text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-on-surface)] transition-colors text-xs font-medium tracking-wide">
                    I confirm camera and microphone functionality for live evaluation.
                  </span>
                </label>

                <button
                  onClick={handleStartInterview}
                  disabled={!canStart || loading}
                  className="w-full py-3.5 bg-[var(--color-primary-md3)] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[var(--color-primary-md3)]/90 transition-all shadow-lg shadow-[var(--color-primary-md3)]/25 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2 fill-current group-hover:scale-110 transition-transform" />}
                  {loading ? "STARTING..." : "BEGIN INTERVIEW SESSION"}
                </button>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default PreInterviewPage;
