"use client";

import { useEffect, useState, useTransition } from "react";
import {
  approveSuspensionAppealAction,
  rejectSuspensionAppealAction
} from "@/actions/admin";
import FormMessage from "@/components/auth/FormMessage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import { formatDate } from "@/lib/utils";
import type { SuspensionAppeal } from "@/types";

const statusVariant = {
  pending: "warning",
  reviewed: "info",
  approved: "success",
  rejected: "danger"
} as const;

export default function AdminSuspensionAppealsTable({
  appeals
}: {
  appeals: SuspensionAppeal[];
}) {
  const [, startTransition] = useTransition();
  const [visibleAppeals, setVisibleAppeals] = useState(appeals);
  const [rejectingAppeal, setRejectingAppeal] = useState<SuspensionAppeal | null>(null);
  const [approvingAppeal, setApprovingAppeal] = useState<SuspensionAppeal | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);

  useEffect(() => {
    setVisibleAppeals(appeals);
  }, [appeals]);

  const submitApprove = (formData: FormData) => {
    const appealId = String(formData.get("appealId") ?? "");
    const adminNote = String(formData.get("adminNote") ?? "");
    setPendingId(appealId);
    setFeedback(null);

    startTransition(() => {
      void (async () => {
        const result = await approveSuspensionAppealAction(formData);

        if (result.status === "success" && result.appealId) {
          setVisibleAppeals((current) =>
            current.map((appeal) =>
              appeal.id === result.appealId
                ? { ...appeal, status: "approved", admin_note: adminNote || result.adminNote }
                : appeal
            )
          );
          setApprovingAppeal(null);
        }

        setFeedback({
          message: result.message,
          tone: result.status === "success" ? "success" : "error"
        });
        setPendingId(null);
      })();
    });
  };

  const submitReject = (formData: FormData) => {
    const appealId = String(formData.get("appealId") ?? "");
    const adminNote = String(formData.get("adminNote") ?? "");
    setPendingId(appealId);
    setFeedback(null);

    startTransition(() => {
      void (async () => {
        const result = await rejectSuspensionAppealAction(formData);

        if (result.status === "success" && result.appealId) {
          setVisibleAppeals((current) =>
            current.map((appeal) =>
              appeal.id === result.appealId
                ? { ...appeal, status: "rejected", admin_note: adminNote }
                : appeal
            )
          );
          setRejectingAppeal(null);
        }

        setFeedback({
          message: result.message,
          tone: result.status === "success" ? "success" : "error"
        });
        setPendingId(null);
      })();
    });
  };

  return (
    <>
      <FormMessage message={feedback?.message} tone={feedback?.tone} />
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Appeal</th>
              <th className="px-4 py-3 font-medium">Suspension</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleAppeals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No suspension appeals yet.
                </td>
              </tr>
            ) : (
              visibleAppeals.map((appeal) => {
                const isPending = appeal.status === "pending";
                const isSubmitting = pendingId === appeal.id;

                return (
                  <tr key={appeal.id} className="border-b border-border/60 align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">{appeal.profile_name ?? "User"}</div>
                      <div className="text-xs text-muted-foreground">
                        @{appeal.profile_username ?? "user"} · {appeal.email || appeal.profile_email}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{appeal.phone_number}</div>
                    </td>
                    <td className="max-w-sm px-4 py-4">
                      <p className="line-clamp-4 leading-6 text-foreground">{appeal.appeal_reason}</p>
                    </td>
                    <td className="max-w-xs px-4 py-4">
                      <p className="line-clamp-3 leading-6 text-muted-foreground">
                        {appeal.banned_reason || "No reason provided."}
                      </p>
                      {appeal.banned_at ? (
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">
                          {formatDate(appeal.banned_at)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant[appeal.status]}>{appeal.status}</Badge>
                      {appeal.admin_note ? (
                        <p className="mt-2 max-w-xs text-xs text-muted-foreground">
                          Note: {appeal.admin_note}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">{formatDate(appeal.created_at)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          type="button"
                          disabled={!isPending || isSubmitting}
                          onClick={() => setApprovingAppeal(appeal)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          type="button"
                          variant="danger"
                          disabled={!isPending || isSubmitting}
                          onClick={() => setRejectingAppeal(appeal)}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(approvingAppeal)}
        onClose={() => setApprovingAppeal(null)}
        title="Approve appeal?"
        description="This will lift the account suspension and restore access."
      >
        {approvingAppeal ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitApprove(new FormData(event.currentTarget));
            }}
            className="space-y-4"
          >
            <input type="hidden" name="appealId" value={approvingAppeal.id} />
            <input type="hidden" name="profileId" value={approvingAppeal.profile_id} />
            <Textarea
              name="adminNote"
              placeholder="Optional note for this approval."
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setApprovingAppeal(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pendingId === approvingAppeal.id}>
                {pendingId === approvingAppeal.id ? "Approving..." : "Approve appeal"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(rejectingAppeal)}
        onClose={() => setRejectingAppeal(null)}
        title="Reject appeal?"
        description="The user will remain suspended and receive your reason."
      >
        {rejectingAppeal ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitReject(new FormData(event.currentTarget));
            }}
            className="space-y-4"
          >
            <input type="hidden" name="appealId" value={rejectingAppeal.id} />
            <input type="hidden" name="profileId" value={rejectingAppeal.profile_id} />
            <label className="block text-sm font-semibold text-foreground" htmlFor="adminNote">
              Rejection reason
            </label>
            <Textarea
              id="adminNote"
              name="adminNote"
              placeholder="Explain why this appeal was rejected."
              required
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setRejectingAppeal(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" disabled={pendingId === rejectingAppeal.id}>
                {pendingId === rejectingAppeal.id ? "Rejecting..." : "Reject appeal"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
