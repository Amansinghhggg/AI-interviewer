import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { AlertCircle } from "lucide-react";

import { useVoiceRecorder, RECORDING_STATES } from "../../hooks/useVoiceRecorder";
import { getVoiceErrorMessage } from "../../utils/voiceErrors";

import { VoiceControls } from "./VoiceControls";

export const VoiceRecorder = ({ 
  isListening, 
  isAutomaticMode, 
  isTranscribing, 
  onRecordingComplete 
}) => {
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

  // Ref for keyboard event listener attachment
  const containerRef = useRef(null);

  useEffect(() => {
    // Focus the container for accessibility and keyboard shortcuts when opened
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  // Auto-start recording when isListening goes true
  useEffect(() => {
    if (isAutomaticMode && isListening && recordingState === RECORDING_STATES.IDLE) {
      startRecording();
    }
  }, [isAutomaticMode, isListening, recordingState, startRecording]);

  // Auto-complete recording when silence stops it
  useEffect(() => {
    if (isAutomaticMode && recordingState === RECORDING_STATES.RECORDED && audioBlob) {
      if (onRecordingComplete) {
        onRecordingComplete(audioBlob);
        deleteRecording(); // Clean up internal blob so it doesn't double-fire
      }
    }
  }, [isAutomaticMode, recordingState, audioBlob, onRecordingComplete, deleteRecording]);

  const handleUpload = () => {
    if (!audioBlob) return;
    if (onRecordingComplete) {
      onRecordingComplete(audioBlob);
      // In manual mode, we also clean up after emitting
      deleteRecording();
    }
  };

  const handleReset = () => {
    deleteRecording();
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
    : null;

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
        <div className="mb-3 p-3 bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.2)] rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[var(--color-accent-red)] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-[var(--color-accent-red)] text-xs leading-relaxed opacity-90">{activeError}</p>
        </div>
      )}

      {/* Inline Controls for Manual Mode */}
      {!isAutomaticMode && (
        <VoiceControls
          recordingState={recordingState}
          duration={duration}
          onStart={startRecording}
          onStop={() => stopRecording(false)}
          onDelete={handleReset}
          onUpload={handleUpload}
          isUploading={isTranscribing}
        />
      )}

      {/* Manual Submit Button for Automatic Mode */}
      {isAutomaticMode && recordingState === RECORDING_STATES.RECORDING && (
        <button
          onClick={(e) => {
            e.preventDefault();
            stopRecording(false);
          }}
          className="mt-2 w-full py-3 px-4 bg-[rgba(79,142,247,0.15)] hover:bg-[rgba(79,142,247,0.25)] text-[var(--color-accent-blue)] border border-[rgba(79,142,247,0.3)] rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-[var(--color-accent-blue-glow)] hover:shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          Submit Early
        </button>
      )}
    </div>
  );
};
