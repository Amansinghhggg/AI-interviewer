import { useEffect } from 'react';
import { CONVERSATION_STATES } from '../../modules/interview/conversation/index';
import { InterviewCamera } from '../../modules/camera/index';
import { useAuth } from '../../context/AuthContext';
import { useVoiceRecorder, RECORDING_STATES } from '../../hooks/useVoiceRecorder';
import { Mic, ArrowRight, Loader2, Video, CheckCircle2, ShieldAlert } from 'lucide-react';

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

  const isRecordingActive = recordingState === RECORDING_STATES.RECORDING || isListening;
  const isSubmitDisabled = !isRecordingActive && (!candidateTranscript || candidateTranscript.length < 2) || isTranscribing;

  return (
    <div className="flex flex-col relative w-full h-full p-6 lg:p-8 justify-between gap-5">
      {/* Candidate Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          <div className="text-slate-300 text-xs font-bold uppercase tracking-[0.25em]">
            You (Candidate) <span className="text-slate-600">•</span> Live Camera Feed
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 shadow-sm">
          <Video className="w-3.5 h-3.5 text-emerald-400" />
          <span>Camera Connected</span>
        </div>
      </div>

      {/* Large Camera Viewport */}
      <div className="relative flex-1 w-full rounded-[32px] overflow-hidden border border-slate-700/80 ring-1 ring-white/10 bg-slate-900/90 shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex items-center justify-center group">
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

        {/* Ambient Top Vignette */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

        {/* Candidate Info Overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-xl p-3.5 rounded-2xl flex items-center justify-between border border-slate-800/90 shadow-2xl z-20">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-3 h-3">
              <span className="absolute w-full h-full bg-emerald-400 rounded-full animate-ping opacity-75" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-slate-100 text-xs font-bold tracking-wide">
              {user?.name || "Candidate"}
            </span>
          </div>

          {isListening ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider shadow-inner">
              <Mic className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>Mic Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[11px] font-medium">
              <span>Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Vibrant High-Contrast Submit Action Bar */}
      <div className="w-full">
        <button
          onClick={handleManualSubmit}
          disabled={isSubmitDisabled}
          className={`w-full py-4.5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-3 shadow-xl ${isSubmitDisabled
              ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:via-indigo-500 hover:to-purple-500 text-white border border-indigo-400/40 shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:shadow-[0_0_45px_rgba(139,92,246,0.7)] active:scale-[0.99] cursor-pointer'
            }`}
        >
          {isTranscribing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>Processing Response...</span>
            </>
          ) : (
            <>
              <span>Submit Answer & Continue</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InterviewCandidate;
