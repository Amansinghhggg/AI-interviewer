import { useState, useRef, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { VoiceErrors } from "../utils/voiceErrors";
import { VOICE_CONFIG } from "../config/voice.config";
import { runtimeDiagnostics } from "../utils/diagnostics";

export const RECORDING_STATES = {
  IDLE: "IDLE",
  RECORDING: "RECORDING",
  RECORDED: "RECORDED",
  ERROR: "ERROR",
};

export const useVoiceRecorder = () => {
  const [recordingState, setRecordingState] = useState(RECORDING_STATES.IDLE);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [duration, setDuration] = useState(0); // in milliseconds
  const [error, setError] = useState(null);
  const [isSilenceWarning, setIsSilenceWarning] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Web Audio API refs for silence detection
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const silenceStartRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isRecordingRef = useRef(false); // needed for strict inside-loop checks
  const hasSpokenRef = useRef(false);

  const cleanup = useCallback(() => {
    isRecordingRef.current = false;
    // 1. Clear timers and animation frames
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // 2. Stop Web Audio API
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(console.error);
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    silenceStartRef.current = null;

    // 3. Stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    
    // 4. Revoke Object URL to prevent memory leaks
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setIsSilenceWarning(false);
  }, [audioUrl]);

  useEffect(() => {
    // Cleanup on unmount
    return () => cleanup();
  }, [cleanup]);

  const stopRecording = useCallback((isAutoStop = false) => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      const elapsed = Date.now() - startTimeRef.current;
      if (!isAutoStop && elapsed < VOICE_CONFIG.MIN_RECORDING_DURATION_MS) {
        toast.error(`Recording must be at least ${VOICE_CONFIG.MIN_RECORDING_DURATION_MS / 1000} second.`);
        // Note: we don't return here, we still stop, but maybe we should discard it? 
        // Instructions: "Too short: Recording must be at least X seconds."
        // We will just let it stop but maybe reject it? We'll stop and let the backend fail it or we just don't set it to RECORDED.
        // Actually, let's discard it if it's too short, as it's invalid.
        mediaRecorderRef.current.stop();
        cleanup();
        setRecordingState(RECORDING_STATES.IDLE);
        return;
      }

      mediaRecorderRef.current.stop();
      if (isAutoStop) {
        toast("Recording auto-stopped due to inactivity.", { icon: "⏸️" });
      }
    }
  }, [cleanup]);

  const detectSilence = useCallback(() => {
    if (!analyserRef.current || !isRecordingRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteTimeDomainData(dataArray);

    let isSilent = true;
    for (let i = 0; i < bufferLength; i++) {
      // Normalize to -1 to 1
      const amplitude = Math.abs((dataArray[i] / 128.0) - 1.0);
      if (amplitude > VOICE_CONFIG.VOICE_SILENCE_THRESHOLD) {
        isSilent = false;
        break;
      }
    }

    const now = Date.now();

    if (!isSilent) {
      // User is speaking, reset silence timer
      hasSpokenRef.current = true;
      silenceStartRef.current = now;
      if (isSilenceWarning) setIsSilenceWarning(false);
    } else {
      // User is silent
      if (!silenceStartRef.current) silenceStartRef.current = now;
      
      const silenceDuration = now - silenceStartRef.current;
      
      const timeout = hasSpokenRef.current 
        ? VOICE_CONFIG.VOICE_AUTO_STOP_MS 
        : VOICE_CONFIG.VOICE_INITIAL_SILENCE_MS;
      
      if (silenceDuration > timeout) {
        stopRecording(true);
        return; // exit loop
      } else if (hasSpokenRef.current && silenceDuration > VOICE_CONFIG.VOICE_SILENCE_WARNING_MS) {
        if (!isSilenceWarning) setIsSilenceWarning(true);
      }
    }

    if (isRecordingRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectSilence);
    }
  }, [isSilenceWarning, stopRecording]);

  const startRecording = useCallback(async () => {
    setError(null);
    cleanup();
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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        runtimeDiagnostics("RecoveryStarted", { error: event.error?.message, context: "MEDIA_RECORDER_ERROR" });
        setError(VoiceErrors.UNKNOWN);
        stopRecording(true);
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          setAudioBlob(blob);
          setAudioUrl(url);
          setRecordingState(RECORDING_STATES.RECORDED);
        } else {
          setRecordingState(RECORDING_STATES.IDLE);
        }
        
        isRecordingRef.current = false;
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        // Release mic resources
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close().catch(console.error);
        }
        setIsSilenceWarning(false);
      };

      // Set up Web Audio API for silence detection
      const initAudioContext = () => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        audioContextRef.current = audioCtx;
        analyserRef.current = audioCtx.createAnalyser();
        analyserRef.current.fftSize = 2048;
        sourceRef.current = audioCtx.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);
      };

      try {
        initAudioContext();
      } catch (audioCtxError) {
        runtimeDiagnostics("RecoveryStarted", { context: "AUDIO_CONTEXT_FAILED", error: audioCtxError.message });
        try {
          // Attempt recovery once
          initAudioContext();
          runtimeDiagnostics("RecoverySucceeded", { context: "AUDIO_CONTEXT_FAILED" });
        } catch (retryError) {
          runtimeDiagnostics("RecoveryFailed", { context: "AUDIO_CONTEXT_FAILED", error: retryError.message });
          // Terminate gracefully rather than falling back to manual
          toast.error("Silence detection failed. Please refresh the page.");
          setRecordingState(RECORDING_STATES.ERROR);
          return; // Abort recording setup
        }
      }

      mediaRecorder.start();
      isRecordingRef.current = true;
      hasSpokenRef.current = false;
      setRecordingState(RECORDING_STATES.RECORDING);
      startTimeRef.current = Date.now();
      silenceStartRef.current = Date.now();

      // Start detect silence loop if available
      if (analyserRef.current) {
        detectSilence();
      }

      // Start timer using timestamps to avoid drift
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);

        if (elapsed >= VOICE_CONFIG.MAX_RECORDING_DURATION_MS) {
          stopRecording(true);
        }
      }, 100);

    } catch (err) {
      runtimeDiagnostics("RecoveryFailed", { context: "MIC_PERMISSION_ERROR", error: err.name });
      setRecordingState(RECORDING_STATES.ERROR);
      
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError(VoiceErrors.PERMISSION_DENIED);
        toast.error("Microphone access denied. Please allow permissions in your browser.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError(VoiceErrors.MIC_NOT_FOUND);
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setError(VoiceErrors.MIC_IN_USE);
        toast.error("Microphone disconnected or in use by another app.");
      } else {
        setError(VoiceErrors.UNKNOWN);
      }
    }
  }, [cleanup, detectSilence, stopRecording]);

  const deleteRecording = useCallback(() => {
    cleanup();
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setRecordingState(RECORDING_STATES.IDLE);
    setError(null);
    setIsSilenceWarning(false);
  }, [cleanup]);

  // Handle visibility change to prevent background throttling issues
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRecordingRef.current) {
        toast("Recording continues in background.", { icon: "ℹ️", id: "bg-record" });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return {
    recordingState,
    audioBlob,
    audioUrl,
    duration,
    error,
    isSilenceWarning,
    startRecording,
    stopRecording,
    deleteRecording,
  };
};
