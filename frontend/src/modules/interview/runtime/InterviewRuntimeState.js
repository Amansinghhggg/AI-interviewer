export const INTERVIEW_RUNTIME_STATES = {
  INITIALIZING: 'INITIALIZING',       // Acquiring permissions or prepping runtime
  CAMERA_READY: 'CAMERA_READY',       // Camera acquired, preview available
  RECORDING_READY: 'RECORDING_READY', // Recorder attached to stream and ready
  ACTIVE: 'ACTIVE',                   // Recording active, interview ongoing
  FINISHING: 'FINISHING',             // Transitioning out, stopping recording
  COMPLETED: 'COMPLETED',             // Resources cleaned, finalize session
  ERROR: 'ERROR'                      // Fatal runtime error (e.g. camera denied)
};

export const INTERVIEW_RUNTIME_EVENTS = {
  RUNTIME_INITIALIZING: 'runtimeInitializing',
  CAMERA_READY: 'cameraReady',
  RECORDING_READY: 'recordingReady',
  RUNTIME_STARTED: 'runtimeStarted',
  RUNTIME_STOPPED: 'runtimeStopped',
  RUNTIME_DESTROYED: 'runtimeDestroyed',
  RUNTIME_ERROR: 'runtimeError'
};
