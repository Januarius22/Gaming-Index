"use client";

import { useEffect, useState, useTransition } from "react";
import { markWithdrawalPaidAction, rejectWithdrawalAction } from "@/actions/admin";
import FormMessage from "@/components/auth/FormMessage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { WithdrawalRequest } from "@/types";

export default function AdminWithdrawalsTable({
  requests
}: {
  requests: WithdrawalRequest[];
}) {
  const [, startTransition] = useTransition();
  const [visibleRequests, setVisibleRequests] = useState(requests);
  const [rejectingRequest, setRejectingRequest] = useState<WithdrawalRequest | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);

  useEffect(() => {
    setVisibleRequests(requests);
  }, [requests]);

  const submitPaid = (formData: FormData) => {
    const withdrawalId = String(formData.get("withdrawalId") ?? "");
    setPendingId(withdrawalId);
    setFeedback(null);

    startTransition(() => {
      void (async () => {
        const result = await markWithdrawalPaidAction(formData);

        if (result.status === "success" && result.withdrawalId) {
          setVisibleRequests((current) =>
            current.map((request) =>
              request.id === result.withdrawalId
                ? { ...request, status: "paid", paid_at: new Date().toISOString() }
                : request
            )
          );
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
    const withdrawalId = String(formData.get("withdrawalId") ?? "");
    const adminNote = String(formData.get("adminNote") ?? "");
    setPendingId(withdrawalId);
    setFeedback(null);

    startTransition(() => {
      void (async () => {
        const result = await rejectWithdrawalAction(formData);

        if (result.status === "success" && result.withdrawalId) {
          setVisibleRequests((current) =>
            current.map((request) =>
              request.id === result.withdrawalId
                ? { ...request, status: "rejected", admin_note: adminNote }
                : request
            )
          );
          setRejectingRequest(null);
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
              <th className="px-4 py-3 font-medium">Seller</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Bank Details</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No withdrawal requests yet.
                </td>
              </tr>
            ) : (
              visibleRequests.map((request) => {
                const pending = request.status === "pending" || request.status === "approved";
                const isSubmitting = pendingId === request.id;

                return (
                  <tr key={request.id} className="border-b border-border/60 align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">{request.profile_name ?? "Seller"}</div>
                      <div className="text-xs text-muted-foreground">
                        @{request.profile_username ?? "seller"} · {request.profile_email ?? ""}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-foreground">
                      {formatCurrency(request.amount)}
                    </td>
                    <td className="px-4 py-4">
                      <div>{request.bank_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {request.account_name} · {request.account_number}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={
                          request.status === "paid"
                            ? "success"
                            : request.status === "rejected"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {request.status}
                      </Badge>
                      {request.admin_note ? (
                        <p className="mt-2 max-w-xs text-xs text-muted-foreground">
                          Reason: {request.admin_note}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">{formatDate(request.created_at)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            submitPaid(new FormData(event.currentTarget));
                          }}
                        >
                          <input type="hidden" name="withdrawalId" value={request.id} />
                          <Button size="sm" type="submit" disabled={!pending || isSubmitting}>
                            {isSubmitting ? "Marking..." : "Mark paid"}
                          </Button>
                        </form>
                        <Button
                          size="sm"
                          type="button"
                          variant="danger"
                          disabled={!pending || isSubmitting}
                          onClick={() => setRejectingRequest(request)}
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
        open={Boolean(rejectingRequest)}
        onClose={() => setRejectingRequest(null)}
        title="Reject withdrawal?"
        description="The amount will be returned to the seller's available balance."
      >
        {rejectingRequest ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitReject(new FormData(event.currentTarget));
            }}
            className="space-y-4"
          >
            <input type="hidden" name="withdrawalId" value={rejectingRequest.id} />
            <Input value={formatCurrency(rejectingRequest.amount)} readOnly />
            <label className="block text-sm font-semibold text-foreground" htmlFor="adminNote">
              Rejection reason
            </label>
            <Textarea
              id="adminNote"
              name="adminNote"
              placeholder="Explain why this withdrawal was rejected."
              required
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setRejectingRequest(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" disabled={pendingId === rejectingRequest.id}>
                {pendingId === rejectingRequest.id ? "Rejecting..." : "Reject withdrawal"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
