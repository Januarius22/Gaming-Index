import Link from "next/link";
import { notFound } from "next/navigation";
import {
  clearSellerRestrictionAction,
  enforceSellerFromDisputeAction,
  refundOrderDisputeAction,
  updateOrderDisputeAction
} from "@/actions/admin";
import AdminDisputeActionsModal from "@/components/admin/AdminDisputeActionsModal";
import CaseAutoRefresh from "@/components/disputes/CaseAutoRefresh";
import DisputeCaseRoom from "@/components/disputes/DisputeCaseRoom";
import DisputeInstructions from "@/components/disputes/DisputeInstructions";
import DisputeMessageForm from "@/components/disputes/DisputeMessageForm";
import DisputeNotice from "@/components/disputes/DisputeNotice";
import DisputeThread from "@/components/disputes/DisputeThread";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireAdminProfile } from "@/lib/auth";
import { getDisputeCase } from "@/lib/data";
import { BASE_CURRENCY_CODE, formatCurrency, formatCurrencyValue, formatDate } from "@/lib/utils";

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
  const messagingDisabled = closed || Boolean(caseData.dispute.locked_at);
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
  const buyerDisplayCurrency = (caseData.order?.buyer_display_currency ?? BASE_CURRENCY_CODE).toUpperCase();
  const buyerDisplayAmount =
    caseData.order?.buyer_display_amount && buyerDisplayCurrency !== BASE_CURRENCY_CODE
      ? formatCurrencyValue(caseData.order.buyer_display_amount, buyerDisplayCurrency)
      : "";

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
        <div className="flex flex-wrap gap-2">
          <AdminDisputeActionsModal
            disputeId={caseData.dispute.id}
            orderId={caseData.dispute.order_id}
            sellerId={caseData.dispute.seller_id}
            disputeStatus={caseData.dispute.status}
            sellerStrikes={sellerProfile?.seller_strikes ?? 0}
            sellerRestrictedUntil={sellerProfile?.seller_restricted_until ?? null}
            sellerRestrictionReason={sellerProfile?.seller_restriction_reason ?? ""}
            sellerVisible={Boolean(caseData.dispute.seller_visible)}
            closed={closed}
            updateDispute={updateDispute}
            refundDispute={refundDispute}
            enforceSeller={enforceSeller}
            clearRestriction={clearRestriction}
          />
          <Link href="/admin/disputes">
            <Button variant="secondary">Back to disputes</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <DisputeCaseRoom
          dispute={caseData.dispute}
          order={caseData.order}
          messages={caseData.messages}
          role="admin"
        />

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Admin review data</CardTitle>
              <CardDescription>
                {caseData.order
                  ? `${formatCurrency(caseData.order.amount)} official NGN - ${formatDate(caseData.order.created_at)}`
                  : "Order case"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
            {caseData.order ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="font-semibold text-foreground">Official order amount</p>
                  <p>{formatCurrency(caseData.order.amount)}</p>
                  <p className="text-xs">Settlement currency: NGN</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="font-semibold text-foreground">Platform fee</p>
                  <p>{formatCurrency(caseData.order.platform_fee_amount ?? 0)}</p>
                  <p className="text-xs">Deducted before seller payout</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="font-semibold text-foreground">Seller payout</p>
                  <p>{formatCurrency(caseData.order.seller_payout_amount ?? caseData.order.amount)}</p>
                  <p className="text-xs">Official NGN wallet movement</p>
                </div>
                {buyerDisplayAmount ? (
                  <div className="rounded-2xl border border-border bg-surface p-4 sm:col-span-3">
                    <p className="font-semibold text-foreground">Buyer display snapshot</p>
                    <p>{buyerDisplayAmount}</p>
                    {caseData.order.exchange_rate_snapshot ? (
                      <p className="text-xs">
                        Snapshot rate: 1 {buyerDisplayCurrency} ={" "}
                        {formatCurrencyValue(caseData.order.exchange_rate_snapshot, BASE_CURRENCY_CODE)}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
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
          </CardContent>
        </Card>

        <DisputeInstructions
          sellerVisible={Boolean(caseData.dispute.seller_visible)}
          locked={Boolean(caseData.dispute.locked_at)}
        />
        <DisputeThread messages={caseData.messages} currentUserId={profile.id} />
        <div className="sticky bottom-0 z-30 -mx-4 bg-gradient-to-t from-background via-background to-transparent pb-[env(safe-area-inset-bottom)] pt-4 sm:mx-0 sm:px-0 sm:pb-3">
          <DisputeMessageForm
            disputeId={caseData.dispute.id}
            orderId={caseData.dispute.order_id}
            returnTo={`/admin/disputes/${caseData.dispute.id}`}
            currentUserId={profile.id}
            senderRole="admin"
            disabled={messagingDisabled}
          />
        </div>
      </div>
    </div>
  );
}
