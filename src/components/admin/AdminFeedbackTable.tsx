"use client";

import { useEffect, useState, useTransition } from "react";
import { updateFeedbackStatusAction } from "@/actions/feedback";
import FormMessage from "@/components/auth/FormMessage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { formatDate } from "@/lib/utils";
import type { SiteFeedback, SiteFeedbackStatus } from "@/types";

const statusVariant = {
  new: "warning",
  reviewed: "info",
  planned: "success",
  closed: "neutral"
} as const;

function labelize(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function AdminFeedbackTable({ feedback }: { feedback: SiteFeedback[] }) {
  const [, startTransition] = useTransition();
  const [visibleFeedback, setVisibleFeedback] = useState(feedback);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  useEffect(() => {
    setVisibleFeedback(feedback);
  }, [feedback]);

  const submitUpdate = (formData: FormData) => {
    const feedbackId = String(formData.get("feedbackId") ?? "");
    setPendingId(feedbackId);
    setNotice(null);

    startTransition(() => {
      void (async () => {
        const result = await updateFeedbackStatusAction(formData);

        if (result.status === "success" && result.feedbackId) {
          setVisibleFeedback((current) =>
            current.map((item) =>
              item.id === result.feedbackId
                ? {
                    ...item,
                    status: result.nextStatus as SiteFeedbackStatus,
                    admin_note: result.adminNote
                  }
                : item
            )
          );
        }

        setNotice({
          message: result.message,
          tone: result.status === "success" ? "success" : "error"
        });
        setPendingId(null);
      })();
    });
  };

  return (
    <div className="space-y-4">
      <FormMessage message={notice?.message} tone={notice?.tone} />
      {visibleFeedback.length === 0 ? (
        <p className="rounded-[22px] bg-surface p-5 text-sm text-muted-foreground">
          No feedback yet.
        </p>
      ) : (
        visibleFeedback.map((item) => (
          <div key={item.id} className="rounded-[24px] border border-border bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant[item.status]}>{labelize(item.status)}</Badge>
                  <Badge variant="neutral">{labelize(item.category)}</Badge>
                  <Badge variant={item.workspace === "seller" ? "info" : "neutral"}>
                    {labelize(item.workspace)}
                  </Badge>
                  {item.rating ? <Badge variant="success">{item.rating}/5</Badge> : null}
                </div>
                <p className="font-semibold text-foreground">
                  {item.profile_name ?? "User"}{" "}
                  <span className="font-normal text-muted-foreground">
                    @{item.profile_username ?? "user"}
                  </span>
                </p>
                <p className="text-sm leading-7 text-muted-foreground">{item.message}</p>
                <p className="text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                {item.admin_note ? (
                  <div className="rounded-2xl bg-surface p-3 text-sm">
                    <p className="font-semibold text-foreground">Admin note</p>
                    <p className="mt-1 text-muted-foreground">{item.admin_note}</p>
                  </div>
                ) : null}
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submitUpdate(new FormData(event.currentTarget));
                }}
                className="w-full space-y-3 lg:w-72"
              >
                <input type="hidden" name="feedbackId" value={item.id} />
                <Select name="status" defaultValue={item.status}>
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="planned">Planned</option>
                  <option value="closed">Closed</option>
                </Select>
                <Textarea
                  name="adminNote"
                  rows={3}
                  defaultValue={item.admin_note}
                  placeholder="Admin note"
                />
                <Button type="submit" size="sm" className="w-full" disabled={pendingId === item.id}>
                  {pendingId === item.id ? "Updating..." : "Update feedback"}
                </Button>
              </form>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
