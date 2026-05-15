import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-12 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-ring",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);

Select.displayName = "Select";

export default Select;
