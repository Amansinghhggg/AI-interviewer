export const VOICE_CONFIG = {
  MAX_RECORDING_DURATION_MS: 60000, // 60 seconds
  MIN_RECORDING_DURATION_MS: 1000,  // 1 second
  VOICE_SILENCE_THRESHOLD: 0.02,    // Amplitude threshold for silence detection
  VOICE_SILENCE_WARNING_MS: 2000,   // Wait 2s of silence before showing warning
  VOICE_AUTO_STOP_MS: 5000,         // Stop after 5s of total silence
};
