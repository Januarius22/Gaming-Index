"use client";

import { useState, useTransition } from "react";
import FormMessage from "@/components/auth/FormMessage";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";

export default function SupportReplyForm({
  ticketId,
  action,
  hiddenFields = {},
  disabled = false
}: {
  ticketId: string;
  action: (formData: FormData) => Promise<{ status: "success" | "error"; message: string }>;
  hiddenFields?: Record<string, string>;
  disabled?: boolean;
}) {
  const [, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setNotice(null);
        setPending(true);

        startTransition(() => {
          void (async () => {
            const result = await action(formData);
            setNotice({
              message: result.message,
              tone: result.status
            });
            if (result.status === "success") {
              event.currentTarget.reset();
            }
            setPending(false);
          })();
        });
      }}
      className="space-y-3"
    >
      <FormMessage message={notice?.message} tone={notice?.tone} />
      <input type="hidden" name="ticketId" value={ticketId} />
      {Object.entries(hiddenFields).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <Textarea name="message" rows={4} placeholder="Reply" disabled={disabled} required />
      <Button type="submit" disabled={disabled || pending}>
        {pending ? "Sending..." : "Send reply"}
      </Button>
    </form>
  );
}
