export const DEVICE_HEALTH_STATES = {
  INITIALIZING: 'INITIALIZING',
  HEALTHY: 'HEALTHY',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  DISCONNECTED: 'DISCONNECTED',
  RECOVERING: 'RECOVERING'
};

export const DEVICE_HEALTH_EVENTS = {
  CAMERA_STARTED: 'cameraStarted',
  CAMERA_DISCONNECTED: 'cameraDisconnected',
  CAMERA_RECOVERED: 'cameraRecovered',
  MICROPHONE_DISCONNECTED: 'microphoneDisconnected',
  MICROPHONE_RECOVERED: 'microphoneRecovered',
  CAMERA_PERMISSION_REVOKED: 'cameraPermissionRevoked',
  MICROPHONE_PERMISSION_REVOKED: 'microphonePermissionRevoked',
  DEVICE_CHANGED: 'deviceChanged'
};
