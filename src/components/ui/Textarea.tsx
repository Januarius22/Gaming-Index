import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-32 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring",
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";

export default Textarea;
