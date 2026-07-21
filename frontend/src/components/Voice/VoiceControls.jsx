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
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/20"
        >
          <Mic className="w-5 h-5" />
          Start Answer
        </button>
      )}

      {/* State: Recording */}
      {recordingState === RECORDING_STATES.RECORDING && (
        <div className="flex flex-col items-center gap-3 w-full animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2 text-danger-400 font-mono font-medium tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full bg-danger-500 animate-pulse" />
            Recording... {formatDuration(duration)}
          </div>
          <button
            onClick={onStop}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-dark-700 hover:bg-dark-600 text-white rounded-xl font-semibold transition-colors border border-dark-600"
          >
            <Square className="w-4 h-4 text-danger-400" />
            Stop Recording
          </button>
        </div>
      )}

      {/* State: Recorded (Finished) */}
      {recordingState === RECORDING_STATES.RECORDED && (
        <div className="flex flex-col gap-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={onUpload}
            disabled={isUploading}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
          
          <div className="flex flex-col gap-2 w-full mt-2">
            <button
              onClick={onStart}
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-dark-700 hover:bg-dark-600 text-dark-100 rounded-xl font-semibold transition-colors disabled:opacity-50 border border-dark-600 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Record Again
            </button>
            <button
              onClick={onDelete}
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-transparent hover:bg-danger-500/10 text-dark-400 hover:text-danger-400 rounded-xl font-semibold transition-colors disabled:opacity-50"
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
