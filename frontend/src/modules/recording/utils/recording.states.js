/**
 * Recording States
 *
 * Finite state enum for the recording lifecycle.
 *
 * Transitions:
 *   IDLE → INITIALIZING → RECORDING ⇄ PAUSED → STOPPED
 *   any state → ERROR
 */

export const RECORDING_STATES = {
  /** No recording active, module idle */
  IDLE: 'IDLE',

  /** Acquiring permissions and setting up MediaRecorder */
  INITIALIZING: 'INITIALIZING',

  /** Actively recording media */
  RECORDING: 'RECORDING',

  /** Recording paused, can be resumed */
  PAUSED: 'PAUSED',

  /** Recording stopped, session finalized */
  STOPPED: 'STOPPED',

  /** An error occurred */
  ERROR: 'ERROR',
};
