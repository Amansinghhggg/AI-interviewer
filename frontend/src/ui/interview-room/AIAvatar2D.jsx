import React, { useRef, useEffect } from 'react';
import { cn } from "../../utils/cn";
import { Mic, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIAvatar2D({ state, className, audioRef }) {
  const mouthRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    if (!audioRef?.current) return;
    
    if (!audioContextRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
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
    
    const audioEl = audioRef.current;
    audioEl.addEventListener('play', handlePlay);
    
    return () => {
      audioEl.removeEventListener('play', handlePlay);
    };
  }, [audioRef]);

  useEffect(() => {
    let animationFrameId;

    const animate = () => {
      if (state === "speaking" && analyserRef.current && dataArrayRef.current && mouthRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < 20; i++) sum += dataArrayRef.current[i];
        let volume = sum / 20 / 255;
        
        // Amplify slightly
        volume = Math.min(1.0, volume * 1.5);
        
        // Calculate mouth opening (min 1, max 10)
        const mouthOpen = 1 + (volume * 12); 
        mouthRef.current.setAttribute('ry', Math.min(12, mouthOpen));
      } else if (mouthRef.current) {
        // Idle mouth (closed)
        mouthRef.current.setAttribute('ry', 1);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [state]);

  return (
    <div
      className={cn(
        "relative w-48 h-48 sm:w-56 sm:h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-[32px] overflow-hidden shadow-2xl bg-gradient-to-b from-[#1c1c24] to-[#0a0a0f] border border-[var(--border)] flex items-center justify-center group transition-all duration-500",
        state === "speaking" && "ring-2 ring-[var(--primary)] ring-offset-4 ring-offset-[var(--background)] shadow-[0_0_40px_rgba(99,102,241,0.2)]",
        className
      )}
    >
      {/* 2D SVG Avatar */}
      <div className="absolute inset-0 flex items-end justify-center pt-12">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl" preserveAspectRatio="xMidYMax meet">
          <defs>
             {/* Gradients to make it look premium */}
             <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
               <stop offset="0%" stopColor="#ffd1b3" />
               <stop offset="100%" stopColor="#cc9b7a" />
             </linearGradient>
             <linearGradient id="suit" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#2a2a35" />
               <stop offset="100%" stopColor="#111116" />
             </linearGradient>
             <linearGradient id="hair" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#1a1a24" />
               <stop offset="100%" stopColor="#050508" />
             </linearGradient>
          </defs>
          
          {/* Shoulders / Torso */}
          <path d="M 40 200 C 40 130, 60 110, 100 110 C 140 110, 160 130, 160 200 Z" fill="url(#suit)" />
          
          {/* Shirt Collar */}
          <path d="M 85 110 L 100 130 L 115 110 Z" fill="#ffffff" opacity="0.9" />
          
          {/* Tie */}
          <path d="M 97 130 L 103 130 L 105 200 L 95 200 Z" fill="var(--primary)" />
          
          {/* Neck */}
          <rect x="90" y="80" width="20" height="40" rx="5" fill="url(#skin)" />
          {/* Neck shadow */}
          <rect x="90" y="80" width="20" height="15" fill="#000000" opacity="0.15" />

          {/* Head */}
          <ellipse cx="100" cy="65" rx="35" ry="45" fill="url(#skin)" />
          
          {/* Hair (Sleek professional cut) */}
          <path d="M 60 65 C 60 10, 140 10, 140 65 C 145 40, 130 15, 100 15 C 70 15, 55 40, 60 65 Z" fill="url(#hair)" />
          
          {/* Eyes (Focused look) */}
          <circle cx="85" cy="55" r="3" fill="#111116" opacity="0.8" />
          <circle cx="115" cy="55" r="3" fill="#111116" opacity="0.8" />
          
          {/* Eyebrows */}
          <path d="M 78 48 Q 85 45 92 49" stroke="#111116" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
          <path d="M 108 49 Q 115 45 122 48" stroke="#111116" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
          
          {/* Nose */}
          <path d="M 100 60 L 100 75 L 105 75" stroke="#b37c59" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* Mouth Base (Closed state) */}
          <ellipse cx="100" cy="92" rx="10" ry="2" fill="#a66a4f" opacity="0.8"/>
          
          {/* Animated inner mouth */}
          <ellipse ref={mouthRef} cx="100" cy="92" rx="8" ry="1" fill="#3a1c14" />
        </svg>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 z-20 pointer-events-none" />

      {/* State Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center w-full px-8 z-30">
        <AnimatePresence mode="wait">
          {state === "listening" && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white shadow-xl"
            >
              <div className="relative flex items-center justify-center w-5 h-5">
                <div className="absolute w-full h-full bg-[var(--color-success)] rounded-full animate-ping opacity-20" />
                <Mic className="w-4 h-4 text-[var(--color-success)]" />
              </div>
              <span className="text-sm font-medium tracking-wide">Listening...</span>
            </motion.div>
          )}

          {state === "thinking" && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white shadow-xl"
            >
              <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />
              <span className="text-sm font-medium tracking-wide">Processing...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
