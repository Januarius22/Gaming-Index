import Link from "next/link";
import { notFound } from "next/navigation";
import {
  clearSellerRestrictionAction,
  enforceSellerFromDisputeAction,
  refundOrderDisputeAction,
  updateOrderDisputeAction
} from "@/actions/admin";
import SubmitButton from "@/components/auth/SubmitButton";
import CaseAutoRefresh from "@/components/disputes/CaseAutoRefresh";
import DisputeInstructions from "@/components/disputes/DisputeInstructions";
import DisputeMessageForm from "@/components/disputes/DisputeMessageForm";
import DisputeNotice from "@/components/disputes/DisputeNotice";
import DisputeThread from "@/components/disputes/DisputeThread";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Textarea from "@/components/ui/Textarea";
import { requireAdminProfile } from "@/lib/auth";
import { getDisputeCase } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusVariant = {
  open: "danger",
  reviewing: "warning",
  resolved: "success",
  rejected: "neutral",
  refunded: "success"
} as const;

export default async function AdminDisputeCasePage({
  params,
  searchParams
}: {
  params: Promise<{ disputeId: string }>;
  searchParams?: Promise<{ notice?: string; message?: string }>;
}) {
  const profile = await requireAdminProfile();
  const [{ disputeId }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve<{ notice?: string; message?: string }>({})
  ]);
  const caseData = await getDisputeCase(profile, disputeId, "admin");

  if (!caseData) {
    notFound();
  }

  const closed =
    caseData.dispute.status === "resolved" ||
    caseData.dispute.status === "rejected" ||
    caseData.dispute.status === "refunded";
  async function updateDispute(formData: FormData) {
    "use server";

    await updateOrderDisputeAction(formData);
  }

  async function refundDispute(formData: FormData) {
    "use server";

    await refundOrderDisputeAction(formData);
  }

  async function enforceSeller(formData: FormData) {
    "use server";

    await enforceSellerFromDisputeAction(formData);
  }

  async function clearRestriction(formData: FormData) {
    "use server";

    await clearSellerRestrictionAction(formData);
  }

  const sellerProfile = caseData.sellerProfile;
  const sellerRestricted = Boolean(
    sellerProfile?.seller_restricted_until &&
      new Date(sellerProfile.seller_restricted_until).getTime() > Date.now()
  );

  return (
    <div className="space-y-6">
      <CaseAutoRefresh />
      <DisputeNotice notice={resolvedSearchParams.notice} message={resolvedSearchParams.message} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Dispute Case</p>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {caseData.dispute.listing_title || "Order case"}
          </h1>
        </div>
        <Link href="/admin/disputes">
          <Button variant="secondary">Back to disputes</Button>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Case Summary</CardTitle>
                <CardDescription>
                  {caseData.order ? `${formatCurrency(caseData.order.amount)} - ${formatDate(caseData.order.created_at)}` : "Order case"}
                </CardDescription>
              </div>
              <Badge variant={statusVariant[caseData.dispute.status]}>{caseData.dispute.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p>{caseData.dispute.details}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="font-semibold text-foreground">Buyer</p>
                  <p>{caseData.dispute.buyer_name}</p>
                  <p>{caseData.dispute.buyer_email}</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="font-semibold text-foreground">Seller</p>
                  <p>{caseData.dispute.seller_name}</p>
                  <p>{caseData.dispute.seller_username ? `@${caseData.dispute.seller_username}` : "Seller account"}</p>
                </div>
              </div>
              {caseData.dispute.resolution ? (
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="font-semibold text-foreground">Resolution</p>
                  <p className="mt-1">{caseData.dispute.resolution}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <DisputeInstructions />
          <DisputeThread messages={caseData.messages} currentUserId={profile.id} />
          <div className="sticky bottom-0 z-20 -mx-4 bg-gradient-to-t from-background via-background to-transparent px-4 pb-3 pt-5 sm:mx-0 sm:px-0">
            <DisputeMessageForm
              disputeId={caseData.dispute.id}
              orderId={caseData.dispute.order_id}
              returnTo={`/admin/disputes/${caseData.dispute.id}`}
              disabled={closed}
            />
          </div>
        </div>

        <div className="space-y-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Admin Decision</CardTitle>
              <CardDescription>Choose the next outcome for this case.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={updateDispute}>
                <input type="hidden" name="disputeId" value={caseData.dispute.id} />
                <input type="hidden" name="orderId" value={caseData.dispute.order_id} />
                <input type="hidden" name="nextStatus" value="reviewing" />
                <SubmitButton className="w-full" variant="secondary" disabled={closed || caseData.dispute.status === "reviewing"}>
                  Mark reviewing
                </SubmitButton>
              </form>

              <form action={updateDispute} className="space-y-3">
                <input type="hidden" name="disputeId" value={caseData.dispute.id} />
                <input type="hidden" name="orderId" value={caseData.dispute.order_id} />
                <input type="hidden" name="nextStatus" value="resolved" />
                <Textarea name="adminNote" placeholder="Resolution note" required />
                <SubmitButton className="w-full" disabled={closed}>
                  Resolve seller favor
                </SubmitButton>
              </form>

              <form action={refundDispute} className="space-y-3">
                <input type="hidden" name="disputeId" value={caseData.dispute.id} />
                <input type="hidden" name="orderId" value={caseData.dispute.order_id} />
                <Textarea name="adminNote" placeholder="Refund note" required />
                <SubmitButton className="w-full" variant="secondary" disabled={closed}>
                  Refund buyer
                </SubmitButton>
              </form>

              <form action={updateDispute} className="space-y-3">
                <input type="hidden" name="disputeId" value={caseData.dispute.id} />
                <input type="hidden" name="orderId" value={caseData.dispute.order_id} />
                <input type="hidden" name="nextStatus" value="rejected" />
                <Textarea name="adminNote" placeholder="Rejection note" required />
                <SubmitButton className="w-full" variant="danger" disabled={closed}>
                  Reject case
                </SubmitButton>
              </form>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Seller Enforcement</CardTitle>
              <CardDescription>
                {sellerProfile?.seller_strikes
                  ? `${sellerProfile.seller_strikes} strike${sellerProfile.seller_strikes === 1 ? "" : "s"} recorded.`
                  : "No seller strikes recorded."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sellerRestricted ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
                  Uploads restricted until {formatDate(sellerProfile?.seller_restricted_until ?? "")}.
                  {sellerProfile?.seller_restriction_reason ? (
                    <span className="mt-1 block">{sellerProfile.seller_restriction_reason}</span>
                  ) : null}
                </div>
              ) : null}

              <form action={enforceSeller} className="space-y-3">
                <input type="hidden" name="disputeId" value={caseData.dispute.id} />
                <input type="hidden" name="sellerId" value={caseData.dispute.seller_id} />
                <input type="hidden" name="enforcementAction" value="warning" />
                <Textarea name="enforcementReason" placeholder="Warning reason" required />
                <SubmitButton className="w-full" variant="secondary">
                  Issue warning
                </SubmitButton>
              </form>

              <form action={enforceSeller} className="space-y-3">
                <input type="hidden" name="disputeId" value={caseData.dispute.id} />
                <input type="hidden" name="sellerId" value={caseData.dispute.seller_id} />
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
                <input type="hidden" name="disputeId" value={caseData.dispute.id} />
                <input type="hidden" name="sellerId" value={caseData.dispute.seller_id} />
                <input type="hidden" name="enforcementAction" value="seller_suspension" />
                <Textarea name="enforcementReason" placeholder="Suspension reason" required />
                <SubmitButton className="w-full" variant="danger">
                  Suspend seller access
                </SubmitButton>
              </form>

              {sellerRestricted ? (
                <form action={clearRestriction} className="space-y-3">
                  <input type="hidden" name="disputeId" value={caseData.dispute.id} />
                  <input type="hidden" name="sellerId" value={caseData.dispute.seller_id} />
                  <Textarea name="note" placeholder="Clear restriction note" />
                  <SubmitButton className="w-full" variant="secondary">
                    Clear restriction
                  </SubmitButton>
                </form>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
