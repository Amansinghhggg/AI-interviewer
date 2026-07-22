export const VIOLATION_CONFIG = {
  // Face Rules
  noFaceThresholdMs: 5000, // 5 seconds without face triggers violation
  multipleFacesEnabled: true,
  
  // Browser Rules
  pageHiddenEnabled: true,
  blurEnabled: true,
  fullscreenRequired: false,
  offlineEnabled: true,
  
  // Device Rules
  cameraDisconnectEnabled: true,
  microphoneDisconnectEnabled: true
};
