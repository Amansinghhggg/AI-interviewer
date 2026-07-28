import React from "react";

export const IconContainer = ({
  icon: Icon,
  size = "md", // 'sm' | 'md' | 'lg'
  variant = "primary",
  className = "",
}) => {
  const sizeMap = {
    sm: "w-8 h-8 rounded-lg text-xs",
    md: "w-10 h-10 rounded-xl text-sm",
    lg: "w-12 h-12 rounded-2xl text-base",
  };

  const iconSizeMap = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const variantMap = {
    primary: "bg-[var(--color-primary-md3)]/15 border-[var(--color-primary-md3)]/25 text-[var(--color-primary-md3)]",
    secondary: "bg-[var(--color-secondary)]/15 border-[var(--color-secondary)]/25 text-[var(--color-secondary)]",
    success: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400",
    warning: "bg-amber-500/15 border-amber-500/25 text-amber-400",
    error: "bg-rose-500/15 border-rose-500/25 text-rose-400",
    neutral: "bg-[var(--color-surface-container-highest)]/40 border-[var(--color-outline-variant)]/30 text-[var(--color-on-surface-variant)]",
  };

  return (
    <div
      className={`flex items-center justify-center border shrink-0 ${
        sizeMap[size] || sizeMap.md
      } ${variantMap[variant] || variantMap.primary} ${className}`}
    >
      {Icon && <Icon className={iconSizeMap[size] || iconSizeMap.md} />}
    </div>
  );
};

export default IconContainer;
