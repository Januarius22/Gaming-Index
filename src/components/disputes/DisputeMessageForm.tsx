"use client";

import { useActionState, useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { sendDisputeMessageAction } from "@/actions/disputes";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import Textarea from "@/components/ui/Textarea";
import type { ActionState } from "@/types";

const initialState: ActionState = { status: "idle", message: "" };

export default function DisputeMessageForm({
  disputeId,
  orderId,
  returnTo,
  disabled = false
}: {
  disputeId: string;
  orderId?: string;
  returnTo: string;
  disabled?: boolean;
}) {
  const [state, formAction] = useActionState(sendDisputeMessageAction, initialState);
  const [fileError, setFileError] = useState("");
  const [durations, setDurations] = useState<number[]>([]);

  const checkFiles = async (files: FileList | null) => {
    setFileError("");
    setDurations([]);

    if (!files || files.length === 0) {
      return;
    }

    if (files.length > 2) {
      setFileError("Upload up to two files at once.");
      return;
    }

    const nextDurations: number[] = [];

    for (const file of Array.from(files)) {
      if (file.type.startsWith("video/")) {
        const duration = await new Promise<number>((resolve) => {
          const video = document.createElement("video");
          video.preload = "metadata";
          video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src);
            resolve(video.duration);
          };
          video.onerror = () => resolve(0);
          video.src = URL.createObjectURL(file);
        });

        if (duration > 10) {
          setFileError("Video evidence must be 10 seconds or less.");
          return;
        }

        nextDurations.push(duration);
      } else {
        nextDurations.push(0);
      }
    }

    setDurations(nextDurations);
  };

  if (disabled) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted-foreground">
        This case is closed.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-3xl border border-border bg-white p-4 shadow-sm">
      <input type="hidden" name="disputeId" value={disputeId} />
      <input type="hidden" name="orderId" value={orderId ?? ""} />
      <input type="hidden" name="returnTo" value={returnTo} />
      {durations.map((duration, index) => (
        <input key={`${duration}-${index}`} type="hidden" name="durationSeconds" value={duration} />
      ))}
      <Textarea
        name="message"
        rows={4}
        placeholder="Add a clear update for this case."
        className="min-h-28"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-primary-soft">
          <Paperclip className="h-4 w-4" />
          Add evidence
          <input
            className="sr-only"
            type="file"
            name="evidenceFiles"
            accept="image/*,video/*"
            multiple
            onChange={(event) => {
              void checkFiles(event.currentTarget.files);
            }}
          />
        </label>
        <SubmitButton pendingLabel="Sending..." disabled={Boolean(fileError)}>
          <Send className="mr-2 h-4 w-4" />
          Send message
        </SubmitButton>
      </div>
      <FormMessage
        message={fileError || state.message}
        tone={fileError || state.status !== "success" ? "error" : "success"}
      />
    </form>
  );
}
