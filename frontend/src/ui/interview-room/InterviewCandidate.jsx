import { useEffect } from 'react';
import { CONVERSATION_STATES } from '../../modules/interview/conversation/index';
import CandidateTranscript from './CandidateTranscript';
import { InterviewCamera } from '../../modules/camera/index';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../ui/components/Button';
import { useVoiceRecorder, RECORDING_STATES } from '../../hooks/useVoiceRecorder';

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
  onAnswerReady
}) => {
  const isListening = conversationState === CONVERSATION_STATES.LISTENING;
  const { user } = useAuth();

  const {
    recordingState,
    audioBlob,
    startRecording,
    stopRecording,
    deleteRecording,
  } = useVoiceRecorder();

  // Auto-start recording when listening
  useEffect(() => {
    if (isAutomaticMode && isListening && recordingState === RECORDING_STATES.IDLE) {
      startRecording();
    }
  }, [isAutomaticMode, isListening, recordingState, startRecording]);

  // Handle completed recording blob (auto or manual)
  useEffect(() => {
    if (recordingState === RECORDING_STATES.RECORDED && audioBlob) {
      if (onRecordingComplete) {
        onRecordingComplete(audioBlob);
        deleteRecording();
      }
    }
  }, [recordingState, audioBlob, onRecordingComplete, deleteRecording]);

  const handleManualSubmit = () => {
    if (recordingState === RECORDING_STATES.RECORDING) {
      // Force stop recording immediately. The effect above will catch the blob.
      stopRecording(false);
    } else if (candidateTranscript?.length > 0) {
      // If already recorded and transcribed, just submit the text
      onAnswerReady();
    }
  };

  return (
    <div className="flex flex-col h-full relative z-10 p-8">
      {/* Candidate Header */}
      <div className="flex items-center gap-2 mb-auto">
        <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
        <div className="text-[var(--text-secondary)] text-sm font-bold uppercase tracking-[0.2em]">
          You
        </div>
      </div>

      <div className="flex flex-col flex-1 mt-6 items-center w-full justify-center gap-8">
        {/* Camera Preview */}
        <div className="w-full max-w-2xl aspect-video bg-[#131316] rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative">
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
          {/* Candidate Name Overlay */}
          <div className="absolute bottom-6 left-6 bg-[#000000]/80 backdrop-blur-md px-4 py-2.5 rounded-full flex items-center gap-3 border border-white/10 shadow-lg">
             <span className="w-2 h-2 rounded-full bg-[var(--color-danger)] animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
             <span className="text-white text-sm font-semibold tracking-wide">
               {user?.name || "Candidate"}
             </span>
          </div>
        </div>

        {/* Submit Answer Button */}
        <div>
          <Button 
            onClick={handleManualSubmit}
            disabled={recordingState !== RECORDING_STATES.RECORDING && (!candidateTranscript || candidateTranscript.length < 5) || isTranscribing}
            className="group relative px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-widest overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:shadow-[0_0_50px_rgba(139,92,246,0.4)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed bg-gradient-to-r from-[var(--color-primary-md3)] to-[var(--color-secondary)] text-white"
          >
            <span className="relative z-10 flex items-center gap-3">
              {isTranscribing ? 'Processing...' : 'Submit Answer'}
              {!isTranscribing && (
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </span>
              )}
            </span>
          </Button>
        </div>
      </div>

      {/* Transcript (YOUR RESPONSE) */}
      <div className="mt-auto w-full max-w-3xl mx-auto">
        <CandidateTranscript
          transcript={candidateTranscript}
          transcriptState={transcriptState}
          onClearAnswer={onClearAnswer}
        />
      </div>
    </div>
  );
};

export default InterviewCandidate;
