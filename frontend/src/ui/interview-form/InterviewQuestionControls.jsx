import { useEffect } from "react";
import { RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { VOICE_STATES } from "../../hooks/useQuestionVoice";

export const InterviewQuestionControls = ({
  voiceState,
  isPlaying,
  play,
  pause,
  stop,
  replay
}) => {
  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in a textarea or input
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "TEXTAREA" || activeTag === "INPUT") return;

      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        replay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [replay]);

  return (
    <div className="flex items-center gap-2" role="region" aria-label="Question Audio Controls">
      
      {voiceState === VOICE_STATES.GENERATING && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-800 border border-dark-700 text-dark-300 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
          <span>Generating Voice...</span>
        </div>
      )}

      {voiceState === VOICE_STATES.ERROR && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm" title="Failed to generate audio. Interview will continue normally.">
          <AlertCircle className="w-4 h-4" />
          <span>Voice Error</span>
        </div>
      )}

      {(voiceState === VOICE_STATES.READY || voiceState === VOICE_STATES.PLAYING || voiceState === VOICE_STATES.PAUSED) && (
        <div className="flex gap-1.5 p-1 rounded-full bg-dark-800 border border-dark-700 shadow-inner">
          <button
            onClick={replay}
            disabled={isPlaying}
            className={`p-2 rounded-full transition-colors ${
              isPlaying 
                ? "bg-dark-700 text-primary-500" 
                : "bg-dark-700 hover:bg-dark-600 text-dark-100"
            }`}
            aria-label="Replay Question Audio"
            title="Replay (R)"
          >
            <RotateCcw className={`w-4 h-4 ${isPlaying ? "animate-spin-slow" : ""}`} />
          </button>
        </div>
      )}
    </div>
  );
};
