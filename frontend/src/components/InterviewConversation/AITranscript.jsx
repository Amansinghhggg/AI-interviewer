import { CONVERSATION_STATES } from '../../modules/interview/conversation';

/**
 * AITranscript
 *
 * Renders the AI's spoken question text.
 * Shows with a fade-in animation when visible.
 *
 * Reserved layout for future word-by-word highlighting
 * and speech synchronization — currently renders full text.
 *
 * @param {object} props
 * @param {string} props.transcript - The question text to display
 * @param {string} props.conversationState - CONVERSATION_STATES value
 */
const AITranscript = ({ transcript, conversationState }) => {
  const isVisible = transcript && (
    conversationState === CONVERSATION_STATES.SPEAKING ||
    conversationState === CONVERSATION_STATES.LISTENING ||
    conversationState === CONVERSATION_STATES.PROCESSING
  );

  if (!isVisible) return null;

  return (
    <div className="animate-fade-in-up mt-6">
      <h2 className="text-3xl sm:text-4xl leading-tight text-white font-semibold tracking-tight">
        {transcript}
      </h2>
      <p className="text-xs text-dark-500 mt-6 font-medium uppercase tracking-widest opacity-60">Listen to the question</p>
    </div>
  );
};

export default AITranscript;
