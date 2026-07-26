import React from 'react';
import { motion, useTransform } from 'framer-motion';

export default function AvatarWaveform({ mouthOpen }) {
  // Drive waveform bars directly from the Web Audio amplitude MotionValue
  // Different height mappings create a varied, realistic equalizer look
  const height1 = useTransform(mouthOpen, [0, 1], [4, 24]);
  const height2 = useTransform(mouthOpen, [0, 1], [4, 36]);
  const height3 = useTransform(mouthOpen, [0, 1], [4, 16]);

  return (
    <div className="flex items-end justify-center gap-1.5 h-10">
      <motion.div style={{ height: height3 }} className="w-1 bg-[var(--primary)] rounded-full opacity-50" />
      <motion.div style={{ height: height1 }} className="w-1.5 bg-[var(--primary)] rounded-full opacity-80" />
      <motion.div style={{ height: height2 }} className="w-2 bg-[var(--primary)] rounded-full shadow-[0_0_10px_var(--primary)]" />
      <motion.div style={{ height: height1 }} className="w-1.5 bg-[var(--primary)] rounded-full opacity-80" />
      <motion.div style={{ height: height3 }} className="w-1 bg-[var(--primary)] rounded-full opacity-50" />
    </div>
  );
}
