import React from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { GlassCard } from "./GlassCard";

export const LoadingState = ({ message = "Loading content...", minHeight = "min-h-[60vh]" }) => {
  return (
    <div className={`${minHeight} flex flex-col items-center justify-center gap-3 p-8`}>
      <Loader2 className="w-9 h-9 animate-spin text-[var(--color-primary-md3)]" />
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant,#9098b6)] animate-pulse">
        {message}
      </p>
    </div>
  );
};

export const ErrorState = ({
  title = "Something went wrong",
  message,
  onRetry,
  className = "",
}) => {
  return (
    <GlassCard className={`max-w-xl mx-auto text-center p-8 md:p-12 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400 mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-black uppercase tracking-tight text-[var(--color-on-surface,#dae2fd)] mb-2">
        {title}
      </h3>
      {message && (
        <p className="text-xs md:text-sm text-[var(--color-on-surface-variant,#9098b6)] font-medium max-w-md mx-auto mb-6">
          {message}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary-md3)] text-white text-xs font-black uppercase tracking-wider hover:bg-[var(--color-primary-md3)]/90 transition-all shadow-lg shadow-[var(--color-primary-md3)]/25"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      )}
    </GlassCard>
  );
};
