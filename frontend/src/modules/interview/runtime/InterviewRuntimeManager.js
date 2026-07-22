import { useState, useCallback, useEffect } from 'react';
import { useCamera } from '../../camera';
import { useRecording } from '../../recording';
import { INTERVIEW_RUNTIME_STATES, INTERVIEW_RUNTIME_EVENTS } from './InterviewRuntimeState';
import { RUNTIME_CONFIG } from './runtime.config';
import { CAMERA_STATES } from '../../camera/utils/camera.states';

export const useInterviewRuntimeManager = () => {
  const [runtimeState, setRuntimeState] = useState(INTERVIEW_RUNTIME_STATES.INITIALIZING);
  const [runtimeError, setRuntimeError] = useState(null);
  
  const camera = useCamera();
  const recording = useRecording();

  // Internal helper to emit events
  const emitEvent = useCallback((eventName, data = {}) => {
    console.log(`[InterviewRuntime] Event: ${eventName}`, data);
  }, []);

  // 1. On Mount: Start camera if configured
  useEffect(() => {
    emitEvent(INTERVIEW_RUNTIME_EVENTS.RUNTIME_INITIALIZING);
    
    if (RUNTIME_CONFIG.AUTO_START_CAMERA) {
      camera.startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Monitor Camera State
  useEffect(() => {
    if (camera.cameraState === CAMERA_STATES.ACTIVE && camera.stream) {
      if (runtimeState === INTERVIEW_RUNTIME_STATES.INITIALIZING) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRuntimeState(INTERVIEW_RUNTIME_STATES.CAMERA_READY);
        emitEvent(INTERVIEW_RUNTIME_EVENTS.CAMERA_READY);
        
        recording.attachStream(camera.stream);
         
        setRuntimeState(INTERVIEW_RUNTIME_STATES.RECORDING_READY);
        emitEvent(INTERVIEW_RUNTIME_EVENTS.RECORDING_READY);
      }
    } else if (camera.cameraState === CAMERA_STATES.ERROR) {
        
       setRuntimeError(camera.error);
        
       setRuntimeState(INTERVIEW_RUNTIME_STATES.ERROR);
       emitEvent(INTERVIEW_RUNTIME_EVENTS.RUNTIME_ERROR, { error: camera.error });
    }
  }, [camera.cameraState, camera.stream, camera.error, runtimeState, recording, emitEvent]);

  // 3. Actions
  const start = useCallback(async () => {
    if (runtimeState !== INTERVIEW_RUNTIME_STATES.RECORDING_READY && runtimeState !== INTERVIEW_RUNTIME_STATES.CAMERA_READY) {
       console.warn('[InterviewRuntime] Cannot start from state:', runtimeState);
       return;
    }
    
    await recording.start();
    setRuntimeState(INTERVIEW_RUNTIME_STATES.ACTIVE);
    emitEvent(INTERVIEW_RUNTIME_EVENTS.RUNTIME_STARTED);
  }, [runtimeState, recording, emitEvent]);

  const stop = useCallback(async () => {
    if (runtimeState !== INTERVIEW_RUNTIME_STATES.ACTIVE && runtimeState !== INTERVIEW_RUNTIME_STATES.FINISHING) {
       return null;
    }
    
    setRuntimeState(INTERVIEW_RUNTIME_STATES.FINISHING);
    
    // Stop recording and get finalized session
    const session = await recording.stop();
    
    // Auto-stop camera on finish
    if (RUNTIME_CONFIG.AUTO_STOP_ON_FINISH) {
       camera.stopCamera();
    }
    
    setRuntimeState(INTERVIEW_RUNTIME_STATES.COMPLETED);
    emitEvent(INTERVIEW_RUNTIME_EVENTS.RUNTIME_STOPPED, { session });
    
    return session;
  }, [runtimeState, recording, camera, emitEvent]);

  const pause = useCallback(() => {
     recording.pause();
  }, [recording]);

  const resume = useCallback(() => {
     recording.resume();
  }, [recording]);

  // 4. Cleanup on unmount
  useEffect(() => {
    return () => {
      camera.stopCamera();
      recording.reset();
      emitEvent(INTERVIEW_RUNTIME_EVENTS.RUNTIME_DESTROYED);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    cameraRuntime: camera,
    recordingRuntime: recording,
    runtimeState,
    runtimeError,
    actions: {
      start,
      stop,
      pause,
      resume
    }
  };
};
