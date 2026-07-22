import { useState, useEffect, useRef } from 'react';
import { DeviceMonitorService } from '../services/DeviceMonitorService';
import { DEVICE_HEALTH_STATES } from '../utils/deviceHealth.states';

export const useDeviceHealth = (cameraRuntime) => {
  const [snapshot, setSnapshot] = useState({
    camera: { state: DEVICE_HEALTH_STATES.INITIALIZING, label: 'Unknown' },
    microphone: { state: DEVICE_HEALTH_STATES.INITIALIZING, label: 'Unknown' },
    permissions: { camera: 'unknown', microphone: 'unknown' },
    overall: DEVICE_HEALTH_STATES.INITIALIZING,
    issues: [],
    lastUpdated: 0
  });
  
  const [history, setHistory] = useState([]);
  const serviceRef = useRef(null);

  useEffect(() => {
    if (!cameraRuntime) return;

    if (!serviceRef.current) {
      serviceRef.current = new DeviceMonitorService((newSnapshot, newHistory) => {
        setSnapshot(newSnapshot);
        setHistory(newHistory);
      });
    }

    // Start monitoring if stream is available
    if (cameraRuntime.stream) {
      serviceRef.current.start(cameraRuntime.stream);
    }

    return () => {
      if (serviceRef.current) {
        serviceRef.current.stop();
      }
    };
  }, [cameraRuntime]);

  return {
    snapshot,
    history
  };
};
