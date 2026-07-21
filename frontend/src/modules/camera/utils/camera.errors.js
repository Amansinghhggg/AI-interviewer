/**
 * Camera Errors
 *
 * Error codes and helper utilities for the Camera module.
 * Mirrors the pattern from recording.errors.js.
 */

export const CAMERA_ERRORS = {
  PERMISSION_DENIED: 'CAMERA_PERMISSION_DENIED',
  NOT_FOUND: 'CAMERA_NOT_FOUND',
  IN_USE: 'CAMERA_IN_USE',
  UNSUPPORTED: 'CAMERA_UNSUPPORTED',
  UNKNOWN: 'CAMERA_UNKNOWN',
};

/**
 * Create a structured camera error object.
 * @param {string} code - CAMERA_ERRORS value
 * @param {string} [message] - Optional custom message
 * @returns {{ code: string, message: string }}
 */
export const createCameraError = (code, message) => ({
  code,
  message: message || getCameraErrorMessage(code),
});

/**
 * Get a human-readable error message for a camera error code.
 * @param {string} code - CAMERA_ERRORS value
 * @returns {string}
 */
export const getCameraErrorMessage = (code) => {
  switch (code) {
    case CAMERA_ERRORS.PERMISSION_DENIED:
      return 'Camera access was denied. Please allow camera permissions in your browser settings.';
    case CAMERA_ERRORS.NOT_FOUND:
      return 'No camera found. Please connect a camera and try again.';
    case CAMERA_ERRORS.IN_USE:
      return 'Your camera is being used by another application.';
    case CAMERA_ERRORS.UNSUPPORTED:
      return 'Your browser does not support camera access.';
    case CAMERA_ERRORS.UNKNOWN:
    default:
      return 'An unexpected camera error occurred.';
  }
};

/**
 * Map a native getUserMedia error to a CAMERA_ERRORS code.
 * @param {Error} err - The native error from getUserMedia
 * @returns {string} CAMERA_ERRORS code
 */
export const mapCameraErrorToCode = (err) => {
  if (!err || !err.name) return CAMERA_ERRORS.UNKNOWN;

  switch (err.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return CAMERA_ERRORS.PERMISSION_DENIED;
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return CAMERA_ERRORS.NOT_FOUND;
    case 'NotReadableError':
    case 'TrackStartError':
      return CAMERA_ERRORS.IN_USE;
    case 'TypeError':
      return CAMERA_ERRORS.UNSUPPORTED;
    default:
      return CAMERA_ERRORS.UNKNOWN;
  }
};
