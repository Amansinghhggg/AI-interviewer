import React from "react";
import { motion } from "framer-motion";

export const GlassCard = ({
  children,
  className = "",
  padding = "p-6 md:p-8",
  hoverEffect = false,
  glowEffect = false,
  onClick,
}) => {
  const Component = onClick ? motion.div : "div";
  const motionProps = onClick
    ? {
        whileHover: { y: hoverEffect ? -2 : 0 },
        onClick,
        role: "button",
        tabIndex: 0,
      }
    : {};

  return (
    <Component
      {...motionProps}
      className={`bg-[var(--color-surface-container-low)] border border-[var(--color-surface-variant)] ${padding} rounded-3xl shadow-xl relative overflow-hidden transition-all ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {glowEffect && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary-md3)]/5 rounded-full blur-[60px] pointer-events-none" />
      )}
      <div className="relative z-10">{children}</div>
    </Component>
  );
};

export default GlassCard;
