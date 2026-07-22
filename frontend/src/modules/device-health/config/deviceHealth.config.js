export const DEVICE_HEALTH_CONFIG = {
  // Polling interval fallback in milliseconds
  FALLBACK_CHECK_INTERVAL: 5000,
  
  // Time to wait (ms) before marking a disconnected device as WARNING/ERROR
  RECOVERY_WINDOW_MS: 3000,
  
  // Maximum number of events to store in in-memory history
  MAX_HISTORY_LENGTH: 50
};
