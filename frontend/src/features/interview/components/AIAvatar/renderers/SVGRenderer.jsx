import React from 'react';
import { motion, useTransform } from 'framer-motion';

export default function SVGRenderer({ 
  mouthOpen, 
  eyeBlink, 
  headRotation, 
  breathScale, 
  eyeLookX, 
  isThinking 
}) {
  
  // Transform the abstract amplitude value (0-1) into concrete SVG path data (rx/ry)
  const mouthRy = useTransform(mouthOpen, [0, 1], [1, 12]);
  
  return (
    <motion.svg 
      viewBox="0 0 200 200" 
      className="w-full h-full drop-shadow-2xl" 
      preserveAspectRatio="xMidYMax meet"
      style={{ scale: breathScale }}
    >
       <defs>
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
       
       <motion.g style={{ rotate: headRotation, originX: "100px", originY: "110px" }}>
          {/* Shoulders / Torso */}
          <path d="M 40 200 C 40 130, 60 110, 100 110 C 140 110, 160 130, 160 200 Z" fill="url(#suit)" />
          
          {/* Shirt Collar */}
          <path d="M 85 110 L 100 130 L 115 110 Z" fill="#ffffff" opacity="0.9" />
          
          {/* Tie */}
          <path d="M 97 130 L 103 130 L 105 200 L 95 200 Z" fill="var(--primary)" />
          
          {/* Neck */}
          <rect x="90" y="80" width="20" height="40" rx="5" fill="url(#skin)" />
          <rect x="90" y="80" width="20" height="15" fill="#000000" opacity="0.15" />
          
          {/* Head base */}
          <ellipse cx="100" cy="65" rx="35" ry="45" fill="url(#skin)" />
          
          {/* Hair */}
          <path d="M 60 65 C 60 10, 140 10, 140 65 C 145 40, 130 15, 100 15 C 70 15, 55 40, 60 65 Z" fill="url(#hair)" />
          
          {/* Eyes Group */}
          <motion.g style={{ scaleY: eyeBlink, originY: "55px" }}>
             {/* Sclera */}
             <circle cx="85" cy="55" r="4" fill="#ffffff" />
             <circle cx="115" cy="55" r="4" fill="#ffffff" />
             
             {/* Pupils driven by eyeLookX */}
             <motion.circle cx="85" cy="55" r="2" fill="#111116" style={{ x: eyeLookX }} />
             <motion.circle cx="115" cy="55" r="2" fill="#111116" style={{ x: eyeLookX }} />
             
             {/* Thinking state glow overlay */}
             {isThinking && (
               <>
                 <circle cx="85" cy="55" r="6" fill="var(--primary)" opacity="0.4" className="animate-pulse" />
                 <circle cx="115" cy="55" r="6" fill="var(--primary)" opacity="0.4" className="animate-pulse" />
               </>
             )}
          </motion.g>

          {/* Eyebrows */}
          <path d="M 78 48 Q 85 45 92 49" stroke="#111116" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
          <path d="M 108 49 Q 115 45 122 48" stroke="#111116" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />

          {/* Nose */}
          <path d="M 100 60 L 100 75 L 105 75" stroke="#b37c59" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* Mouth Base (Closed state lips) */}
          <ellipse cx="100" cy="92" rx="10" ry="2" fill="#a66a4f" opacity="0.8"/>
          
          {/* Animated inner mouth driven directly by Web Audio Engine MotionValue */}
          <motion.ellipse 
             cx="100" 
             cy="92" 
             rx="8" 
             style={{ ry: mouthRy }}
             fill="#3a1c14" 
          />
       </motion.g>
    </motion.svg>
  );
}
