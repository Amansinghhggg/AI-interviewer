/**
 * Recording Module — Public API
 *
 * Self-contained recording infrastructure for capturing
 * camera + microphone media during interviews.
 */

// Hook
export { useRecording } from './hooks/useRecording';

// Services
export { MediaRecordingService } from './services/mediaRecording.service';
export { DeviceService } from './services/device.service';

// Components
export { RecordingIndicator } from './components/RecordingIndicator';
export { VideoPreview } from './components/VideoPreview';

// State & Errors
export { RECORDING_STATES } from './utils/recording.states';
export {
  RECORDING_ERRORS,
  createRecordingError,
  getRecordingErrorMessage,
  mapMediaErrorToCode,
} from './utils/recording.errors';

// Model
export {
  createRecordingSession,
  finalizeRecordingSession,
} from './utils/RecordingSession';

// Config
export { RECORDING_CONFIG } from './config/recording.config';
