/**
 * ConversationTurn Model
 *
 * Domain model representing a single conversation turn in the interview.
 * Independent from UI — this is a data model that future fields
 * (timestamps, evaluation, audio, metadata) can extend without
 * changing component APIs.
 *
 * Used by ConversationController to create turns and pass
 * individual fields to presentational components.
 */

/**
 * Create a ConversationTurn from interview state.
 *
 * @param {object} params
 * @param {object|null} params.question - Current question object from useInterview
 * @param {string} params.candidateAnswer - The answer text for this question
 * @param {string} params.conversationState - CONVERSATION_STATES value
 * @param {string} params.transcriptState - TRANSCRIPT_STATES value
 * @returns {ConversationTurn}
 */
export const createConversationTurn = ({
  question = null,
  candidateAnswer = '',
  conversationState = 'WAITING',
  transcriptState = 'IDLE',
} = {}) => ({
  /** The AI's spoken question text */
  aiTranscript: question?.question || '',

  /** The candidate's answer text (from voice transcription or typing) */
  candidateTranscript: candidateAnswer || '',

  /** Current conversation state */
  conversationState,

  /** Current transcript state */
  transcriptState,

  /** Metadata about the current question */
  questionMeta: {
    id: question?.id || null,
    topic: question?.topic || null,
    difficulty: question?.difficulty || null,
  },

  // ─── Reserved for future sprints ───────────────

  /** Reserved: timestamp when the AI question was delivered */
  aiTimestamp: null,

  /** Reserved: timestamp when the candidate started responding */
  candidateTimestamp: null,

  /** Reserved: evaluation data from AI scoring */
  evaluation: null,

  /** Reserved: audio blob/URL for the AI question */
  aiAudio: null,

  /** Reserved: audio blob/URL for the candidate answer */
  candidateAudio: null,

  /** Reserved: additional metadata (duration, confidence, etc.) */
  metadata: null,
});
