"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { refundOrderDisputeAction, updateOrderDisputeAction } from "@/actions/admin";
import FormMessage from "@/components/auth/FormMessage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import { formatCurrency, formatDate, titleCase } from "@/lib/utils";
import type { Dispute, DisputeStatus } from "@/types";

const statusVariant = {
  open: "danger",
  reviewing: "warning",
  resolved: "success",
  rejected: "neutral",
  refunded: "success"
} as const;

export default function AdminDisputesTable({ disputes }: { disputes: Dispute[] }) {
  const [, startTransition] = useTransition();
  const [visibleDisputes, setVisibleDisputes] = useState(disputes);
  const [reviewingDispute, setReviewingDispute] = useState<{
    dispute: Dispute;
    status: "resolved" | "rejected" | "refunded";
  } | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);

  useEffect(() => {
    setVisibleDisputes(disputes);
  }, [disputes]);

  const submitUpdate = (formData: FormData) => {
    const disputeId = String(formData.get("disputeId") ?? "");
    const adminNote = String(formData.get("adminNote") ?? "");
    setPendingId(disputeId);
    setFeedback(null);

    startTransition(() => {
      void (async () => {
        const nextStatus = String(formData.get("nextStatus") ?? "");
        const result =
          nextStatus === "refunded"
            ? await refundOrderDisputeAction(formData)
            : await updateOrderDisputeAction(formData);

        if (result.status === "success" && result.disputeId) {
          setVisibleDisputes((current) =>
            current.map((dispute) =>
              dispute.id === result.disputeId
                ? {
                    ...dispute,
                    status: result.nextStatus as DisputeStatus,
                    admin_note: adminNote || dispute.admin_note
                  }
                : dispute
            )
          );
          setReviewingDispute(null);
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
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Buyer</th>
              <th className="px-4 py-3 font-medium">Seller</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleDisputes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No disputes yet.
                </td>
              </tr>
            ) : (
              visibleDisputes.map((dispute) => {
                const closed =
                  dispute.status === "resolved" ||
                  dispute.status === "rejected" ||
                  dispute.status === "refunded";
                const isSubmitting = pendingId === dispute.id;

                return (
                  <tr key={dispute.id} className="border-b border-border/60 align-top">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-foreground">{dispute.order_id.slice(0, 8)}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {dispute.listing_title || "Order"} - {formatCurrency(dispute.amount ?? 0)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">{dispute.buyer_name || "Buyer"}</div>
                      <div className="text-xs text-muted-foreground">{dispute.buyer_email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">{dispute.seller_name || "Seller"}</div>
                      <div className="text-xs text-muted-foreground">
                        {dispute.seller_username ? `@${dispute.seller_username}` : ""}
                      </div>
                    </td>
                    <td className="max-w-sm px-4 py-4">
                      <div className="font-semibold text-foreground">{dispute.reason}</div>
                      <p className="mt-1 line-clamp-4 leading-6 text-muted-foreground">
                        {dispute.details}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant[dispute.status]}>{titleCase(dispute.status)}</Badge>
                      {dispute.admin_note ? (
                        <p className="mt-2 max-w-xs text-xs text-muted-foreground">
                          Note: {dispute.admin_note}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">{formatDate(dispute.created_at)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/disputes/${dispute.id}`}>
                          <Button size="sm" type="button" variant="secondary">
                            Open case
                          </Button>
                        </Link>
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            submitUpdate(new FormData(event.currentTarget));
                          }}
                        >
                          <input type="hidden" name="disputeId" value={dispute.id} />
                          <input type="hidden" name="orderId" value={dispute.order_id} />
                          <input type="hidden" name="nextStatus" value="reviewing" />
                          <Button
                            size="sm"
                            type="submit"
                            variant="secondary"
                            disabled={closed || dispute.status === "reviewing" || isSubmitting}
                          >
                            Reviewing
                          </Button>
                        </form>
                        <Button
                          size="sm"
                          type="button"
                          variant="secondary"
                          disabled={closed || isSubmitting}
                          onClick={() => setReviewingDispute({ dispute, status: "refunded" })}
                        >
                          Refund
                        </Button>
                        <Button
                          size="sm"
                          type="button"
                          variant="danger"
                          disabled={closed || isSubmitting}
                          onClick={() => setReviewingDispute({ dispute, status: "rejected" })}
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
        open={Boolean(reviewingDispute)}
        onClose={() => setReviewingDispute(null)}
        title={
          reviewingDispute?.status === "refunded"
            ? "Issue refund?"
            : reviewingDispute?.status === "resolved"
              ? "Resolve dispute?"
              : "Reject dispute?"
        }
        description="The buyer and seller will receive your note."
      >
        {reviewingDispute ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitUpdate(new FormData(event.currentTarget));
            }}
            className="space-y-4"
          >
            <input type="hidden" name="disputeId" value={reviewingDispute.dispute.id} />
            <input type="hidden" name="orderId" value={reviewingDispute.dispute.order_id} />
            <input type="hidden" name="nextStatus" value={reviewingDispute.status} />
            <label className="block text-sm font-semibold text-foreground" htmlFor="adminNote">
              Admin note
            </label>
            <Textarea
              id="adminNote"
              name="adminNote"
              placeholder="Add the review outcome."
              required
            />
            {reviewingDispute.status === "refunded" ? (
              <label className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-3 text-sm text-muted-foreground">
                <input
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  name="takeListingDown"
                  type="checkbox"
                />
                <span>
                  <span className="block font-semibold text-foreground">Take down listing</span>
                  Remove this listing from the marketplace after the refund.
                </span>
              </label>
            ) : null}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setReviewingDispute(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={reviewingDispute.status === "rejected" ? "danger" : "primary"}
                disabled={pendingId === reviewingDispute.dispute.id}
              >
                {pendingId === reviewingDispute.dispute.id
                  ? "Saving..."
                  : reviewingDispute.status === "refunded"
                    ? "Issue refund"
                    : reviewingDispute.status === "resolved"
                      ? "Resolve dispute"
                      : "Reject dispute"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
