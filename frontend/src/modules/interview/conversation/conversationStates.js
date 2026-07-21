/**
 * Conversation States
 *
 * Finite state enum for the conversational interview lifecycle.
 * Components render based on these states instead of scattered boolean flags.
 *
 * This model is independent from UI components — it lives in the
 * interview conversation domain module.
 *
 * Transitions:
 *   WAITING → THINKING → SPEAKING → LISTENING → PROCESSING → THINKING → ...
 *   any state → ERROR
 */

export const CONVERSATION_STATES = {
  /** AI is generating the next question */
  THINKING: 'THINKING',

  /** AI is speaking the question aloud */
  SPEAKING: 'SPEAKING',

  /** Candidate's turn to respond */
  LISTENING: 'LISTENING',

  /** Idle — between states, initial load */
  WAITING: 'WAITING',

  /** Candidate answer submitted, awaiting next question */
  PROCESSING: 'PROCESSING',

  /** Voice or generation error occurred */
  ERROR: 'ERROR',
};

/**
 * Human-readable status messages for each conversation state.
 * These are conversational — not generic loader text.
 */
export const CONVERSATION_STATUS_MESSAGES = {
  [CONVERSATION_STATES.THINKING]: 'Preparing your next question...',
  [CONVERSATION_STATES.SPEAKING]: 'Listen carefully...',
  [CONVERSATION_STATES.LISTENING]: 'Your turn to respond',
  [CONVERSATION_STATES.WAITING]: 'Getting ready...',
  [CONVERSATION_STATES.PROCESSING]: 'Analyzing your answer...',
  [CONVERSATION_STATES.ERROR]: 'Something went wrong. The interview will continue.',
};
