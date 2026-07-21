/**
 * useCamera Hook
 *
 * React hook wrapping CameraService for managing the interview camera preview.
 * Does NOT auto-start — exposes startCamera() and stopCamera() for
 * explicit lifecycle control by the interview controller.
 * Auto-stops on unmount to prevent resource leaks.
 *
 * Returns { stream, cameraState, error, startCamera, stopCamera }
 * for consumption by presentational InterviewCamera component.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { CameraService } from '../services/camera.service';
import { CAMERA_STATES } from '../utils/camera.states';
import { createCameraError, mapCameraErrorToCode } from '../utils/camera.errors';

export const useCamera = () => {
  const [stream, setStream] = useState(null);
  const [cameraState, setCameraState] = useState(CAMERA_STATES.IDLE);
  const [error, setError] = useState(null);

  // Ref to track the current stream for cleanup
  const streamRef = useRef(null);

  const stopCamera = useCallback(() => {
    CameraService.stopCamera(streamRef.current);
    streamRef.current = null;
    setStream(null);
    setCameraState(CAMERA_STATES.IDLE);
  }, []);

  const startCamera = useCallback(async () => {
    // Stop any existing stream first
    if (streamRef.current) {
      CameraService.stopCamera(streamRef.current);
      streamRef.current = null;
    }

    setError(null);
    setCameraState(CAMERA_STATES.INITIALIZING);

    try {
      const mediaStream = await CameraService.startCamera();
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setCameraState(CAMERA_STATES.ACTIVE);
    } catch (err) {
      console.error('Camera access error:', err);
      const errorCode = mapCameraErrorToCode(err);
      setError(createCameraError(errorCode));
      setCameraState(CAMERA_STATES.ERROR);
    }
  }, []);

  // Cleanup on unmount — always stop camera
  useEffect(() => {
    return () => {
      CameraService.stopCamera(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  return {
    stream,
    cameraState,
    error,
    startCamera,
    stopCamera,
  };
};
