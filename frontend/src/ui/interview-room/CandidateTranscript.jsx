import React from 'react';
import { Trash2, Mic } from 'lucide-react';
import { TRANSCRIPT_STATES } from '../../modules/interview/conversation/index';

/**
 * CandidateTranscript
 *
 * Renders the candidate's live answer text (STT transcription).
 */
const CandidateTranscript = ({ transcript, transcriptState, onClearAnswer }) => {
  const isListening = transcriptState === TRANSCRIPT_STATES.LISTENING;
  const isProcessing = transcriptState === TRANSCRIPT_STATES.PROCESSING;
  const hasTranscript = transcript && transcript.trim().length > 0;

  return (
    <div className="flex flex-col justify-center h-full relative z-10 w-full">
      {/* Listening Indicator */}
      {isListening && !hasTranscript && (
        <div className="flex items-center gap-3 text-emerald-400 font-semibold text-xs tracking-wider uppercase animate-fade-in">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
            <Mic className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          </div>
          <span>Listening to your response...</span>
          <div className="flex items-end gap-1 h-3 ml-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 bg-emerald-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s`, height: '100%' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && !hasTranscript && (
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          <span>Processing transcription...</span>
        </div>
      )}

      {/* Transcript Text */}
      {hasTranscript ? (
        <div className="relative group/transcript flex items-center justify-between gap-4">
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium line-clamp-2">
            "{transcript}"
            {isListening && (
              <span className="inline-block w-1.5 h-4 bg-emerald-400 ml-1.5 align-middle animate-pulse" />
            )}
          </p>
          {!isListening && onClearAnswer && (
            <button 
              onClick={onClearAnswer}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all flex-shrink-0"
              title="Clear response"
              aria-label="Clear answer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        !isListening && !isProcessing && (
          <p className="text-xs text-slate-500 italic">
            Your spoken response will appear here in real-time...
          </p>
        )
      )}
    </div>
  );
};

export default CandidateTranscript;
