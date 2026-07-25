import { Mic, Camera } from 'lucide-react';
import { CONVERSATION_STATES } from '../../modules/interview/conversation/index';
import CandidateTranscript from './CandidateTranscript';
import CandidateStatus from './CandidateStatus';
import { InterviewCamera } from '../../modules/camera/index';
import { VoiceInputButton } from '../voice/index';

/**
 * InterviewCandidate
 *
 * Candidate participant section.
 * Composes: InterviewCamera + CandidateStatus + CandidateTranscript + VoiceInput.
 * Each sub-component remains independently reusable.
 * Purely presentational — receives all state through props.
 */
const InterviewCandidate = ({
  conversationState,
  candidateTranscript,
  transcriptState,
  cameraStream,
  cameraState,
  cameraWarnings = [],
  cameraError = null,
  deviceSnapshot = null,
  faceSnapshot = null,
  browserStatus = null,
  activeViolations = [],
  setVideoElement = null,
  isAutomaticMode,
  isTranscribing,
  onRecordingComplete,
  onClearAnswer,
}) => {
  const isListening = conversationState === CONVERSATION_STATES.LISTENING;

  return (
    <div className="flex flex-col h-full relative z-10">
      {/* Candidate Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="text-[var(--color-text-muted)] text-sm font-bold uppercase tracking-[0.2em]">
          You
        </div>
        <CandidateStatus conversationState={conversationState} />
      </div>

      <div className="flex flex-col gap-6 flex-1">
        {/* Camera & Controls Row */}
        <div className="flex flex-col sm:flex-row gap-6 items-stretch">
          {/* Camera Preview */}
          <div className="w-full sm:w-2/3 surface p-2 overflow-hidden shadow-lg border-none bg-[var(--color-bg-overlay)]">
            <div className="rounded-xl overflow-hidden w-full h-full relative border border-[var(--color-border-subtle)]">
              <InterviewCamera
                stream={cameraStream}
                state={cameraState}
                warnings={cameraWarnings}
                error={cameraError}
                isRecording={isListening}
                deviceSnapshot={deviceSnapshot}
                faceSnapshot={faceSnapshot}
                browserStatus={browserStatus}
                activeViolations={activeViolations}
                setVideoElement={setVideoElement}
              />
            </div>
          </div>

          {/* Minimal Controls / Status */}
          <div className="w-full sm:w-1/3 flex flex-col gap-4">
            <div className="flex-1 flex flex-col justify-center p-6 surface shadow-md group hover:border-[var(--color-border-active)] transition-colors">
              <VoiceInputButton
                isListening={isListening}
                isAutomaticMode={isAutomaticMode}
                isTranscribing={isTranscribing}
                onRecordingComplete={onRecordingComplete}
              />
            </div>
            
            {/* System Status Indicators (Compact) */}
            <div className="flex flex-col justify-center gap-4 p-5 surface shadow-sm">
               <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-[var(--color-text-secondary)] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center border border-[var(--color-border-subtle)]">
                      <Mic className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </div>
                    Microphone
                  </span>
                  <span className="text-[var(--color-accent-teal)] flex items-center gap-2 tracking-wide uppercase text-xs">
                    Healthy <span className="w-2 h-2 rounded-full bg-[var(--color-accent-teal)] shadow-[var(--color-accent-teal-glow)] shadow-sm" />
                  </span>
               </div>
               <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-[var(--color-text-secondary)] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center border border-[var(--color-border-subtle)]">
                      <Camera className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </div>
                    Camera
                  </span>
                  <span className="text-[var(--color-accent-teal)] flex items-center gap-2 tracking-wide uppercase text-xs">
                    On <span className="w-2 h-2 rounded-full bg-[var(--color-accent-teal)] shadow-[var(--color-accent-teal-glow)] shadow-sm" />
                  </span>
               </div>
            </div>
          </div>
        </div>

        {/* Transcript (Listening state is inside) */}
        <div className="mt-2 flex-1">
          <CandidateTranscript
            transcript={candidateTranscript}
            transcriptState={transcriptState}
            onClearAnswer={onClearAnswer}
          />
        </div>
      </div>
    </div>
  );
};

export default InterviewCandidate;
