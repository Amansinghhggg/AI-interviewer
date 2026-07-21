/**
 * Camera Module — Public API
 *
 * Self-contained camera infrastructure for the interview camera preview.
 * Provides video-only camera access — no recording, no monitoring.
 */

// Hook
export { useCamera } from './hooks/useCamera';

// Services
export { CameraService } from './services/camera.service';

// Components
export { InterviewCamera } from './components/InterviewCamera';

// States & Errors
export { CAMERA_STATES } from './utils/camera.states';
export {
  CAMERA_ERRORS,
  createCameraError,
  getCameraErrorMessage,
  mapCameraErrorToCode,
} from './utils/camera.errors';

// Health
export { CameraHealth } from './utils/camera.health';

// Config
export { CAMERA_CONFIG } from './config/camera.config';
