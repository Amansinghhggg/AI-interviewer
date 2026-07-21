/**
 * CameraHealth
 *
 * Lightweight utility for checking camera stream health.
 * Exposes simple boolean checks that can be called by
 * future monitoring modules.
 *
 * No monitoring logic — prepares the abstraction only.
 */

export const CameraHealth = {
  /**
   * Check if a MediaStream is active and has at least one active track.
   * @param {MediaStream|null} stream
   * @returns {boolean}
   */
  streamActive: (stream) => {
    if (!stream) return false;
    return stream.active && stream.getTracks().some((track) => track.readyState === 'live');
  },

  /**
   * Check if a MediaStream has at least one video track.
   * @param {MediaStream|null} stream
   * @returns {boolean}
   */
  hasVideoTrack: (stream) => {
    if (!stream) return false;
    return stream.getVideoTracks().length > 0;
  },

  /**
   * Check if camera permission has been granted.
   * Uses the Permissions API where available; falls back to false.
   * @returns {Promise<boolean>}
   */
  permissionGranted: async () => {
    try {
      if (!navigator.permissions?.query) return false;
      const result = await navigator.permissions.query({ name: 'camera' });
      return result.state === 'granted';
    } catch {
      // Permissions API may not support 'camera' in all browsers
      return false;
    }
  },
};
