import React from "react";
import { motion } from "framer-motion";

export const PageHeader = ({
  badgeIcon: BadgeIcon,
  badgeText,
  title,
  description,
  actions,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 ${className}`}
    >
      <div className="space-y-1.5">
        {badgeText && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary-md3)]/10 border border-[var(--color-primary-md3)]/20 text-[var(--color-primary-md3)] text-[11px] font-black uppercase tracking-widest">
            {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
            <span>{badgeText}</span>
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[var(--color-on-surface,#dae2fd)]">
          {title}
        </h1>
        {description && (
          <p className="text-xs md:text-sm text-[var(--color-on-surface-variant,#9098b6)] font-medium max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </motion.div>
  );
};

export default PageHeader;
