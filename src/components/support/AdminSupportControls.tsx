"use client";

import { useState, useTransition } from "react";
import { updateSupportTicketStatusAction } from "@/actions/support";
import FormMessage from "@/components/auth/FormMessage";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import type { SupportTicketStatus } from "@/types";

export default function AdminSupportControls({
  ticketId,
  requesterId,
  workspace,
  status
}: {
  ticketId: string;
  requesterId: string;
  workspace: "account" | "seller";
  status: SupportTicketStatus;
}) {
  const [, startTransition] = useTransition();
  const [notice, setNotice] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        setNotice(null);
        const formData = new FormData(event.currentTarget);

        startTransition(() => {
          void (async () => {
            const result = await updateSupportTicketStatusAction(formData);
            setNotice({
              message: result.message,
              tone: result.status
            });
            setPending(false);
          })();
        });
      }}
      className="space-y-3"
    >
      <FormMessage message={notice?.message} tone={notice?.tone} />
      <input type="hidden" name="ticketId" value={ticketId} />
      <input type="hidden" name="requesterId" value={requesterId} />
      <input type="hidden" name="workspace" value={workspace} />
      <Select name="status" defaultValue={status}>
        <option value="open">Open</option>
        <option value="in_review">In review</option>
        <option value="resolved">Resolved</option>
        <option value="closed">Closed</option>
      </Select>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Updating..." : "Update status"}
      </Button>
    </form>
  );
}
