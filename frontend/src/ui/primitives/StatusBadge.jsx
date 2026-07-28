import React from "react";

export const StatusBadge = ({
  status,
  size = "md", // 'sm' | 'md' | 'lg'
  customLabel,
  className = "",
}) => {
  const getStatusConfig = (val) => {
    const s = String(val || "").toLowerCase();

    if (s === "completed" || s === "strong_hire" || s === "strong hire" || s === "ready" || s === "pass") {
      return {
        label: customLabel || "Completed",
        styles: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      };
    }
    if (s === "in-progress" || s === "in progress" || s === "hire" || s === "active") {
      return {
        label: customLabel || "In Progress",
        styles: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      };
    }
    if (s === "pending" || s === "waiting" || s === "borderline") {
      return {
        label: customLabel || "Pending",
        styles: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      };
    }
    if (s === "failed" || s === "expired" || s === "no_hire" || s === "no hire" || s === "missed") {
      return {
        label: customLabel || "Failed",
        styles: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      };
    }
    return {
      label: customLabel || val || "Unknown",
      styles: "bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/30",
    };
  };

  const config = getStatusConfig(status);

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-lg border ${
        sizeStyles[size] || sizeStyles.md
      } ${config.styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
