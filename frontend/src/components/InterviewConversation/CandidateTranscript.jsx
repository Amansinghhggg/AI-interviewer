import { Trash2 } from 'lucide-react';
import { TRANSCRIPT_STATES } from '../../modules/interview/conversation';

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
    <div className="flex flex-col gap-3 px-2 h-full">
      {/* Listening Indicator */}
      {isListening && (
        <div className="flex items-center gap-3 text-primary-400 font-medium">
          <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
          </div>
          <span>Listening...</span>
          <div className="flex items-end gap-1 h-4 ml-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary-400 rounded-full animate-waveform-bar"
                style={{ animationDelay: `${i * 0.15}s`, height: '4px' }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Transcript Text */}
      <div className="min-h-[4rem] relative group flex-1">
        {hasTranscript ? (
          <div className="relative">
            <p className="text-lg leading-relaxed text-dark-100 pr-10">
              {transcript}
              {isListening && (
                <span className="inline-block w-0.5 h-5 bg-primary-400 ml-1 align-text-bottom animate-cursor-blink" />
              )}
            </p>
            {!isListening && onClearAnswer && (
              <button 
                onClick={onClearAnswer}
                className="absolute top-0 right-0 p-2 text-dark-500 hover:text-danger-400 hover:bg-danger-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Clear full answer"
                aria-label="Clear answer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <p className="text-lg text-dark-400 font-medium opacity-80 mt-2">
            {isProcessing ? 'Processing your response...' : "Start answering whenever you're ready."}
          </p>
        )}
      </div>
    </div>
  );
};

export default CandidateTranscript;
