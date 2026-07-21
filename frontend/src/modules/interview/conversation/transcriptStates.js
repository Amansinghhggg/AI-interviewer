/**
 * Transcript States
 *
 * State enum for candidate transcript lifecycle.
 * CandidateTranscript renders based on these states.
 *
 * Transitions:
 *   IDLE → LISTENING → PROCESSING → COMPLETED
 *   any state → IDLE (on new turn)
 */

export const TRANSCRIPT_STATES = {
  /** No transcript activity */
  IDLE: 'IDLE',

  /** Actively listening for candidate speech */
  LISTENING: 'LISTENING',

  /** Processing speech-to-text */
  PROCESSING: 'PROCESSING',

  /** Transcript finalized for current turn */
  COMPLETED: 'COMPLETED',
};
