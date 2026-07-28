import React from "react";

export const Chip = ({
  label,
  selected = false,
  onClick,
  onRemove,
  icon: Icon,
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border";

  const stateStyles = selected
    ? "bg-[var(--color-primary-md3)] text-white border-[var(--color-primary-md3)] shadow-md shadow-[var(--color-primary-md3)]/20 scale-[1.02]"
    : "bg-[var(--color-surface-container-high)]/40 text-[var(--color-on-surface-variant,#9098b6)] border-[var(--color-outline-variant)]/40 hover:border-[var(--color-primary-md3)]/40 hover:text-[var(--color-on-surface,#dae2fd)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyles} ${stateStyles} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{label}</span>
      {onRemove && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:text-rose-400 p-0.5 rounded-md"
        >
          ×
        </span>
      )}
    </button>
  );
};

export default Chip;
