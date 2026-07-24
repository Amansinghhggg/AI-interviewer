import { CONVERSATION_STATES } from '../../modules/interview/conversation';
import { Volume2 } from 'lucide-react';

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
 * @param {function} props.onReplay - Callback to replay the audio
 */
const AITranscript = ({ transcript, conversationState, onReplay }) => {
  const isVisible = transcript && (
    conversationState === CONVERSATION_STATES.SPEAKING ||
    conversationState === CONVERSATION_STATES.LISTENING ||
    conversationState === CONVERSATION_STATES.THINKING
  );

  return (
    <div 
      className={`mt-6 transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      <h2 className="text-3xl sm:text-4xl leading-tight text-white font-semibold tracking-tight">
        {transcript}
      </h2>
      <div className="flex items-center gap-3 mt-6">
        <p className="text-xs text-dark-500 font-medium uppercase tracking-widest opacity-60">Listen to the question</p>
        {onReplay && (
          <button 
            onClick={onReplay}
            className="p-1.5 rounded-full bg-dark-700/50 hover:bg-dark-600 text-dark-300 hover:text-dark-100 transition-colors"
            title="Play Audio"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AITranscript;
