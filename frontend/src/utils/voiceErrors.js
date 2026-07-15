export const VoiceErrors = {
  PERMISSION_DENIED: "PERMISSION_DENIED",
  MIC_NOT_FOUND: "MIC_NOT_FOUND",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT: "TIMEOUT",
  UNSUPPORTED_BROWSER: "UNSUPPORTED_BROWSER",
  UNKNOWN: "UNKNOWN",
};

export const getVoiceErrorMessage = (code) => {
  switch (code) {
    case VoiceErrors.PERMISSION_DENIED:
      return "Microphone access was denied. Please allow microphone access to record.";
    case VoiceErrors.MIC_NOT_FOUND:
      return "No microphone found. Please connect a microphone and try again.";
    case VoiceErrors.UPLOAD_FAILED:
      return "Failed to upload the recording. Please try again.";
    case VoiceErrors.NETWORK_ERROR:
      return "Network error occurred. Please check your connection.";
    case VoiceErrors.TIMEOUT:
      return "Request timed out. Please try again.";
    case VoiceErrors.UNSUPPORTED_BROWSER:
      return "Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.";
    default:
      return "An unknown error occurred. Please try again.";
  }
};
