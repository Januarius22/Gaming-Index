"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import Button, { type ButtonProps } from "@/components/ui/Button";

export default function SubmitButton({
  children,
  pendingLabel = "Please wait...",
  ...props
}: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || props.disabled} {...props}>
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
