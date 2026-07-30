import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2, Sparkles } from "lucide-react";
import { CONVERSATION_STATES } from '../../modules/interview/conversation/index';
import { cn } from "../../utils/cn";
import AvatarPlayer from "../../components/AvatarPlayer";

export default function AIAvatar({ conversationState, className }) {
  // Map CONVERSATION_STATES to our internal visual states
  let state = "idle";
  if (conversationState === CONVERSATION_STATES.SPEAKING) state = "speaking";
  else if (conversationState === CONVERSATION_STATES.LISTENING) state = "listening";
  else if (conversationState === CONVERSATION_STATES.THINKING) state = "thinking";
  else if (conversationState === CONVERSATION_STATES.FINISHED) state = "finished";

  return (
    <div
      className={cn(
        "relative w-64 h-64 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-[32px] overflow-hidden shadow-2xl bg-[var(--background-secondary)] border border-[var(--border)] flex items-center justify-center group transition-all duration-500",
        state === "speaking" && "ring-2 ring-[var(--primary)] ring-offset-4 ring-offset-[var(--background)] shadow-[0_0_40px_rgba(99,102,241,0.2)]",
        className
      )}
    >
      <AvatarPlayer
        mode={state}
        aspectRatio="1 / 1"
        className="w-full h-full rounded-none"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none z-10" />

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
