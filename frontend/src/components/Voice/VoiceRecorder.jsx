import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { AlertCircle, UploadCloud, RefreshCcw, WifiOff } from "lucide-react";

import { useVoiceRecorder, RECORDING_STATES } from "../../hooks/useVoiceRecorder";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { voiceService } from "../../services/voice.service";
import { getVoiceErrorMessage } from "../../utils/voiceErrors";

import { VoiceControls } from "./VoiceControls";
import { VoicePlayer } from "./VoicePlayer";
import { VoiceLoading } from "./VoiceLoading";
import { VoiceWaveform } from "./VoiceWaveform";

// UI States
const UI_STATES = {
  READY: "READY",
  UPLOADING: "UPLOADING",
  TRANSCRIBING: "TRANSCRIBING",
};

export const VoiceRecorder = ({ onTranscript }) => {
  const {
    recordingState,
    audioBlob,
    audioUrl,
    duration,
    error: recorderError,
    isSilenceWarning,
    startRecording,
    stopRecording,
    deleteRecording,
  } = useVoiceRecorder();

  const isOnline = useNetworkStatus();
  const [uiState, setUiState] = useState(UI_STATES.READY);
  const [uploadError, setUploadError] = useState(null);
  
  // Ref for keyboard event listener attachment
  const containerRef = useRef(null);

  useEffect(() => {
    // Focus the container for accessibility and keyboard shortcuts when opened
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  const handleUpload = async () => {
    if (!audioBlob) return;
    if (!isOnline) {
      toast.error("You are offline. Reconnect to transcribe.");
      return;
    }

    setUiState(UI_STATES.UPLOADING);
    setUploadError(null);

    try {
      setUiState(UI_STATES.TRANSCRIBING);
      
      const response = await voiceService.transcribe(audioBlob);
      
      if (response.success && response.transcript) {
        if (onTranscript) {
          onTranscript(response.transcript);
        }
        deleteRecording();
        setUiState(UI_STATES.READY);
      } else {
        throw new Error("Failed to get transcript from response");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      setUploadError(err.response?.data?.message || err.message || "Failed to transcribe audio.");
      setUiState(UI_STATES.READY);
      toast.error("Transcription failed");
    }
  };

  const handleReset = () => {
    deleteRecording();
    setUiState(UI_STATES.READY);
    setUploadError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === " ") {
      e.preventDefault();
      if (recordingState === RECORDING_STATES.IDLE || recordingState === RECORDING_STATES.ERROR) {
        startRecording();
      } else if (recordingState === RECORDING_STATES.RECORDING) {
        stopRecording();
      }
    }
  };

  // Determine active error
  const activeError = recorderError 
    ? getVoiceErrorMessage(recorderError) 
    : uploadError;

  // Formatting for the REC indicator
  const formatRecDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div 
      className="w-full max-w-2xl mx-auto focus:outline-none"
      ref={containerRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Voice Recorder Interface"
    >
      {/* Accessibility live region for screen readers */}
      <div className="sr-only" aria-live="polite">
        {recordingState === RECORDING_STATES.RECORDING ? "Recording started" : ""}
        {recordingState === RECORDING_STATES.RECORDED ? "Recording stopped and is ready for playback or upload" : ""}
        {isSilenceWarning ? "Warning: No speech detected. Recording will stop soon." : ""}
        {activeError ? `Error: ${activeError}` : ""}
      </div>
      
      {activeError && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-red-200 text-sm leading-relaxed">{activeError}</p>
        </div>
      )}

      {/* When uploading or transcribing */}
      {(uiState === UI_STATES.UPLOADING || uiState === UI_STATES.TRANSCRIBING) && (
        <VoiceLoading status={uiState} />
      )}

      {/* Standard Recording UI */}
      {uiState === UI_STATES.READY && (
        <div className="flex flex-col gap-6">
          
          {recordingState === RECORDING_STATES.RECORDING && (
            <div className="flex flex-col items-center justify-center p-6 bg-dark-800 border border-dark-700 rounded-xl">
              <div className="flex items-center gap-3 text-red-500 font-mono text-2xl font-semibold mb-2 tracking-widest animate-pulse">
                <div className="w-4 h-4 bg-red-500 rounded-full" aria-hidden="true" />
                REC {formatRecDuration(duration)}
              </div>
              
              {isSilenceWarning && (
                <p className="text-warning-400 text-sm mt-2 animate-in slide-in-from-top-2">
                  No speech detected...
                </p>
              )}

              <VoiceWaveform />
            </div>
          )}

          <VoiceControls
            recordingState={recordingState}
            duration={duration}
            onStart={startRecording}
            onStop={() => stopRecording(false)}
            onDelete={handleReset}
          />

          {recordingState === RECORDING_STATES.RECORDED && (
            <div className="flex flex-col items-center gap-6 bg-dark-800 p-6 border border-dark-700 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <VoicePlayer audioUrl={audioUrl} />
              
              {!isOnline && (
                <div className="flex items-center gap-2 text-warning-400 bg-warning-500/10 px-4 py-2 rounded-lg text-sm">
                  <WifiOff className="w-4 h-4" />
                  <span>No internet connection. Reconnect to transcribe.</span>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!isOnline}
                className={`flex items-center justify-center gap-2 w-full max-w-sm px-6 py-3.5 rounded-xl font-medium transition-colors shadow-lg ${
                  isOnline 
                  ? uploadError 
                    ? "bg-dark-700 hover:bg-dark-600 text-primary-400 shadow-dark-900/20 border border-dark-600" 
                    : "bg-primary-600 hover:bg-primary-500 text-white shadow-primary-900/20"
                  : "bg-dark-700 text-dark-500 cursor-not-allowed border border-dark-600"
                }`}
                aria-label={uploadError ? "Retry Transcription" : "Upload and Transcribe"}
              >
                {uploadError ? (
                  <>
                    <RefreshCcw className="w-5 h-5" aria-hidden="true" />
                    Retry Transcription
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" aria-hidden="true" />
                    Upload & Transcribe
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
