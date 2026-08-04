import React from "react";
import { motion } from "framer-motion";

export const MetricCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  badgeText,
  badgeVariant = "primary",
  trend,
  className = "",
  glowColor = "primary",
}) => {
  const glowMap = {
    primary: "group-hover:bg-[var(--color-primary-md3)]/10",
    secondary: "group-hover:bg-[var(--color-secondary)]/10",
    success: "group-hover:bg-emerald-500/10",
    warning: "group-hover:bg-amber-500/10",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] p-4 sm:p-5 md:p-6 rounded-2xl shadow-lg relative overflow-hidden group transition-all ${className}`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] pointer-events-none transition-all ${glowMap[glowColor] || glowMap.primary}`} />

      <div className="relative z-10 flex items-start justify-between mb-2.5 sm:mb-3">
        {Icon && (
          <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[var(--color-surface-container-highest)]/40 border border-[var(--color-outline-variant)]/30 flex items-center justify-center text-[var(--color-primary-md3)] shrink-0">
            <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </div>
        )}
        {badgeText && (
          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] border border-[var(--color-outline-variant)]/30 truncate max-w-[120px]">
            {badgeText}
          </span>
        )}
      </div>

      <div className="relative z-10 min-w-0">
        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] text-[var(--color-on-surface-variant,#9098b6)] mb-0.5 sm:mb-1 truncate">
          {label}
        </p>
        <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--color-on-surface,#dae2fd)] tracking-tight truncate">
            {value}
          </h3>
          {subtext && (
            <span className="text-[11px] sm:text-xs font-semibold text-[var(--color-on-surface-variant,#9098b6)] truncate">
              {subtext}
            </span>
          )}
        </div>
        {trend && (
          <p className="text-[10px] sm:text-[11px] font-medium text-[var(--color-on-surface-variant)] mt-1 sm:mt-1.5 flex items-center gap-1">
            {trend}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
