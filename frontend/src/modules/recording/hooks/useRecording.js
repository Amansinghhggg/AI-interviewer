import { useState, useRef, useEffect, useCallback } from 'react';
import { MediaRecordingService } from '../services/mediaRecording.service';
import { DeviceService } from '../services/device.service';
import { RECORDING_STATES } from '../utils/recording.states';
import { RECORDING_CONFIG } from '../config/recording.config';
import {
  RECORDING_ERRORS,
  createRecordingError,
  mapMediaErrorToCode,
} from '../utils/recording.errors';

/**
 * useRecording
 *
 * React hook that orchestrates:
 *   permissions → stream → MediaRecordingService → state
 *
 * Chunks are stored in useRef (never in React state) to avoid re-renders.
 * Stream lifecycle is separated from recording lifecycle:
 *   - stop() finalizes the recording but keeps the stream alive
 *   - reset() releases the stream and all resources
 */
export const useRecording = () => {
  // ─── React State (lightweight UI state only) ─────────────────
  const [state, setState] = useState(RECORDING_STATES.IDLE);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);
  const [session, setSession] = useState(null);
  const [stream, setStream] = useState(null);

  // ─── Refs (heavy objects, no re-renders) ─────────────────────
  const serviceRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const elapsedRef = useRef(0);
  const startTimeRef = useRef(null);

  // ─── Internal: Stop duration timer ───────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ─── Internal: Start duration timer ──────────────────────────
  const startTimer = useCallback(() => {
    stopTimer();
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const currentElapsed = elapsedRef.current + (now - startTimeRef.current);
      setDuration(currentElapsed);
    }, 100);
  }, [stopTimer]);

  // ─── Internal: Pause duration timer ──────────────────────────
  const pauseTimer = useCallback(() => {
    if (startTimeRef.current) {
      elapsedRef.current += Date.now() - startTimeRef.current;
      startTimeRef.current = null;
    }
    stopTimer();
    setDuration(elapsedRef.current);
  }, [stopTimer]);

  // ─── Internal: Detach stream (ownership is external) ───────────
  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  // ─── attachStream() — external stream ownership ────────────────
  const attachStream = useCallback((externalStream) => {
    streamRef.current = externalStream;
    setStream(externalStream);
  }, []);

  // ─── reset() — full cleanup, back to IDLE ────────────────────
  const reset = useCallback(() => {
    // Destroy service
    if (serviceRef.current) {
      serviceRef.current.destroy();
      serviceRef.current = null;
    }

    // Release stream reference
    releaseStream();

    // Clear timer
    stopTimer();
    elapsedRef.current = 0;
    startTimeRef.current = null;

    // Reset state
    setState(RECORDING_STATES.IDLE);
    setError(null);
    setDuration(0);
    setSession(null);
  }, [releaseStream, stopTimer]);

  // ─── start() — init service with attached stream, begin recording ─
  const start = useCallback(async () => {
    setError(null);
    setSession(null);
    setDuration(0);
    elapsedRef.current = 0;

    // 1. Check browser support
    if (!DeviceService.isMediaRecorderSupported()) {
      const err = createRecordingError(RECORDING_ERRORS.MEDIA_RECORDER_NOT_SUPPORTED);
      setError(err);
      setState(RECORDING_STATES.ERROR);
      return;
    }

    // 2. Check stream existence
    if (!streamRef.current) {
      console.error('[useRecording] No stream attached. Call attachStream() before start().');
      setState(RECORDING_STATES.ERROR);
      return;
    }

    setState(RECORDING_STATES.INITIALIZING);

    try {
      const mediaStream = streamRef.current;

      // 3. Create and initialize service
      const service = new MediaRecordingService();
      serviceRef.current = service;

      // 4. Subscribe to service events
      service.on('recordingError', ({ error: recError }) => {
        setError(recError);
        setState(RECORDING_STATES.ERROR);
        stopTimer();
      });

      // 5. Initialize with stream (detects MIME type, creates recorder)
      service.initialize(mediaStream);

      // 6. Start recording
      service.start();
      setState(RECORDING_STATES.RECORDING);
      startTimer();
    } catch (err) {
      console.error('[useRecording] Start error:', err);

      // Map browser error to structured error
      const errorCode = mapMediaErrorToCode(err);
      const recordingError = createRecordingError(errorCode, err);
      setError(recordingError);
      setState(RECORDING_STATES.ERROR);

      // Release any partial stream reference
      releaseStream();
    }
  }, [startTimer, stopTimer, releaseStream]);

  // ─── stop() — finalize recording, keep stream alive ──────────
  const stop = useCallback(async () => {
    if (!serviceRef.current) return null;

    const currentState = serviceRef.current.getState();
    if (
      currentState !== RECORDING_STATES.RECORDING &&
      currentState !== RECORDING_STATES.PAUSED
    ) {
      return null;
    }

    // Freeze the timer
    if (currentState === RECORDING_STATES.RECORDING) {
      pauseTimer();
    }

    // Stop recording — returns finalized session
    const finalSession = await serviceRef.current.stop(elapsedRef.current);

    setState(RECORDING_STATES.STOPPED);
    setSession(finalSession);
    setDuration(elapsedRef.current);

    return finalSession;
  }, [pauseTimer]);

  // ─── pause() ─────────────────────────────────────────────────
  const pause = useCallback(() => {
    if (!serviceRef.current) return;
    if (serviceRef.current.getState() !== RECORDING_STATES.RECORDING) return;

    serviceRef.current.pause();
    pauseTimer();
    setState(RECORDING_STATES.PAUSED);
  }, [pauseTimer]);

  // ─── resume() ────────────────────────────────────────────────
  const resume = useCallback(() => {
    if (!serviceRef.current) return;
    if (serviceRef.current.getState() !== RECORDING_STATES.PAUSED) return;

    serviceRef.current.resume();
    startTimer();
    setState(RECORDING_STATES.RECORDING);
  }, [startTimer]);

  // ─── Cleanup on unmount ──────────────────────────────────────
  useEffect(() => {
    return () => {
      if (serviceRef.current) {
        serviceRef.current.destroy();
        serviceRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
        streamRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return {
    // State
    state,
    error,
    duration,
    session,
    stream,

    // Actions
    start,
    stop,
    pause,
    resume,
    reset,
    attachStream,
  };
};
