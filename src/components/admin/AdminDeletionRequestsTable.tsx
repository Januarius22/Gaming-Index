"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  approveDeletionRequestInlineAction,
  rejectDeletionRequestInlineAction
} from "@/actions/admin";
import FormMessage from "@/components/auth/FormMessage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { formatDate, titleCase } from "@/lib/utils";
import type { AccountDeletionRequest } from "@/types";

const statusVariant: Record<AccountDeletionRequest["status"], "warning" | "success" | "danger" | "neutral"> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  cancelled: "neutral"
};

export default function AdminDeletionRequestsTable({
  requests
}: {
  requests: AccountDeletionRequest[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [visibleRequests, setVisibleRequests] = useState(requests);
  const [approvingRequest, setApprovingRequest] = useState<AccountDeletionRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<AccountDeletionRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  useEffect(() => {
    setVisibleRequests(requests);
  }, [requests]);

  const submitAction = (
    formData: FormData,
    mode: "approve" | "reject"
  ) => {
    const requestId = String(formData.get("requestId") ?? "");
    setPendingId(requestId);
    setFeedback(null);

    startTransition(() => {
      void (async () => {
        const result =
          mode === "approve"
            ? await approveDeletionRequestInlineAction(formData)
            : await rejectDeletionRequestInlineAction(formData);

        if (result.status === "success" && result.requestId) {
          setVisibleRequests((current) =>
            current.map((request) =>
              request.id === result.requestId
                ? {
                    ...request,
                    status: mode === "approve" ? "approved" : "rejected",
                    admin_note: mode === "reject" ? adminNote : "Account archived after user deletion request.",
                    reviewed_at: new Date().toISOString()
                  }
                : request
            )
          );
          setApprovingRequest(null);
          setRejectingRequest(null);
          setAdminNote("");
          router.refresh();
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
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleRequests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No deletion requests.
                </td>
              </tr>
            ) : (
              visibleRequests.map((request) => {
                const isPending = request.status === "pending";

                return (
                  <tr key={request.id} className="border-b border-border/60 align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">{request.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        @{request.username} - {request.email}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="max-w-md text-sm leading-6 text-foreground">{request.reason}</p>
                      {request.admin_note ? (
                        <p className="mt-2 max-w-md text-xs leading-5 text-muted-foreground">
                          Admin note: {request.admin_note}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant[request.status]}>{titleCase(request.status)}</Badge>
                    </td>
                    <td className="px-4 py-4">{formatDate(request.created_at)}</td>
                    <td className="px-4 py-4">
                      {isPending ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="gap-2"
                            onClick={() => setApprovingRequest(request)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="danger"
                            className="gap-2"
                            onClick={() => setRejectingRequest(request)}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground">
                          Reviewed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(approvingRequest)}
        title="Approve deletion request?"
        description={approvingRequest ? `${approvingRequest.full_name} (@${approvingRequest.username})` : undefined}
        panelClassName="max-w-lg"
        onClose={() => setApprovingRequest(null)}
      >
        {approvingRequest ? (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              submitAction(new FormData(event.currentTarget), "approve");
            }}
          >
            <input type="hidden" name="requestId" value={approvingRequest.id} />
            <div className="rounded-3xl border border-border bg-surface p-4 text-sm leading-6 text-muted-foreground">
              This archives the account and moves it to Deleted Accounts. Financial and case records remain available for audit.
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setApprovingRequest(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pendingId === approvingRequest.id}>
                {pendingId === approvingRequest.id ? "Approving..." : "Approve deletion"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(rejectingRequest)}
        title="Reject deletion request?"
        description={rejectingRequest ? `${rejectingRequest.full_name} (@${rejectingRequest.username})` : undefined}
        panelClassName="max-w-lg"
        onClose={() => setRejectingRequest(null)}
      >
        {rejectingRequest ? (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              submitAction(new FormData(event.currentTarget), "reject");
            }}
          >
            <input type="hidden" name="requestId" value={rejectingRequest.id} />
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Reason</span>
              <textarea
                name="adminNote"
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                required
                placeholder="Explain why this request cannot be approved now."
                className="min-h-28 w-full rounded-3xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring"
              />
            </label>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setRejectingRequest(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" disabled={pendingId === rejectingRequest.id}>
                {pendingId === rejectingRequest.id ? "Rejecting..." : "Reject request"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
