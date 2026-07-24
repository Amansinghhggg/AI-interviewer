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
  /** AI is generating next question, transcribing, or synthesizing speech */
  THINKING: 'THINKING',

  /** AI is speaking the question aloud */
  SPEAKING: 'SPEAKING',

  /** Candidate's turn to respond */
  LISTENING: 'LISTENING',

  /** Initial load / waiting for start */
  WAITING: 'WAITING',

  /** Error state */
  ERROR: 'ERROR',
};

/**
 * Human-readable status messages for each conversation state.
 */
export const CONVERSATION_STATUS_MESSAGES = {
  [CONVERSATION_STATES.THINKING]: 'Thinking...',
  [CONVERSATION_STATES.SPEAKING]: 'Speaking...',
  [CONVERSATION_STATES.LISTENING]: 'Listening...',
  [CONVERSATION_STATES.WAITING]: 'Getting ready...',
  [CONVERSATION_STATES.ERROR]: 'Connection issue',
};
