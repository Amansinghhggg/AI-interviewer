import React from "react";

export const SectionHeader = ({
  icon: Icon,
  title,
  subtitle,
  actions,
  className = "",
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-md3)]/15 border border-[var(--color-primary-md3)]/25 flex items-center justify-center text-[var(--color-primary-md3)] shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div>
          <h2 className="text-base md:text-lg font-black uppercase tracking-tight text-[var(--color-on-surface,#dae2fd)]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[var(--color-on-surface-variant,#9098b6)] font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
