/**
 * CameraService
 *
 * Framework-agnostic service for managing camera MediaStream.
 * All methods are static — no React dependency.
 *
 * This service handles the raw browser API interactions.
 * The useCamera hook wraps this service for React consumption.
 */

import { CAMERA_CONFIG } from '../config/camera.config';

export const CameraService = {
  /**
   * Start the camera and return a MediaStream.
   *
   * @param {MediaTrackConstraints} [constraints] - Override default constraints
   * @returns {Promise<MediaStream>} The camera MediaStream
   * @throws {Error} Native getUserMedia errors (mapped by caller)
   */
  startCamera: async (constraints) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw Object.assign(new Error('getUserMedia not supported'), { name: 'TypeError' });
    }

    const videoConstraints = constraints || CAMERA_CONFIG.CONSTRAINTS;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: false, // Camera module is video-only; audio is handled by voice module
    });

    return stream;
  },

  /**
   * Stop all tracks in a MediaStream and release the camera.
   *
   * @param {MediaStream|null} stream - The stream to stop
   */
  stopCamera: (stream) => {
    if (!stream) return;

    stream.getTracks().forEach((track) => {
      track.stop();
      track.enabled = false;
    });
  },
};
