/**
 * Recording Module Configuration
 *
 * Centralized configuration for the Recording module.
 * Controls MIME types, bitrates, timeslice, and media constraints.
 */

export const RECORDING_CONFIG = {
  /**
   * Ordered list of preferred MIME types.
   * The first supported type will be used.
   */
  PREFERRED_MIME_TYPES: [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ],

  /** Video bitrate in bits per second (2.5 Mbps) */
  VIDEO_BITRATE: 2_500_000,

  /** Audio bitrate in bits per second (128 kbps) */
  AUDIO_BITRATE: 128_000,

  /** Interval in ms at which ondataavailable fires */
  TIMESLICE_MS: 1000,

  /** Reserved for future upload sprint — not used in Sprint 1 */
  UPLOAD_INTERVAL_MS: 30_000,

  /** Camera constraints for getUserMedia */
  CAMERA_CONSTRAINTS: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
    facingMode: 'user',
  },

  /** Microphone constraints for getUserMedia */
  MICROPHONE_CONSTRAINTS: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};
