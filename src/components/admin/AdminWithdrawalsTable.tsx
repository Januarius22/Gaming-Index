"use client";

import { useEffect, useState, useTransition } from "react";
import { markWithdrawalPaidAction, rejectWithdrawalAction } from "@/actions/admin";
import FormMessage from "@/components/auth/FormMessage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabaseClient";
import { formatCurrency, formatDate, titleCase } from "@/lib/utils";
import type { WithdrawalRequest } from "@/types";

const WITHDRAWAL_PROOFS_BUCKET = "withdrawal-proofs";
const MAX_PAYOUT_PROOF_SIZE = 8 * 1024 * 1024;

function safeProofFileName(fileName: string) {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

export default function AdminWithdrawalsTable({
  requests
}: {
  requests: WithdrawalRequest[];
}) {
  const [, startTransition] = useTransition();
  const [visibleRequests, setVisibleRequests] = useState(requests);
  const [rejectingRequest, setRejectingRequest] = useState<WithdrawalRequest | null>(null);
  const [payingRequest, setPayingRequest] = useState<WithdrawalRequest | null>(null);
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
        const proofFile = formData.get("payoutProofFile");

        if (proofFile instanceof File && proofFile.size > 0) {
          if (proofFile.size > MAX_PAYOUT_PROOF_SIZE) {
            setFeedback({
              message: "Payout proof must be 8MB or less.",
              tone: "error"
            });
            setPendingId(null);
            return;
          }

          if (!hasSupabaseEnv) {
            setFeedback({
              message: "Connect Supabase to upload payout proof.",
              tone: "error"
            });
            setPendingId(null);
            return;
          }

          const supabase = getSupabaseBrowserClient();
          const fileName = safeProofFileName(proofFile.name || "payout-proof");
          const filePath = `${withdrawalId}/${crypto.randomUUID()}-${fileName}`;
          const { error } = await supabase!.storage
            .from(WITHDRAWAL_PROOFS_BUCKET)
            .upload(filePath, proofFile, {
              contentType: proofFile.type || "application/octet-stream",
              upsert: false
            });

          if (error) {
            setFeedback({
              message: error.message,
              tone: "error"
            });
            setPendingId(null);
            return;
          }

          formData.set("payoutProofName", fileName);
          formData.set("payoutProofPath", filePath);
        }

        formData.delete("payoutProofFile");

        const result = await markWithdrawalPaidAction(formData);

        if (result.status === "success" && result.withdrawalId) {
          const payoutProvider = String(formData.get("payoutProvider") ?? "");
          const payoutReference = String(formData.get("payoutReference") ?? "");
          const payoutProofName = String(formData.get("payoutProofName") ?? "");
          const payoutProofPath = String(formData.get("payoutProofPath") ?? "");
          const paidNote = String(formData.get("paidNote") ?? "");

          setVisibleRequests((current) =>
            current.map((request) =>
              request.id === result.withdrawalId
                ? {
                    ...request,
                    status: "paid",
                    payout_provider: payoutProvider,
                    payout_reference: payoutReference,
                    payout_proof_name: payoutProofName,
                    payout_proof_path: payoutProofPath,
                    paid_note: paidNote,
                    paid_at: new Date().toISOString()
                  }
                : request
            )
          );
          setPayingRequest(null);
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
                        @{request.profile_username ?? "seller"} - {request.profile_email ?? ""}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-foreground">
                      {formatCurrency(request.amount)}
                    </td>
                    <td className="px-4 py-4">
                      <div>{request.bank_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {request.account_name} - {request.account_number}
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
                        {titleCase(request.status)}
                      </Badge>
                      {request.admin_note ? (
                        <p className="mt-2 max-w-xs text-xs text-muted-foreground">
                          Reason: {request.admin_note}
                        </p>
                      ) : null}
                      {request.payout_reference ? (
                        <p className="mt-2 max-w-xs text-xs text-muted-foreground">
                          Ref: {request.payout_reference}
                        </p>
                      ) : null}
                      {request.payout_proof_url ? (
                        <a
                          href={request.payout_proof_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 block max-w-xs text-xs font-semibold text-primary hover:text-primary-dark"
                        >
                          View payout proof
                        </a>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">{formatDate(request.created_at)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          type="button"
                          disabled={!pending || isSubmitting}
                          onClick={() => setPayingRequest(request)}
                        >
                          Mark paid
                        </Button>
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
        open={Boolean(payingRequest)}
        onClose={() => setPayingRequest(null)}
        title="Mark withdrawal paid"
        description="Record the payout details before closing this withdrawal."
      >
        {payingRequest ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitPaid(new FormData(event.currentTarget));
            }}
            className="space-y-4"
          >
            <input type="hidden" name="withdrawalId" value={payingRequest.id} />
            <Input value={formatCurrency(payingRequest.amount)} readOnly />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground" htmlFor="payoutProvider">
                  Payout provider
                </label>
                <Input
                  id="payoutProvider"
                  name="payoutProvider"
                  placeholder="Bank transfer"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-foreground" htmlFor="payoutReference">
                  Transaction reference
                </label>
                <Input
                  id="payoutReference"
                  name="payoutReference"
                  placeholder="Transfer reference"
                  required
                />
              </div>
            </div>
            <input type="hidden" name="payoutProofName" value="" />
            <input type="hidden" name="payoutProofPath" value="" />
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground" htmlFor="payoutProofFile">
                Payout proof
              </label>
              <Input
                id="payoutProofFile"
                name="payoutProofFile"
                type="file"
                accept="image/*,.pdf"
              />
            </div>
            <label className="block text-sm font-semibold text-foreground" htmlFor="paidNote">
              Admin note
            </label>
            <Textarea
              id="paidNote"
              name="paidNote"
              placeholder="Optional payout note."
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setPayingRequest(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pendingId === payingRequest.id}>
                {pendingId === payingRequest.id ? "Saving..." : "Mark paid"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>

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
