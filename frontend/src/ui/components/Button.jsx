import * as React from "react";
import { Slot } from "@radix-ui/react-slot"; // We need to install this if we want asChild support, or we can just omit it for now
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-white shadow-sm hover:bg-[var(--primary-hover)]",
        destructive:
          "bg-[var(--color-danger)] text-white shadow-sm hover:bg-[var(--color-danger)]/90",
        outline:
          "border border-[var(--border)] bg-transparent hover:bg-[var(--background-secondary)] text-[var(--text-primary)]",
        secondary:
          "bg-[var(--background-secondary)] text-[var(--text-primary)] hover:bg-[var(--border)]",
        ghost: "hover:bg-[var(--background-secondary)] text-[var(--text-primary)]",
        link: "text-[var(--primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 sm:h-10 px-4 py-2.5 sm:py-2 text-xs sm:text-sm",
        sm: "h-9.5 sm:h-9 rounded-[var(--radius-sm)] px-3 text-xs sm:text-sm",
        lg: "h-12 sm:h-11 rounded-[var(--radius-lg)] px-6 sm:px-8 text-sm sm:text-base",
        icon: "h-10 w-10 shrink-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
