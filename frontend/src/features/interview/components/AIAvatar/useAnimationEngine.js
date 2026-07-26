import { useEffect } from 'react';
import { animate } from 'framer-motion';
import { AvatarState } from './types';

export function useAnimationEngine(state, { eyeBlink, headRotation, breathScale, eyeLookX }) {
  // 1. Continuous Breathing
  useEffect(() => {
    const controls = animate(breathScale, [1, 1.01, 1], {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    });
    return () => controls.stop();
  }, [breathScale]);

  // 2. Random Blinking (3-6s interval, 150ms duration)
  useEffect(() => {
    let timeoutId;
    const triggerBlink = () => {
      // 1 = eyes open, 0.1 = eyes closed
      animate(eyeBlink, [1, 0.1, 1], {
        duration: 0.15,
        ease: "easeInOut"
      });
      
      const nextBlink = 3000 + Math.random() * 3000;
      timeoutId = setTimeout(triggerBlink, nextBlink);
    };
    
    timeoutId = setTimeout(triggerBlink, 1000);
    return () => clearTimeout(timeoutId);
  }, [eyeBlink]);

  // 3. State-based Animation (Head tilt, Eye direction)
  useEffect(() => {
    if (state === AvatarState.THINKING) {
       // Look slightly away and subtle head tilt
       animate(headRotation, 1.5, { duration: 0.8, ease: "easeInOut" });
       animate(eyeLookX, 8, { duration: 0.8, ease: "easeInOut" });
    } else if (state === AvatarState.LISTENING) {
       // Small listening pulse/tilt, eyes forward
       animate(headRotation, 0.5, { duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" });
       animate(eyeLookX, 0, { duration: 0.5, ease: "easeInOut" });
    } else if (state === AvatarState.SPEAKING) {
       // Active speaking movement
       animate(headRotation, [0, -1, 0.5, 0], { duration: 3, ease: "easeInOut", repeat: Infinity });
       animate(eyeLookX, 0, { duration: 0.5, ease: "easeInOut" });
    } else {
       // IDLE - reset
       animate(headRotation, 0, { duration: 0.5, ease: "easeInOut" });
       animate(eyeLookX, 0, { duration: 0.5, ease: "easeInOut" });
    }
  }, [state, headRotation, eyeLookX]);
}
