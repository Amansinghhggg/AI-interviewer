import { useState, useEffect, useRef } from 'react';
import { FaceDetectionService } from '../services/FaceDetectionService';
import { FACE_STATES } from '../utils/faceDetection.states';

export const useFaceDetection = (cameraStream) => {
  const [snapshot, setSnapshot] = useState({
    faceCount: 0,
    status: FACE_STATES.INITIALIZING,
    confidence: 0,
    timestamp: 0,
    lastDetectedAt: 0
  });
  
  const [history, setHistory] = useState([]);
  const [videoElement, setVideoElement] = useState(null);
  const serviceRef = useRef(null);

  useEffect(() => {
    if (!serviceRef.current) {
      serviceRef.current = new FaceDetectionService((newSnapshot, newHistory) => {
        setSnapshot(newSnapshot);
        setHistory(newHistory);
      });
      serviceRef.current.initialize();
    }

    return () => {
      if (serviceRef.current) {
        serviceRef.current.destroy();
        serviceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Start or stop based on the stream and video element availability
    if (cameraStream && videoElement) {
      serviceRef.current.start(videoElement);
    } else if (serviceRef.current) {
      serviceRef.current.stop();
    }
  }, [cameraStream, videoElement]);

  return {
    snapshot,
    history,
    setVideoElement
  };
};
