import { Mic, Camera } from 'lucide-react';
import { CONVERSATION_STATES } from '../../modules/interview/conversation';
import CandidateTranscript from './CandidateTranscript';
import CandidateStatus from './CandidateStatus';
import { InterviewCamera } from '../../modules/camera';
import { VoiceInputButton } from '../Voice';

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
    <div className="flex flex-col h-full">
      {/* Candidate Header */}
      <div className="flex items-center justify-between w-full mb-8">
        <div className="text-dark-400 text-xs font-bold uppercase tracking-widest">
          You
        </div>
        <CandidateStatus conversationState={conversationState} />
      </div>

      <div className="flex flex-col gap-6 flex-1">
        {/* Camera & Controls Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          {/* Camera Preview */}
          <div className="w-full sm:w-2/3">
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

          {/* Minimal Controls / Status */}
          <div className="w-full sm:w-1/3 flex flex-col gap-4">
            <div className="flex-1 flex flex-col justify-center p-5 rounded-2xl bg-dark-800/30 border border-dark-700/30">
              <VoiceInputButton
                isListening={isListening}
                isAutomaticMode={isAutomaticMode}
                isTranscribing={isTranscribing}
                onRecordingComplete={onRecordingComplete}
              />
            </div>
            
            {/* System Status Indicators (Compact) */}
            <div className="flex flex-col justify-center gap-3 p-4 rounded-2xl bg-dark-800/30 border border-dark-700/30">
               <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-dark-400 flex items-center gap-2"><Mic className="w-3.5 h-3.5" /> Microphone</span>
                  <span className="text-success-400 flex items-center gap-1">Healthy <span className="w-1.5 h-1.5 rounded-full bg-success-500" /></span>
               </div>
               <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-dark-400 flex items-center gap-2"><Camera className="w-3.5 h-3.5" /> Camera</span>
                  <span className="text-success-400 flex items-center gap-1">On <span className="w-1.5 h-1.5 rounded-full bg-success-500" /></span>
               </div>
            </div>
          </div>
        </div>

        {/* Transcript (Listening state is inside) */}
        <div className="mt-4 flex-1">
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
