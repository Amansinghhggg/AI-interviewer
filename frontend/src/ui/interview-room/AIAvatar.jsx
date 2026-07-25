import { Bot, AlertCircle } from 'lucide-react';
import { CONVERSATION_STATES } from '../../modules/interview/conversation/index';

/**
 * AIAvatar
 *
 * Isolated avatar component for the Intervu AI.
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
  const isError = conversationState === CONVERSATION_STATES.ERROR;

  // Determine outer ring class based on state
  const getRingClass = () => {
    if (isSpeaking) return 'border-[var(--color-accent-blue)] shadow-[var(--color-accent-blue-glow)] shadow-lg animate-pulse';
    if (isThinking) return 'border-[var(--color-accent-violet)] shadow-[var(--color-accent-violet-glow)] shadow-lg opacity-80';
    if (isError) return 'border-[var(--color-accent-red)] shadow-lg opacity-80';
    return 'border-[var(--color-border-active)] shadow-sm opacity-50';
  };

  // Determine icon
  const renderIcon = () => {
    const iconClass = 'w-10 h-10 sm:w-14 sm:h-14 text-white transition-transform duration-500 relative z-10';
    if (isError) return <AlertCircle className={iconClass} />;
    return <Bot className={`${iconClass} ${isThinking ? 'animate-pulse' : ''}`} />;
  };

  return (
    <div className="relative flex flex-col items-center gap-6">
      {/* Outer Pulse Rings for Speaking state */}
      <div className="relative flex items-center justify-center">
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full border border-[var(--color-accent-blue)] opacity-50 animate-ping" style={{ animationDuration: '2s' }}></div>
            <div className="absolute inset-0 rounded-full border border-[var(--color-accent-blue)] opacity-30 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
          </>
        )}
        
        {/* Core Avatar Circle */}
        <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${getRingClass()} ${isThinking ? 'bg-gradient-to-br from-[var(--color-accent-violet)] to-[var(--color-accent-blue)]' : isError ? 'bg-[var(--color-accent-red)]' : 'bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-teal)]'}`}>
          {/* Glassmorphic inner layer */}
          <div className="absolute inset-2 rounded-full bg-[var(--color-bg-overlay)] backdrop-blur-md flex items-center justify-center z-0"></div>
          
          {/* Inner Glow */}
          <div className="absolute inset-0 rounded-full bg-white opacity-10 z-0"></div>
          
          {renderIcon()}
        </div>
      </div>

      {/* Speaking Waveform Bars */}
      <div className="flex items-end gap-1.5 justify-center h-8 w-32" aria-hidden="true">
        {isSpeaking ? (
          [...Array(7)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-[var(--color-accent-blue)] rounded-full animate-waveform-bar shadow-[var(--color-accent-blue-glow)] shadow-sm"
              style={{
                animationDelay: `${i * 0.1}s`,
                height: '8px',
              }}
            />
          ))
        ) : (
          <div className="w-full h-1 bg-[var(--color-border-subtle)] rounded-full"></div>
        )}
      </div>
    </div>
  );
};

export default AIAvatar;
