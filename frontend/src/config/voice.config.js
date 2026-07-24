export const VOICE_CONFIG = {
  MAX_RECORDING_DURATION_MS: 60000, // 60 seconds
  MIN_RECORDING_DURATION_MS: 1000,  // 1 second
  VOICE_SILENCE_THRESHOLD: 0.05,    // Amplitude threshold for silence detection (increased to ignore background noise)
  VOICE_SILENCE_WARNING_MS: 1500,   // Wait 1.5s of silence before showing warning
  VOICE_AUTO_STOP_MS: 3000,         // Stop after 3s of total silence
};
