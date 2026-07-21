/**
 * Camera Module Configuration
 *
 * Centralized configuration for the Camera module.
 * Controls video constraints for the interview camera preview.
 */

export const CAMERA_CONFIG = {
  /** Camera constraints for getUserMedia */
  CONSTRAINTS: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 24 },
    facingMode: 'user',
  },
};
