import { useEffect, useRef } from 'react';
import { AvatarState } from './types';

export function useAudioEngine(audioElement, mouthOpenValue, state) {
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    if (!audioElement?.current) return;

    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      } catch (e) {
        console.warn("AudioContext setup failed:", e);
      }
    }

    const handlePlay = () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };
    
    const audioEl = audioElement.current;
    audioEl.addEventListener('play', handlePlay);
    
    return () => {
      audioEl.removeEventListener('play', handlePlay);
    };
  }, [audioElement]);

  useEffect(() => {
    const animate = () => {
      if (state === AvatarState.SPEAKING && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        // Focus on lower/mid frequencies for speech estimation
        for (let i = 0; i < 20; i++) sum += dataArrayRef.current[i];
        let volume = sum / 20 / 255;
        
        // Amplify slightly and clamp
        volume = Math.min(1.0, volume * 1.5);
        
        // Update MotionValue imperatively (0 to 1 range)
        mouthOpenValue.set(volume); 
      } else {
        // Smoothly close mouth if not speaking
        const current = mouthOpenValue.get();
        if (current > 0) {
          mouthOpenValue.set(Math.max(0, current - 0.1));
        }
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [state, mouthOpenValue]);
}
