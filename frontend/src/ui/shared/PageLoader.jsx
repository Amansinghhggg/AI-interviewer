import { BrainCircuit } from "lucide-react";

const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-[var(--color-bg-base)] z-[100] flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer glowing pulse */}
        <div className="absolute inset-0 bg-[var(--color-accent-violet)] rounded-full blur-xl opacity-20 animate-pulse-glow"></div>
        
        {/* Inner spinning ring */}
        <div className="absolute inset-[-8px] rounded-full border-t-2 border-[var(--color-accent-blue)] animate-spin"></div>
        
        {/* Center Icon */}
        <div className="relative w-16 h-16 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center shadow-lg">
          <BrainCircuit className="w-8 h-8 text-[var(--color-accent-violet)] animate-pulse" />
        </div>
      </div>
      
      {/* Loading text */}
      <div className="mt-8 flex flex-col items-center">
        <h3 className="text-lg font-medium text-white tracking-wide">{message}</h3>
        <div className="flex gap-1 mt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-blue)] animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-violet)] animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-teal)] animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
