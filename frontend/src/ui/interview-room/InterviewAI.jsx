import { CONVERSATION_STATES } from '../../modules/interview/conversation/index';
import AIAvatar from '../../features/interview/components/AIAvatar/AIAvatar';
import { AvatarState } from '../../features/interview/components/AIAvatar/types';
import { Volume2, Loader2 } from 'lucide-react';

const InterviewAI = ({ 
  currentQuestion,
  currentIndex,
  totalQuestions,
  conversationState, 
  statusMessage, 
  aiTranscript, 
  onReplay,
  audioRef
}) => {
  const isSpeaking = conversationState === CONVERSATION_STATES.SPEAKING;
  const isError = conversationState === CONVERSATION_STATES.ERROR;
  const isActive = isSpeaking || conversationState === CONVERSATION_STATES.LISTENING;

  const getAvatarState = () => {
    if (conversationState === CONVERSATION_STATES.SPEAKING) return AvatarState.SPEAKING;
    if (conversationState === CONVERSATION_STATES.THINKING || conversationState === CONVERSATION_STATES.ANALYZING) return AvatarState.THINKING;
    if (conversationState === CONVERSATION_STATES.LISTENING) return AvatarState.LISTENING;
    return AvatarState.IDLE;
  };

  return (
    <div className="flex flex-col relative w-full h-full p-6">
      {/* AI Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
        <div className="text-[var(--text-secondary)] text-sm font-bold uppercase tracking-[0.2em]">
          InterviewOS
        </div>
      </div>

      {/* Center - Avatar Engine */}
      <div className="flex flex-col items-center justify-center flex-1">
        <AIAvatar state={getAvatarState()} audioElement={audioRef} />
        
        {/* Status Badge */}
        <div className={`mt-6 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-3 border ${
          isError ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20' :
          isSpeaking ? 'bg-[#000000] text-[var(--primary)] border-[var(--primary)]/30' :
          isActive ? 'bg-[#000000] text-[var(--text-secondary)] border-[var(--border)]' :
          'bg-[#000000] text-[var(--text-secondary)] border-[var(--border)]'
        }`}>
          {isSpeaking && <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />}
          {(conversationState === CONVERSATION_STATES.ANALYZING || conversationState === CONVERSATION_STATES.THINKING) && <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--text-secondary)]" />}
          {statusMessage}
        </div>
      </div>

      {/* Bottom - Question Card */}
      <div className="mt-auto bg-[#131316] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl relative group">
        <p className="text-white/90 text-lg leading-relaxed font-medium pr-12">
          "{currentQuestion?.question || "..."}"
        </p>
        <button
          onClick={onReplay}
          className="absolute top-1/2 -translate-y-1/2 right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
          title="Repeat Question"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default InterviewAI;
