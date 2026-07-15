import { useState, useEffect } from "react";

export const useMicrophones = () => {
  const [microphones, setMicrophones] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          throw new Error("enumerateDevices not supported");
        }

        // Request initial permission if we haven't already, so devices get labeled
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (e) {
          console.warn("Could not get initial permission to label devices.", e);
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(device => device.kind === "audioinput");
        setMicrophones(audioInputs);
      } catch (err) {
        setError(err);
      }
    };

    fetchDevices();

    navigator.mediaDevices?.addEventListener?.("devicechange", fetchDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener?.("devicechange", fetchDevices);
    };
  }, []);

  return { microphones, error };
};
