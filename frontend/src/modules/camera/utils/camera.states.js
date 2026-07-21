/**
 * Camera States
 *
 * Finite state enum for the camera lifecycle.
 *
 * Transitions:
 *   IDLE → INITIALIZING → ACTIVE
 *   any state → ERROR
 */

export const CAMERA_STATES = {
  /** Camera not initialized */
  IDLE: 'IDLE',

  /** Acquiring permissions and setting up stream */
  INITIALIZING: 'INITIALIZING',

  /** Stream is ready and flowing */
  ACTIVE: 'ACTIVE',

  /** Permission denied or device unavailable */
  ERROR: 'ERROR',
};
