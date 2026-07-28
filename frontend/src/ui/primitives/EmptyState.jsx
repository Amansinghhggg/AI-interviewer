import React from "react";
import { IconContainer } from "./IconContainer";

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-12 md:p-16 border border-dashed border-[var(--color-outline-variant)]/40 rounded-3xl bg-[var(--color-surface-container-low)]/50 ${className}`}>
      {Icon && (
        <IconContainer
          icon={Icon}
          size="lg"
          variant="neutral"
          className="mb-4"
        />
      )}
      <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-on-surface,#dae2fd)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs md:text-sm text-[var(--color-on-surface-variant,#9098b6)] max-w-md mb-6 font-medium leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
