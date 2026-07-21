import { RECORDING_STATES } from '../utils/recording.states';

/**
 * RecordingIndicator
 *
 * Pure presentational component that displays the current recording status.
 * Contains zero recording logic — accepts props only.
 *
 * @param {object} props
 * @param {string} props.state - RECORDING_STATES value
 * @param {number} props.duration - Elapsed recording time in ms
 * @param {{ code: string, message: string }|null} props.error - Error object or null
 */
export const RecordingIndicator = ({ state, duration = 0, error = null }) => {
  // Don't render anything in IDLE state
  if (state === RECORDING_STATES.IDLE) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes recording-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div
        className="glass-light inline-flex items-center gap-2.5 px-4 py-2 rounded-full"
        role="status"
        aria-live="polite"
        aria-label={`Recording status: ${state}`}
      >
        {/* Status Dot */}
        {state === RECORDING_STATES.RECORDING && (
          <span
            className="w-2.5 h-2.5 rounded-full bg-danger-500"
            style={{ animation: 'recording-pulse 1.5s ease-in-out infinite' }}
            aria-hidden="true"
          />
        )}

        {state === RECORDING_STATES.PAUSED && (
          <span
            className="w-2.5 h-2.5 rounded-full bg-warning-400"
            aria-hidden="true"
          />
        )}

        {state === RECORDING_STATES.INITIALIZING && (
          <svg
            className="w-4 h-4 text-dark-300 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="60"
              strokeDashoffset="20"
            />
          </svg>
        )}

        {state === RECORDING_STATES.STOPPED && (
          <span
            className="w-2.5 h-2.5 rounded-full bg-dark-400"
            aria-hidden="true"
          />
        )}

        {state === RECORDING_STATES.ERROR && (
          <span className="text-danger-500 text-sm" aria-hidden="true">✕</span>
        )}

        {/* Label */}
        <span className="text-sm font-medium text-dark-200">
          {state === RECORDING_STATES.RECORDING && 'Recording'}
          {state === RECORDING_STATES.PAUSED && 'Paused'}
          {state === RECORDING_STATES.INITIALIZING && 'Initializing…'}
          {state === RECORDING_STATES.STOPPED && 'Stopped'}
          {state === RECORDING_STATES.ERROR && (
            <span className="text-danger-400">
              {error?.message || 'Recording error'}
            </span>
          )}
        </span>

        {/* Duration Timer */}
        {(state === RECORDING_STATES.RECORDING ||
          state === RECORDING_STATES.PAUSED ||
          state === RECORDING_STATES.STOPPED) && (
          <span className="text-sm font-mono text-dark-400 tabular-nums">
            {formatDuration(duration)}
          </span>
        )}
      </div>
    </>
  );
};

/**
 * Format milliseconds to MM:SS display.
 * @param {number} ms
 * @returns {string}
 */
const formatDuration = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
