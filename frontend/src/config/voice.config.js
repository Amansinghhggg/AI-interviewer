export const VOICE_CONFIG = {
  MAX_RECORDING_DURATION_MS: 120000, // 120 seconds (increased from 60s)
  MIN_RECORDING_DURATION_MS: 1000,  // 1 second
  VOICE_SILENCE_THRESHOLD: 0.1,    // Amplitude threshold for silence detection (increased from 0.05 to ignore background noise)
  VOICE_SILENCE_WARNING_MS: 2000,   // Wait 2s of silence before showing warning
  VOICE_AUTO_STOP_MS: 4000,         // Stop after 4s of total silence AFTER they have spoken
  VOICE_INITIAL_SILENCE_MS: 15000,  // Wait 15s before auto-stopping if they haven't started speaking at all
};
