import { Mic } from 'lucide-react';
import { CONVERSATION_STATES } from '../../modules/interview/conversation/index';

/**
 * CandidateStatus
 *
 * Displays the candidate's current status in the conversation.
 * Independently reusable — shows listening indicator, mic state,
 * and contextual status messages.
 *
 * @param {object} props
 * @param {string} props.conversationState - CONVERSATION_STATES value
 */
const CandidateStatus = ({ conversationState }) => {
  const isListening = conversationState === CONVERSATION_STATES.LISTENING;
  const isSpeaking = conversationState === CONVERSATION_STATES.SPEAKING;
  const isProcessing = conversationState === CONVERSATION_STATES.PROCESSING;

  const getStatusText = () => {
    if (isListening) return 'Ready to listen';
    if (isSpeaking) return 'Listen to the question';
    if (isProcessing) return 'Processing...';
    return 'Standing by';
  };

  const getStatusColor = () => {
    if (isListening) return 'text-[var(--color-success)]';
    if (isProcessing) return 'text-[var(--primary)]';
    return 'text-[var(--text-secondary)]';
  };

  return (
    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${getStatusColor()} transition-colors duration-300`}>
      {isListening && (
        <div className="relative">
          <Mic className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[var(--color-success)] rounded-full animate-listening-glow shadow-md" />
        </div>
      )}
      <span>{getStatusText()}</span>
    </div>
  );
};

export default CandidateStatus;
