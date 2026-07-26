import { CONVERSATION_STATES } from '../../modules/interview/conversation/index';
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
      <h2 className="text-3xl sm:text-4xl leading-tight text-[var(--text-primary)] font-bold tracking-tight text-center">
        {transcript}
      </h2>
      <div className="flex items-center justify-center gap-4 mt-8">
        <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-[0.2em] opacity-80">Listen to the question</p>
        {onReplay && (
          <button 
            onClick={onReplay}
            className="p-2 rounded-full bg-[var(--background-secondary)] hover:bg-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm border border-[var(--border)]"
            title="Play Audio"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AITranscript;
