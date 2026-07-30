import React from 'react';
import { CONVERSATION_STATES } from '../../modules/interview/conversation/index';
import AIAvatar from '../../features/interview/components/AIAvatar/AIAvatar';
import { AvatarState } from '../../features/interview/components/AIAvatar/types';
import { Volume2, Loader2, HelpCircle } from 'lucide-react';

const InterviewAI = ({
  currentQuestion,
  currentIndex = 0,
  totalQuestions = 1,
  conversationState,
  statusMessage,
  aiTranscript,
  onReplay,
  audioRef
}) => {
  const isSpeaking = conversationState === CONVERSATION_STATES.SPEAKING;
  const isThinking = conversationState === CONVERSATION_STATES.THINKING || conversationState === CONVERSATION_STATES.ANALYZING;
  const isError = conversationState === CONVERSATION_STATES.ERROR;
  const isActive = isSpeaking || conversationState === CONVERSATION_STATES.LISTENING;

  const getAvatarState = () => {
    if (conversationState === CONVERSATION_STATES.SPEAKING) return AvatarState.SPEAKING;
    if (conversationState === CONVERSATION_STATES.THINKING || conversationState === CONVERSATION_STATES.ANALYZING) return AvatarState.THINKING;
    if (conversationState === CONVERSATION_STATES.LISTENING) return AvatarState.LISTENING;
    return AvatarState.IDLE;
  };

  return (
    <div className="flex flex-col relative w-full h-full p-6 lg:p-8 justify-between gap-5">

      {/* AI Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
          <div className="text-slate-400 text-xs font-bold uppercase tracking-[0.25em]">
            AI Interviewer <span className="text-slate-600">•</span> AI-OS v2.4
          </div>
        </div>
      </div>

      {/* Large Avatar Container */}
      <div className="relative flex-1 w-full rounded-[32px] overflow-hidden border border-slate-800/80 bg-slate-900/60 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center justify-center group">
        <AIAvatar state={getAvatarState()} audioElement={audioRef} />

        {/* Status Badge Overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-3.5 rounded-2xl flex items-center justify-between border border-slate-800/80 shadow-xl z-20">
          <div className="flex items-center gap-2.5">
            <span className="text-slate-300 text-xs font-semibold tracking-wide">
              AI Interviewer
            </span>
          </div>

          <div className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 border ${isError
              ? 'bg-rose-950/40 text-rose-400 border-rose-800/40' :
              isSpeaking
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' :
                isThinking
                  ? 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40' :
                  'bg-slate-900/80 text-slate-400 border-slate-800'
            }`}>
            {isSpeaking && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            {isThinking && <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />}
            <span>{statusMessage || (isSpeaking ? 'AI Speaking' : isThinking ? 'Processing' : 'AI Listening')}</span>
          </div>
        </div>
      </div>

      {/* Bottom - Question Prompt Card */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl relative group w-full">
        <div className="flex items-center gap-2 text-indigo-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
          <span>Current Question</span>
        </div>

        <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-medium pr-12 line-clamp-3">
          "{currentQuestion?.question || "Initializing question..."}"
        </p>

        {onReplay && (
          <button
            onClick={onReplay}
            className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600 hover:text-white border border-slate-700/80 transition-all text-slate-400 shadow-md group/btn"
            title="Replay Audio Prompt"
          >
            <Volume2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};

export default InterviewAI;
