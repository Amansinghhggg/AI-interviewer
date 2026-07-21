/**
 * DeviceService
 *
 * Framework-agnostic service for enumerating and detecting
 * camera and microphone devices.
 *
 * All methods are static — no instantiation needed.
 * Device labels are empty strings until permissions are granted (browser security).
 */

export const DeviceService = {
  /**
   * Get all available video input devices (cameras).
   * @returns {Promise<MediaDeviceInfo[]>}
   */
  getVideoDevices: async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return [];
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === 'videoinput');
  },

  /**
   * Get all available audio input devices (microphones).
   * @returns {Promise<MediaDeviceInfo[]>}
   */
  getAudioDevices: async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return [];
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === 'audioinput');
  },

  /**
   * Check if at least one camera is available.
   * @returns {Promise<boolean>}
   */
  hasCamera: async () => {
    const cameras = await DeviceService.getVideoDevices();
    return cameras.length > 0;
  },

  /**
   * Check if at least one microphone is available.
   * @returns {Promise<boolean>}
   */
  hasMicrophone: async () => {
    const mics = await DeviceService.getAudioDevices();
    return mics.length > 0;
  },

  /**
   * Check if the browser supports the MediaRecorder API.
   * @returns {boolean}
   */
  isMediaRecorderSupported: () => {
    return !!(
      typeof window !== 'undefined' &&
      window.MediaRecorder &&
      navigator.mediaDevices?.getUserMedia
    );
  },
};
