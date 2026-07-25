import { Trash2 } from 'lucide-react';
import { TRANSCRIPT_STATES } from '../../modules/interview/conversation/index';

/**
 * CandidateTranscript
 *
 * Renders the candidate's answer text (from STT or typing).
 * Renders based on TranscriptStatus states (LISTENING, PROCESSING, COMPLETED).
 *
 * Reserved for future:
 * - Live streaming transcript
 * - Edit transcript
 * - Confidence indicators
 *
 * @param {object} props
 * @param {string} props.transcript - The candidate's answer text
 * @param {string} props.transcriptState - TRANSCRIPT_STATES value
 * @param {function} props.onClearAnswer - Callback to clear transcript
 */
const CandidateTranscript = ({ transcript, transcriptState, onClearAnswer }) => {
  const isListening = transcriptState === TRANSCRIPT_STATES.LISTENING;
  const isProcessing = transcriptState === TRANSCRIPT_STATES.PROCESSING;
  const hasTranscript = transcript && transcript.trim().length > 0;

  return (
    <div className="flex flex-col gap-3 px-2 h-full relative z-10">
      {/* Listening Indicator (Absolute positioning to prevent layout shifts when it disappears) */}
      <div className={`absolute top-0 left-2 right-2 flex items-center gap-3 text-[var(--color-accent-blue)] font-bold transition-all duration-300 ${isListening ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <div className="w-8 h-8 rounded-full bg-[rgba(79,142,247,0.15)] flex items-center justify-center border border-[rgba(79,142,247,0.3)] shadow-[var(--color-accent-blue-glow)] shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
        </div>
        <span className="uppercase tracking-widest text-xs">Listening...</span>
        <div className="flex items-end gap-1.5 h-4 ml-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-[var(--color-accent-blue)] rounded-full animate-waveform-bar shadow-[var(--color-accent-blue-glow)] shadow-sm"
              style={{ animationDelay: `${i * 0.15}s`, height: '4px' }}
            />
          ))}
        </div>
      </div>

      {/* Transcript Text (Starts slightly lower to accommodate absolute positioned listening indicator) */}
      <div className={`min-h-[4rem] relative group flex-1 transition-all duration-500 pt-10 ${isListening || hasTranscript || isProcessing ? 'opacity-100' : 'opacity-0'}`}>
        {hasTranscript ? (
          <div className="relative surface p-6 !bg-[var(--color-bg-overlay)] shadow-lg hover:border-[var(--color-border-active)] transition-colors group/transcript">
            <p className="text-xl leading-relaxed text-white pr-10 font-medium">
              {transcript}
              {isListening && (
                <span className="inline-block w-1 h-6 bg-[var(--color-accent-blue)] ml-2 align-text-bottom animate-cursor-blink shadow-[var(--color-accent-blue-glow)] shadow-sm" />
              )}
            </p>
            {!isListening && onClearAnswer && (
              <button 
                onClick={onClearAnswer}
                className="absolute top-4 right-4 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)] hover:bg-[rgba(244,63,94,0.1)] rounded-lg transition-all opacity-0 group-hover/transcript:opacity-100"
                title="Clear full answer"
                aria-label="Clear answer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <p className={`text-lg text-[var(--color-text-muted)] font-bold uppercase tracking-wider opacity-80 mt-4 transition-opacity duration-300 ${isProcessing ? 'opacity-100' : 'opacity-0'}`}>
            Processing your response...
          </p>
        )}
      </div>
    </div>
  );
};

export default CandidateTranscript;
