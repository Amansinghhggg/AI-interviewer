import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-white",
        secondary:
          "bg-[var(--background-secondary)] text-[var(--text-primary)] border border-[var(--border)]",
        destructive:
          "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20",
        outline: "text-[var(--text-primary)] border border-[var(--border)]",
        success:
          "bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20",
        warning:
          "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20",
        info:
          "bg-[var(--color-info)]/10 text-[var(--color-info)] border border-[var(--color-info)]/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
