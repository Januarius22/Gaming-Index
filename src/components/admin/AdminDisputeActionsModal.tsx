"use client";

import { useState } from "react";
import { Gavel } from "lucide-react";
import SubmitButton from "@/components/auth/SubmitButton";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import { formatDate } from "@/lib/utils";

type ActionHandler = (formData: FormData) => void | Promise<void>;

export default function AdminDisputeActionsModal({
  disputeId,
  orderId,
  sellerId,
  disputeStatus,
  sellerStrikes = 0,
  sellerRestrictedUntil,
  sellerRestrictionReason,
  closed,
  updateDispute,
  refundDispute,
  enforceSeller,
  clearRestriction
}: {
  disputeId: string;
  orderId: string;
  sellerId: string;
  disputeStatus: string;
  sellerStrikes?: number;
  sellerRestrictedUntil?: string | null;
  sellerRestrictionReason?: string;
  closed: boolean;
  updateDispute: ActionHandler;
  refundDispute: ActionHandler;
  enforceSeller: ActionHandler;
  clearRestriction: ActionHandler;
}) {
  const [open, setOpen] = useState(false);
  const sellerRestricted = Boolean(
    sellerRestrictedUntil && new Date(sellerRestrictedUntil).getTime() > Date.now()
  );

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Gavel className="mr-2 h-4 w-4" />
        Take action
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Admin decision"
        description="Choose the next outcome for this dispute."
        panelClassName="max-w-5xl"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-[24px] border border-border bg-surface p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  Case outcome
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update the dispute status.
                </p>
              </div>
              <Badge variant={closed ? "neutral" : "warning"}>{disputeStatus}</Badge>
            </div>

            <div className="space-y-4">
              <form action={updateDispute}>
                <input type="hidden" name="disputeId" value={disputeId} />
                <input type="hidden" name="orderId" value={orderId} />
                <input type="hidden" name="nextStatus" value="reviewing" />
                <SubmitButton
                  className="w-full"
                  variant="secondary"
                  disabled={closed || disputeStatus === "reviewing"}
                >
                  Mark reviewing
                </SubmitButton>
              </form>

              <form action={updateDispute} className="space-y-3">
                <input type="hidden" name="disputeId" value={disputeId} />
                <input type="hidden" name="orderId" value={orderId} />
                <input type="hidden" name="nextStatus" value="resolved" />
                <Textarea name="adminNote" placeholder="Resolution note" required />
                <SubmitButton className="w-full" disabled={closed}>
                  Resolve seller favor
                </SubmitButton>
              </form>

              <form action={refundDispute} className="space-y-3">
                <input type="hidden" name="disputeId" value={disputeId} />
                <input type="hidden" name="orderId" value={orderId} />
                <Textarea name="adminNote" placeholder="Refund note" required />
                <SubmitButton className="w-full" variant="secondary" disabled={closed}>
                  Refund buyer
                </SubmitButton>
              </form>

              <form action={updateDispute} className="space-y-3">
                <input type="hidden" name="disputeId" value={disputeId} />
                <input type="hidden" name="orderId" value={orderId} />
                <input type="hidden" name="nextStatus" value="rejected" />
                <Textarea name="adminNote" placeholder="Rejection note" required />
                <SubmitButton className="w-full" variant="danger" disabled={closed}>
                  Reject case
                </SubmitButton>
              </form>
            </div>
          </section>

          <section className="rounded-[24px] border border-border bg-white p-4">
            <div className="mb-4">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Seller enforcement
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {sellerStrikes
                  ? `${sellerStrikes} strike${sellerStrikes === 1 ? "" : "s"} recorded.`
                  : "No seller strikes recorded."}
              </p>
            </div>

            <div className="space-y-4">
              {sellerRestricted ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
                  Uploads restricted until {formatDate(sellerRestrictedUntil ?? "")}.
                  {sellerRestrictionReason ? (
                    <span className="mt-1 block">{sellerRestrictionReason}</span>
                  ) : null}
                </div>
              ) : null}

              <form action={enforceSeller} className="space-y-3">
                <input type="hidden" name="disputeId" value={disputeId} />
                <input type="hidden" name="sellerId" value={sellerId} />
                <input type="hidden" name="enforcementAction" value="warning" />
                <Textarea name="enforcementReason" placeholder="Warning reason" required />
                <SubmitButton className="w-full" variant="secondary">
                  Issue warning
                </SubmitButton>
              </form>

              <form action={enforceSeller} className="space-y-3">
                <input type="hidden" name="disputeId" value={disputeId} />
                <input type="hidden" name="sellerId" value={sellerId} />
                <input type="hidden" name="enforcementAction" value="temporary_restriction" />
                <Textarea name="enforcementReason" placeholder="Restriction reason" required />
                <input
                  className="h-11 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  name="restrictionDays"
                  type="number"
                  min="1"
                  max="90"
                  placeholder="Days"
                  required
                />
                <SubmitButton className="w-full" variant="secondary">
                  Restrict uploads
                </SubmitButton>
              </form>

              <form action={enforceSeller} className="space-y-3">
                <input type="hidden" name="disputeId" value={disputeId} />
                <input type="hidden" name="sellerId" value={sellerId} />
                <input type="hidden" name="enforcementAction" value="seller_suspension" />
                <Textarea name="enforcementReason" placeholder="Suspension reason" required />
                <SubmitButton className="w-full" variant="danger">
                  Suspend seller access
                </SubmitButton>
              </form>

              {sellerRestricted ? (
                <form action={clearRestriction} className="space-y-3">
                  <input type="hidden" name="disputeId" value={disputeId} />
                  <input type="hidden" name="sellerId" value={sellerId} />
                  <Textarea name="note" placeholder="Clear restriction note" />
                  <SubmitButton className="w-full" variant="secondary">
                    Clear restriction
                  </SubmitButton>
                </form>
              ) : null}
            </div>
          </section>
        </div>
      </Modal>
    </>
  );
}
