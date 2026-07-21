/**
 * Recording Errors
 *
 * Structured error codes, human-readable messages, and factory function
 * for all recording failure scenarios.
 */

export const RECORDING_ERRORS = {
  MEDIA_RECORDER_NOT_SUPPORTED: 'MEDIA_RECORDER_NOT_SUPPORTED',
  CAMERA_NOT_FOUND: 'CAMERA_NOT_FOUND',
  MICROPHONE_NOT_FOUND: 'MICROPHONE_NOT_FOUND',
  CAMERA_PERMISSION_DENIED: 'CAMERA_PERMISSION_DENIED',
  MICROPHONE_PERMISSION_DENIED: 'MICROPHONE_PERMISSION_DENIED',
  PERMISSION_DISMISSED: 'PERMISSION_DISMISSED',
  DEVICE_IN_USE: 'DEVICE_IN_USE',
  OVERCONSTRAINED: 'OVERCONSTRAINED',
  NO_SUPPORTED_MIME_TYPE: 'NO_SUPPORTED_MIME_TYPE',
  RECORDER_ERROR: 'RECORDER_ERROR',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Maps error codes to human-readable messages.
 */
const ERROR_MESSAGES = {
  [RECORDING_ERRORS.MEDIA_RECORDER_NOT_SUPPORTED]:
    'Your browser does not support media recording. Please use a modern browser like Chrome, Firefox, or Edge.',
  [RECORDING_ERRORS.CAMERA_NOT_FOUND]:
    'No camera found. Please connect a camera and try again.',
  [RECORDING_ERRORS.MICROPHONE_NOT_FOUND]:
    'No microphone found. Please connect a microphone and try again.',
  [RECORDING_ERRORS.CAMERA_PERMISSION_DENIED]:
    'Camera access was denied. Please allow camera access in your browser settings.',
  [RECORDING_ERRORS.MICROPHONE_PERMISSION_DENIED]:
    'Microphone access was denied. Please allow microphone access in your browser settings.',
  [RECORDING_ERRORS.PERMISSION_DISMISSED]:
    'Permission prompt was dismissed. Please try again and grant camera and microphone access.',
  [RECORDING_ERRORS.DEVICE_IN_USE]:
    'Camera or microphone is currently in use by another application. Please close other apps and try again.',
  [RECORDING_ERRORS.OVERCONSTRAINED]:
    'Camera does not support the requested resolution or frame rate. Try a different camera.',
  [RECORDING_ERRORS.NO_SUPPORTED_MIME_TYPE]:
    'No supported video format found in your browser. Please use a modern browser.',
  [RECORDING_ERRORS.RECORDER_ERROR]:
    'An error occurred during recording. Please try again.',
  [RECORDING_ERRORS.UNKNOWN]:
    'An unexpected error occurred. Please try again.',
};

/**
 * Maps error codes to whether the error is recoverable.
 * Recoverable errors can be retried by the user (e.g., granting permissions).
 */
const RECOVERABLE_MAP = {
  [RECORDING_ERRORS.MEDIA_RECORDER_NOT_SUPPORTED]: false,
  [RECORDING_ERRORS.CAMERA_NOT_FOUND]: true,
  [RECORDING_ERRORS.MICROPHONE_NOT_FOUND]: true,
  [RECORDING_ERRORS.CAMERA_PERMISSION_DENIED]: true,
  [RECORDING_ERRORS.MICROPHONE_PERMISSION_DENIED]: true,
  [RECORDING_ERRORS.PERMISSION_DISMISSED]: true,
  [RECORDING_ERRORS.DEVICE_IN_USE]: true,
  [RECORDING_ERRORS.OVERCONSTRAINED]: true,
  [RECORDING_ERRORS.NO_SUPPORTED_MIME_TYPE]: false,
  [RECORDING_ERRORS.RECORDER_ERROR]: true,
  [RECORDING_ERRORS.UNKNOWN]: true,
};

/**
 * Get the human-readable message for an error code.
 * @param {string} code - RECORDING_ERRORS value
 * @returns {string}
 */
export const getRecordingErrorMessage = (code) => {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[RECORDING_ERRORS.UNKNOWN];
};

/**
 * Create a structured recording error object.
 * @param {string} code - RECORDING_ERRORS value
 * @param {Error} [originalError] - The original browser error, if any
 * @returns {{ code: string, message: string, recoverable: boolean, originalError?: Error }}
 */
export const createRecordingError = (code, originalError = null) => {
  const errorCode = RECORDING_ERRORS[code] ? code : RECORDING_ERRORS.UNKNOWN;

  return {
    code: errorCode,
    message: getRecordingErrorMessage(errorCode),
    recoverable: RECOVERABLE_MAP[errorCode] ?? true,
    ...(originalError && { originalError }),
  };
};

/**
 * Map a browser getUserMedia error to a recording error code.
 * @param {Error} error - The browser error
 * @returns {string} RECORDING_ERRORS value
 */
export const mapMediaErrorToCode = (error) => {
  if (!error || !error.name) return RECORDING_ERRORS.UNKNOWN;

  switch (error.name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      // Browser doesn't distinguish camera vs mic denial in getUserMedia
      // when requesting both — we report it as camera since that's the
      // primary constraint. The hook can refine this if needed.
      return RECORDING_ERRORS.CAMERA_PERMISSION_DENIED;

    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return RECORDING_ERRORS.CAMERA_NOT_FOUND;

    case 'NotReadableError':
    case 'TrackStartError':
      return RECORDING_ERRORS.DEVICE_IN_USE;

    case 'OverconstrainedError':
      return RECORDING_ERRORS.OVERCONSTRAINED;

    case 'AbortError':
      return RECORDING_ERRORS.PERMISSION_DISMISSED;

    default:
      return RECORDING_ERRORS.UNKNOWN;
  }
};
