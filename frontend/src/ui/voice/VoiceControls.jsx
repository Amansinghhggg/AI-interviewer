import { Mic, Square, Trash2, RefreshCw, Check } from "lucide-react";
import { RECORDING_STATES } from "../../hooks/useVoiceRecorder";

const formatDuration = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const VoiceControls = ({
  recordingState,
  duration,
  onStart,
  onStop,
  onDelete,
  onUpload, // New prop for Use Answer
  isUploading
}) => {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* State: Initial */}
      {(recordingState === RECORDING_STATES.IDLE || recordingState === RECORDING_STATES.ERROR) && (
        <button
          onClick={onStart}
          className="btn-primary w-full py-4 text-sm uppercase tracking-wider flex items-center justify-center gap-3"
        >
          <Mic className="w-5 h-5" />
          Start Answer
        </button>
      )}

      {/* State: Recording */}
      {recordingState === RECORDING_STATES.RECORDING && (
        <div className="flex flex-col items-center gap-4 w-full animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2 text-[var(--color-accent-red)] font-mono font-bold tracking-widest text-lg">
            <span className="w-3 h-3 rounded-full bg-[var(--color-accent-red)] animate-pulse shadow-[var(--color-accent-red-glow)] shadow-md" />
            Recording... {formatDuration(duration)}
          </div>
          <button
            onClick={onStop}
            className="btn-secondary w-full py-4 text-sm uppercase tracking-wider flex items-center justify-center gap-3 border-[var(--color-border-active)] hover:bg-[rgba(244,63,94,0.1)] hover:text-[var(--color-accent-red)] transition-all"
          >
            <Square className="w-5 h-5 text-[var(--color-accent-red)]" />
            Stop Recording
          </button>
        </div>
      )}

      {/* State: Recorded (Finished) */}
      {recordingState === RECORDING_STATES.RECORDED && (
        <div className="flex flex-col gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={onUpload}
            disabled={isUploading}
            className="btn-primary w-full py-4 text-sm uppercase tracking-wider flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Use Answer
              </>
            )}
          </button>
          
          <div className="flex flex-col gap-3 w-full mt-2">
            <button
              onClick={onStart}
              disabled={isUploading}
              className="btn-secondary w-full py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Record Again
            </button>
            <button
              onClick={onDelete}
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-transparent hover:bg-[rgba(244,63,94,0.1)] text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)] rounded-xl font-bold uppercase tracking-wider text-xs transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Clear Recording
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
