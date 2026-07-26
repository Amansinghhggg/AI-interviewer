import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2, Sparkles } from "lucide-react";
import { CONVERSATION_STATES } from '../../modules/interview/conversation/index';
import { cn } from "../../utils/cn";

export default function AIAvatar({ conversationState, className }) {
  // Map CONVERSATION_STATES to our internal visual states
  let state = "idle";
  if (conversationState === CONVERSATION_STATES.SPEAKING) state = "speaking";
  else if (conversationState === CONVERSATION_STATES.LISTENING) state = "listening";
  else if (conversationState === CONVERSATION_STATES.THINKING) state = "thinking";
  else if (conversationState === CONVERSATION_STATES.FINISHED) state = "finished";

  const imageVariants = {
    idle: {
      scale: [1, 1.01, 1],
      y: [0, -2, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
    listening: {
      scale: [1.02, 1.03, 1.02],
      y: 0,
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
    speaking: {
      scale: [1.02, 1.025, 1.02],
      y: [0, -1, 0],
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
    },
    thinking: {
      scale: 1,
      x: [0, 4, 0],
      y: [0, 2, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
    finished: {
      scale: 1,
      y: 0,
    },
  };

  return (
    <div
      className={cn(
        "relative w-64 h-64 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-[32px] overflow-hidden shadow-2xl bg-[var(--background-secondary)] border border-[var(--border)] flex items-center justify-center group transition-all duration-500",
        state === "speaking" && "ring-2 ring-[var(--primary)] ring-offset-4 ring-offset-[var(--background)] shadow-[0_0_40px_rgba(99,102,241,0.2)]",
        className
      )}
    >
      {/* Abstract AI Orb */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Core */}
        <motion.div
          className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-[var(--primary)] to-purple-400 blur-sm z-20"
          animate={{
            scale: state === "speaking" ? [1, 1.1, 0.95, 1.15, 1] : state === "thinking" ? [1, 0.9, 1] : [1, 1.05, 1],
            opacity: state === "finished" ? 0.5 : 1,
          }}
          transition={{
            duration: state === "speaking" ? 0.8 : 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Inner Ring */}
        <motion.div
          className="absolute w-40 h-40 rounded-full border border-white/20 z-10"
          style={{ borderTopColor: "var(--primary)" }}
          animate={{
            rotate: state === "thinking" ? 360 : 0,
            scale: state === "speaking" ? [1, 1.2, 1] : 1,
            opacity: state === "finished" ? 0 : 0.8,
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
          }}
        />

        {/* Outer Audio Waves (Only when speaking) */}
        <AnimatePresence>
          {state === "speaking" && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.8, opacity: [0, 0.5, 0] }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-48 h-48 rounded-full border border-[var(--primary)] z-0"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 2.2, opacity: [0, 0.3, 0] }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className="absolute w-48 h-48 rounded-full border border-[var(--primary)] z-0"
              />
            </>
          )}
        </AnimatePresence>

        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-[var(--primary)]/5 blur-3xl rounded-full" />
      </div>

      {/* State Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center w-full px-8 z-10">
        <AnimatePresence mode="wait">
          {state === "listening" && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white"
            >
              <div className="relative flex items-center justify-center w-6 h-6">
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
              className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white"
            >
              <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin" />
              <span className="text-sm font-medium tracking-wide">Processing...</span>
            </motion.div>
          )}

          {state === "speaking" && (
            <motion.div
              key="speaking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[var(--primary)]"
            >
              <Sparkles className="w-4 h-4" />
              <div className="flex gap-1 ml-1 h-3 items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-[var(--primary)] rounded-full"
                    animate={{
                      height: ["20%", "100%", "20%"],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
