import { Bot, Loader2, AlertCircle } from 'lucide-react';
import { CONVERSATION_STATES } from '../../modules/interview/conversation';

/**
 * AIAvatar
 *
 * Isolated avatar component for the AI Interviewer.
 * Separated from InterviewAI to allow future replacement
 * with animated or video avatars.
 *
 * Renders state-driven animations:
 * - SPEAKING: pulsing ring + waveform bars
 * - THINKING/PROCESSING: shimmer animation
 * - ERROR: red-tinted state
 * - Default: idle glow
 *
 * @param {object} props
 * @param {string} props.conversationState - CONVERSATION_STATES value
 */
const AIAvatar = ({ conversationState }) => {
  const isSpeaking = conversationState === CONVERSATION_STATES.SPEAKING;
  const isThinking = conversationState === CONVERSATION_STATES.THINKING;
  const isProcessing = conversationState === CONVERSATION_STATES.PROCESSING;
  const isError = conversationState === CONVERSATION_STATES.ERROR;

  // Determine avatar style class
  const getAvatarClass = () => {
    if (isSpeaking) return 'ai-avatar ai-avatar--speaking';
    if (isThinking || isProcessing) return 'ai-avatar ai-avatar--thinking';
    if (isError) return 'ai-avatar ai-avatar--error';
    return 'ai-avatar';
  };

  // Determine icon
  const renderIcon = () => {
    const iconClass = 'w-10 h-10 sm:w-12 sm:h-12 text-white';
    if (isThinking || isProcessing) return <Loader2 className={`${iconClass} animate-spin`} />;
    if (isError) return <AlertCircle className={iconClass} />;
    return <Bot className={iconClass} />;
  };

  return (
    <div className="relative flex items-center gap-4">
      <div className={getAvatarClass()}>
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg relative z-10">
          {renderIcon()}
        </div>
      </div>

      {/* Speaking Waveform Bars */}
      {isSpeaking && (
        <div className="flex items-end gap-1 justify-center mt-3 h-6" aria-hidden="true">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary-400 rounded-full animate-waveform-bar"
              style={{
                animationDelay: `${i * 0.1}s`,
                height: '4px',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAvatar;
