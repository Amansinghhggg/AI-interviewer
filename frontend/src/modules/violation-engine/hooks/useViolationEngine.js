import { useState, useEffect, useRef } from 'react';
import { ViolationEngineService } from '../services/ViolationEngineService';
import { VIOLATION_CONFIG } from '../config/violation.config';

export const useViolationEngine = (deviceRuntime, faceRuntime, browserRuntime) => {
  const [active, setActive] = useState([]);
  const [history, setHistory] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [statistics, setStatistics] = useState({
    totalViolations: 0,
    activeViolations: 0,
    resolvedViolations: 0,
    warningCount: 0,
    criticalCount: 0,
    totalViolationDuration: 0
  });

  const serviceRef = useRef(null);
  
  const lastDeviceIdRef = useRef(null);
  const lastFaceIdRef = useRef(null);
  const lastBrowserIdRef = useRef(null);

  useEffect(() => {
    if (!serviceRef.current) {
      serviceRef.current = new ViolationEngineService(
        VIOLATION_CONFIG,
        (newActive, newResolved, newTimeline, newStats) => {
          setActive(newActive);
          setHistory(newResolved);
          setTimeline(newTimeline);
          setStatistics(newStats);
        }
      );
    }

    return () => {
      if (serviceRef.current) {
        serviceRef.current.destroy();
        serviceRef.current = null;
      }
    };
  }, []);

  // Helper to process histories deterministically
  const processHistory = (runtimeHistory, lastIdRef) => {
    if (!runtimeHistory || runtimeHistory.length === 0 || !serviceRef.current) return;
    
    let startIndex = 0;
    if (lastIdRef.current) {
      const idx = runtimeHistory.findIndex(h => h.id === lastIdRef.current);
      if (idx !== -1) {
        startIndex = idx + 1;
      } else {
        // ID not found, likely overflowed. Start from beginning.
        startIndex = 0;
      }
    }
    
    for (let i = startIndex; i < runtimeHistory.length; i++) {
      serviceRef.current.processEvent(runtimeHistory[i]);
    }
    
    if (runtimeHistory.length > 0) {
      lastIdRef.current = runtimeHistory[runtimeHistory.length - 1].id;
    }
  };

  // Observe Device Events
  useEffect(() => {
    processHistory(deviceRuntime?.history, lastDeviceIdRef);
  }, [deviceRuntime?.history]);

  // Observe Face Events
  useEffect(() => {
    processHistory(faceRuntime?.history, lastFaceIdRef);
  }, [faceRuntime?.history]);

  // Observe Browser Events
  useEffect(() => {
    processHistory(browserRuntime?.history, lastBrowserIdRef);
  }, [browserRuntime?.history]);

  return {
    active,
    history,
    timeline,
    statistics
  };
};
