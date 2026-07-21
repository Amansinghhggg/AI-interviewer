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
      className="w-full flex flex-col focus:outline-none"
      ref={containerRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Voice Recorder Interface"
    >
      <div className="sr-only" aria-live="polite">
        {recordingState === RECORDING_STATES.RECORDING ? "Recording started" : ""}
        {recordingState === RECORDING_STATES.RECORDED ? "Recording stopped and is ready for playback or upload" : ""}
        {isSilenceWarning ? "Warning: No speech detected. Recording will stop soon." : ""}
        {activeError ? `Error: ${activeError}` : ""}
      </div>
      
      {activeError && (
        <div className="mb-3 p-3 bg-danger-900/30 border border-danger-500/50 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-danger-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-danger-200 text-xs leading-relaxed">{activeError}</p>
        </div>
      )}

      {/* Inline Controls */}
      <VoiceControls
        recordingState={recordingState}
        duration={duration}
        onStart={startRecording}
        onStop={() => stopRecording(false)}
        onDelete={handleReset}
        onUpload={handleUpload}
        isUploading={uiState === UI_STATES.UPLOADING || uiState === UI_STATES.TRANSCRIBING}
      />
    </div>
  );
};
