export const FACE_DETECTION_CONFIG = {
  // Model path inside public folder
  MODEL_PATH: '/models/blaze_face_short_range.tflite',
  
  // Throttle interval (ms) for requestAnimationFrame (e.g. 100ms = 10 FPS)
  DETECTION_INTERVAL_MS: 150,

  // Max events to store in history
  MAX_HISTORY_LENGTH: 50
};
