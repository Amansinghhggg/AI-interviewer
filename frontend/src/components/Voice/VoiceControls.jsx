import { Mic, Square, Trash2, RefreshCw } from "lucide-react";
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
}) => {
  return (
    <div className="flex flex-col items-center gap-4 p-4 border border-dark-700 rounded-xl bg-dark-800">
      <div className="text-2xl font-mono text-dark-200">
        {formatDuration(duration)}
      </div>
      
      <div className="flex gap-4">
        {recordingState === RECORDING_STATES.IDLE || recordingState === RECORDING_STATES.ERROR ? (
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-medium transition-colors"
            aria-label="Start Recording"
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </button>
        ) : null}

        {recordingState === RECORDING_STATES.RECORDING && (
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-medium transition-colors animate-pulse"
            aria-label="Stop Recording"
          >
            <Square className="w-5 h-5" />
            Stop Recording
          </button>
        )}

        {recordingState === RECORDING_STATES.RECORDED && (
          <>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-red-400 rounded-lg transition-colors"
              aria-label="Delete Recording"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-primary-400 rounded-lg transition-colors"
              aria-label="Re-record"
            >
              <RefreshCw className="w-4 h-4" />
              Re-record
            </button>
          </>
        )}
      </div>
    </div>
  );
};
