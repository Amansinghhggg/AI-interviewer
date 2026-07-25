import { Bot } from 'lucide-react';
import { CONVERSATION_STATES } from '../../modules/interview/conversation/index';
import AIAvatar from './AIAvatar';
import AITranscript from './AITranscript';

/**
 * InterviewAI
 *
 * Intervu AI participant section.
 * Composes: AIAvatar + AITranscript + Status.
 * Purely presentational — receives all state through props.
 *
 * @param {object} props
 * @param {string} props.conversationState - CONVERSATION_STATES value
 * @param {string} props.statusMessage - Human-readable status text
 * @param {string} props.aiTranscript - The current question text
 */
const InterviewAI = ({ conversationState, statusMessage, aiTranscript, onReplay }) => {
  const isSpeaking = conversationState === CONVERSATION_STATES.SPEAKING;
  const isError = conversationState === CONVERSATION_STATES.ERROR;
  const isActive = isSpeaking || conversationState === CONVERSATION_STATES.LISTENING;

  return (
    <div className="flex flex-col items-center gap-6 relative w-full h-full justify-center">
      {/* AI Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between w-full">
        <div className="text-[var(--color-text-muted)] text-sm font-bold uppercase tracking-[0.2em]">
          Intervu AI
        </div>
        {/* Status Badge */}
        <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-3 border ${
          isError ? 'bg-[rgba(244,63,94,0.1)] text-[var(--color-accent-red)] border-[rgba(244,63,94,0.2)]' :
          isSpeaking ? 'bg-[rgba(79,142,247,0.15)] text-[var(--color-accent-blue)] border-[rgba(79,142,247,0.3)] shadow-[var(--color-accent-blue-glow)] shadow-md' :
          isActive ? 'bg-[rgba(139,92,246,0.1)] text-[var(--color-accent-violet)] border-[rgba(139,92,246,0.2)]' :
          'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]'
        }`}>
          {isSpeaking && <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-blue)] animate-pulse shadow-[var(--color-accent-blue-glow)] shadow-sm" />}
          {statusMessage}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-4xl pt-16 h-full min-h-[400px]">
        {/* Avatar */}
        <div className="mb-12">
          <AIAvatar conversationState={conversationState} />
        </div>

        {/* AI Transcript */}
        <div className="w-full max-w-3xl">
          <AITranscript
            transcript={aiTranscript}
            conversationState={conversationState}
            onReplay={onReplay}
          />
        </div>
      </div>
    </div>
  );
};

export default InterviewAI;
