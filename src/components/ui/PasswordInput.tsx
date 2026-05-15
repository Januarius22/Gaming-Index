"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import Input, { type InputProps } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends Omit<InputProps, "type"> {
  wrapperClassName?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, wrapperClassName, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <div className={cn("relative", wrapperClassName)}>
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-12", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary-soft hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
