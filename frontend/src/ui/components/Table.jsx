import * as React from "react";
import { cn } from "../../utils/cn";

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-xs sm:text-sm min-w-[550px] sm:min-w-0 border-collapse", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b border-[var(--border)] bg-[var(--background-secondary)]/50", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-[var(--border)] transition-colors hover:bg-[var(--background-secondary)]/50 data-[state=selected]:bg-[var(--background-secondary)]",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 sm:h-12 px-3 sm:px-4 text-left align-middle font-semibold text-[var(--text-secondary)] whitespace-nowrap [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-3 sm:p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[var(--text-primary)]", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
};
