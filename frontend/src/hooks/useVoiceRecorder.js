import { useState, useRef, useEffect, useCallback } from "react";
import { VoiceErrors } from "../utils/voiceErrors";

export const RECORDING_STATES = {
  IDLE: "IDLE",
  RECORDING: "RECORDING",
  RECORDED: "RECORDED",
  ERROR: "ERROR",
};

export const useVoiceRecorder = (maxDurationMs = 60000) => {
  const [recordingState, setRecordingState] = useState(RECORDING_STATES.IDLE);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [duration, setDuration] = useState(0); // in milliseconds
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const cleanup = useCallback(() => {
    // 1. Clear timers
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    // 2. Stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    // 3. Revoke Object URL to prevent memory leaks
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  useEffect(() => {
    // Cleanup on unmount
    return () => cleanup();
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    setError(null);
    cleanup(); // Clean any previous state
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    audioChunksRef.current = [];

    // Browser compatibility check
    if (!window.MediaRecorder || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(VoiceErrors.UNSUPPORTED_BROWSER);
      setRecordingState(RECORDING_STATES.ERROR);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setRecordingState(RECORDING_STATES.RECORDED);
        
        // Stop timer
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }

        // Release mic resources
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setRecordingState(RECORDING_STATES.RECORDING);
      startTimeRef.current = Date.now();

      // Start timer using timestamps to avoid drift
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);

        if (elapsed >= maxDurationMs) {
          // Reached max duration, auto-stop
          stopRecording();
        }
      }, 100);

    } catch (err) {
      console.error("Microphone access error:", err);
      setRecordingState(RECORDING_STATES.ERROR);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError(VoiceErrors.PERMISSION_DENIED);
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError(VoiceErrors.MIC_NOT_FOUND);
      } else {
        setError(VoiceErrors.UNKNOWN);
      }
    }
  }, [cleanup, maxDurationMs]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const deleteRecording = useCallback(() => {
    cleanup();
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setRecordingState(RECORDING_STATES.IDLE);
    setError(null);
  }, [cleanup]);

  return {
    recordingState,
    audioBlob,
    audioUrl,
    duration,
    error,
    startRecording,
    stopRecording,
    deleteRecording,
  };
};
