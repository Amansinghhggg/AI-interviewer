import { useState } from "react";
import toast from "react-hot-toast";
import { AlertCircle, UploadCloud } from "lucide-react";

import { useVoiceRecorder, RECORDING_STATES } from "../../hooks/useVoiceRecorder";
import { voiceService } from "../../services/voice.service";
import { getVoiceErrorMessage } from "../../utils/voiceErrors";

import { VoiceControls } from "./VoiceControls";
import { VoicePlayer } from "./VoicePlayer";
import { VoiceLoading } from "./VoiceLoading";

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
    startRecording,
    stopRecording,
    deleteRecording,
  } = useVoiceRecorder(60000); // 60 seconds max

  const [uiState, setUiState] = useState(UI_STATES.READY);
  const [uploadError, setUploadError] = useState(null);

  const handleUpload = async () => {
    if (!audioBlob) return;

    setUiState(UI_STATES.UPLOADING);
    setUploadError(null);

    try {
      setUiState(UI_STATES.TRANSCRIBING);
      
      const response = await voiceService.transcribe(audioBlob);
      
      if (response.success && response.transcript) {
        if (onTranscript) {
          onTranscript(response.transcript);
        }
        // State resets can be handled by parent unmounting it, 
        // but let's reset it locally just in case it's kept alive.
        deleteRecording();
        setUiState(UI_STATES.READY);
      } else {
        throw new Error("Failed to get transcript from response");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      setUploadError(err.response?.data?.message || err.message || "Failed to transcribe audio.");
      setUiState(UI_STATES.READY);
      toast.error("Upload failed");
    }
  };

  const handleReset = () => {
    deleteRecording();
    setUiState(UI_STATES.READY);
    setUploadError(null);
  };

  // Determine active error
  const activeError = recorderError 
    ? getVoiceErrorMessage(recorderError) 
    : uploadError;

  return (
    <div className="w-full max-w-2xl mx-auto">
      
      {activeError && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
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
          <VoiceControls
            recordingState={recordingState}
            duration={duration}
            onStart={startRecording}
            onStop={stopRecording}
            onDelete={handleReset}
          />

          {recordingState === RECORDING_STATES.RECORDED && (
            <div className="flex flex-col items-center gap-6 bg-dark-800 p-6 border border-dark-700 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <VoicePlayer audioUrl={audioUrl} />
              
              <button
                onClick={handleUpload}
                className="flex items-center justify-center gap-2 w-full max-w-sm px-6 py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary-900/20"
              >
                <UploadCloud className="w-5 h-5" />
                Upload & Transcribe
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
