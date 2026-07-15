export const VoiceErrors = {
  PERMISSION_DENIED: "PERMISSION_DENIED",
  PERMISSION_BLOCKED: "PERMISSION_BLOCKED",
  MIC_NOT_FOUND: "MIC_NOT_FOUND",
  MIC_IN_USE: "MIC_IN_USE",
  DEVICE_DISCONNECTED: "DEVICE_DISCONNECTED",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  UNSUPPORTED_BROWSER: "UNSUPPORTED_BROWSER",
  NOT_SUPPORTED: "NOT_SUPPORTED",
  UNKNOWN: "UNKNOWN",
};

export const getVoiceErrorMessage = (code) => {
  switch (code) {
    case VoiceErrors.PERMISSION_DENIED:
    case VoiceErrors.PERMISSION_BLOCKED:
      return "Microphone access was denied. Please allow microphone access in your browser settings to record.";
    case VoiceErrors.MIC_NOT_FOUND:
    case VoiceErrors.DEVICE_DISCONNECTED:
      return "No microphone found. Please connect a microphone and try again.";
    case VoiceErrors.MIC_IN_USE:
      return "Microphone is currently in use by another application.";
    case VoiceErrors.UPLOAD_FAILED:
      return "Failed to transcribe audio. Please try again.";
    case VoiceErrors.NETWORK_ERROR:
      return "Network error occurred. Please check your connection.";
    case VoiceErrors.TIMEOUT:
      return "Request timed out. Please try again.";
    case VoiceErrors.UNSUPPORTED_BROWSER:
    case VoiceErrors.NOT_SUPPORTED:
      return "Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.";
    default:
      return "An unknown error occurred. Please try again.";
  }
};
