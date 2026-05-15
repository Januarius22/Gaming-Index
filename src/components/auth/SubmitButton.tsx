"use client";

import { useFormStatus } from "react-dom";
import Button, { type ButtonProps } from "@/components/ui/Button";

export default function SubmitButton({
  children,
  pendingLabel = "Please wait...",
  ...props
}: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || props.disabled} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
