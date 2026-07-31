export const FACE_DETECTION_CONFIG = {
  // Model path inside public folder
  MODEL_PATH: '/models/blaze_face_short_range.tflite',

  // Throttle interval (ms) for detection loop (250ms = 4 FPS to preserve CPU/GPU battery)
  DETECTION_INTERVAL_MS: 250,

  // Max events to store in history
  MAX_HISTORY_LENGTH: 50
};
