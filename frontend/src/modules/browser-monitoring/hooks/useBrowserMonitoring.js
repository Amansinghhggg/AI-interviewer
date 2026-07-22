import { useState, useEffect, useRef } from 'react';
import { BrowserMonitorService } from '../services/BrowserMonitorService';
import { BROWSER_STATES } from '../utils/browserMonitoring.states';

export const useBrowserMonitoring = () => {
  const [snapshot, setSnapshot] = useState({
    focused: true,
    visible: true,
    fullscreen: false,
    online: true,
    timestamp: 0
  });
  
  const [status, setStatus] = useState(BROWSER_STATES.ACTIVE);
  const [history, setHistory] = useState([]);
  const serviceRef = useRef(null);

  useEffect(() => {
    // Only initialize once
    if (!serviceRef.current) {
      serviceRef.current = new BrowserMonitorService((newSnapshot, newStatus, newHistory) => {
        setSnapshot(newSnapshot);
        setStatus(newStatus);
        setHistory(newHistory);
      });
      serviceRef.current.start();
    }

    return () => {
      if (serviceRef.current) {
        serviceRef.current.destroy();
        serviceRef.current = null;
      }
    };
  }, []);

  return {
    snapshot,
    status,
    history
  };
};
