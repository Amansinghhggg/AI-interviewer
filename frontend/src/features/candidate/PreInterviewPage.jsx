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
    if (status === "pending") return <Loader2 className="w-5 h-5 animate-spin text-[var(--color-text-muted)]" />;
    if (status === "success") return <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-teal)]" />;
    return <XCircle className="w-5 h-5 text-[var(--color-accent-red)]" />;
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] pt-24 pb-12 flex flex-col items-center p-4 relative overflow-hidden">
      {/* Background Noise & Glows */}
      <div className="absolute inset-0 noise pointer-events-none z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-accent-blue-glow)] rounded-full blur-[150px] opacity-20 pointer-events-none z-0"></div>

      <div className="w-full max-w-2xl relative z-10">
        <button
          onClick={() => navigate(`/candidate/interviews/${id}`)}
          className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-white transition-colors mb-6 font-medium group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Instructions
        </button>

        <div className="surface-elevated rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle top border glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-teal)]"></div>

          <div className="mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(79,142,247,0.15)] flex items-center justify-center mx-auto mb-6 border border-[rgba(79,142,247,0.3)] shadow-[var(--color-accent-blue-glow)] shadow-lg">
              <AlertTriangle className="w-8 h-8 text-[var(--color-accent-blue)]" />
            </div>
            <h1 className="text-3xl font-black text-white mb-4 tracking-tight">
              Pre-Interview Checks
            </h1>
            <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto">
              Please ensure your system meets the requirements before starting the interview.
              You will be asked to grant camera and microphone permissions. We do not record video or audio.
            </p>
          </div>

          <div className="space-y-4 mb-10">
            <div className="flex flex-col p-5 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-subtle)] transition-colors hover:border-[var(--color-border-active)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center border border-[var(--color-border-default)]">
                    <Camera className="w-5 h-5 text-[var(--color-text-secondary)]" />
                  </div>
                  <span className="text-white font-bold tracking-wide">Camera Permission</span>
                </div>
                {getStatusIcon(checks.camera.status)}
              </div>
              {checks.camera.status === 'error' && checks.camera.error && (
                <p className="mt-3 text-sm text-[var(--color-accent-red)] font-medium pl-14">{checks.camera.error}</p>
              )}
            </div>

            <div className="flex flex-col p-5 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-subtle)] transition-colors hover:border-[var(--color-border-active)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center border border-[var(--color-border-default)]">
                    <Mic className="w-5 h-5 text-[var(--color-text-secondary)]" />
                  </div>
                  <span className="text-white font-bold tracking-wide">Microphone Permission</span>
                </div>
                {getStatusIcon(checks.mic.status)}
              </div>
              {checks.mic.status === 'error' && checks.mic.error && (
                <p className="mt-3 text-sm text-[var(--color-accent-red)] font-medium pl-14">{checks.mic.error}</p>
              )}
            </div>

            <div className="flex flex-col p-5 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-subtle)] transition-colors hover:border-[var(--color-border-active)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center border border-[var(--color-border-default)]">
                    <Globe className="w-5 h-5 text-[var(--color-text-secondary)]" />
                  </div>
                  <span className="text-white font-bold tracking-wide">Internet Availability</span>
                </div>
                {getStatusIcon(checks.internet.status)}
              </div>
            </div>

            <div className="flex flex-col p-5 bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-subtle)] transition-colors hover:border-[var(--color-border-active)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center border border-[var(--color-border-default)]">
                    <Monitor className="w-5 h-5 text-[var(--color-text-secondary)]" />
                  </div>
                  <span className="text-white font-bold tracking-wide">Browser Compatibility</span>
                </div>
                {getStatusIcon(checks.browser.status)}
              </div>
            </div>
          </div>

          {!allChecksPassed && (
            <div className="mb-10 p-5 bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.2)] rounded-xl text-[var(--color-accent-red)] text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">Some checks failed. Please grant necessary permissions or check your connection, and click the button below to retry.</p>
            </div>
          )}

          {!allChecksPassed ? (
            <button
              onClick={performChecks}
              className="btn-secondary w-full py-4 text-lg font-bold"
            >
              Retry Checks
            </button>
          ) : (
            <div className="space-y-8 pt-6 border-t border-[var(--color-border-subtle)]">
              <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-xl hover:bg-[var(--color-bg-surface)] transition-colors border border-transparent hover:border-[var(--color-border-subtle)]">
                <div className="relative flex items-center justify-center mt-1 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-6 h-6 rounded border-2 border-[var(--color-border-active)] appearance-none checked:bg-[var(--color-accent-blue)] checked:border-[var(--color-accent-blue)] transition-colors cursor-pointer bg-[var(--color-bg-elevated)]"
                  />
                  {agreed && <CheckCircle2 className="w-4 h-4 text-white absolute pointer-events-none" />}
                </div>
                <span className="text-[var(--color-text-secondary)] group-hover:text-white transition-colors text-sm font-medium leading-relaxed pt-1">
                  I have read and understood all interview instructions. I agree to share my screen/camera/microphone during this session.
                </span>
              </label>

              <button
                onClick={handleStartInterview}
                disabled={!canStart || loading}
                className="btn-primary w-full py-5 text-lg font-bold flex items-center justify-center gap-3 shadow-2xl shadow-[var(--color-accent-blue-glow)] disabled:shadow-none"
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
