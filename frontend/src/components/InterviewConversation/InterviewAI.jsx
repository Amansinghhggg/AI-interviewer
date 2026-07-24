import { Bot } from 'lucide-react';
import { CONVERSATION_STATES } from '../../modules/interview/conversation';
import AIAvatar from './AIAvatar';
import AITranscript from './AITranscript';

/**
 * InterviewAI
 *
 * AI Interviewer participant section.
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
    <div className="flex flex-col items-center gap-5">
      {/* AI Header */}
      <div className="flex items-center justify-between w-full mb-8">
        <div className="text-dark-400 text-xs font-bold uppercase tracking-widest">
          AI Interviewer
        </div>
        {/* Status Badge */}
        <div className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors duration-300 flex items-center gap-2 ${
          isError ? 'bg-danger-500/10 text-danger-400' :
          isSpeaking ? 'bg-primary-500/10 text-primary-400' :
          isActive ? 'bg-accent-500/10 text-accent-400' :
          'bg-dark-700/50 text-dark-400'
        }`}>
          {isSpeaking && <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />}
          {statusMessage}
        </div>
      </div>

      {/* Avatar */}
      <AIAvatar conversationState={conversationState} />

      {/* AI Transcript */}
      <div className="w-full max-w-2xl">
        <AITranscript
          transcript={aiTranscript}
          conversationState={conversationState}
          onReplay={onReplay}
        />
      </div>

      {/* Reserved: future waveform visualization */}
      <div className="w-full max-w-md" aria-hidden="true">
        {/* Waveform placeholder for future audio visualization */}
      </div>
    </div>
  );
};

export default InterviewAI;
