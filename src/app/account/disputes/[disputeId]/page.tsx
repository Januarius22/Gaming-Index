import Link from "next/link";
import { notFound } from "next/navigation";
import CaseAutoRefresh from "@/components/disputes/CaseAutoRefresh";
import DisputeCaseRoom from "@/components/disputes/DisputeCaseRoom";
import DisputeInstructions from "@/components/disputes/DisputeInstructions";
import DisputeMessageForm from "@/components/disputes/DisputeMessageForm";
import DisputeNotice from "@/components/disputes/DisputeNotice";
import DisputeThread from "@/components/disputes/DisputeThread";
import Button from "@/components/ui/Button";
import { requireAccountProfile } from "@/lib/auth";
import { getDisputeCase } from "@/lib/data";

export default async function AccountDisputeCasePage({
  params,
  searchParams
}: {
  params: Promise<{ disputeId: string }>;
  searchParams?: Promise<{ notice?: string; message?: string }>;
}) {
  const profile = await requireAccountProfile();
  const [{ disputeId }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve<{ notice?: string; message?: string }>({})
  ]);
  const caseData = await getDisputeCase(profile, disputeId, "buyer");

  if (!caseData) {
    notFound();
  }

  const closed =
    caseData.dispute.status === "resolved" ||
    caseData.dispute.status === "rejected" ||
    caseData.dispute.status === "refunded" ||
    Boolean(caseData.dispute.locked_at);

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
        <Link href="/account/disputes">
          <Button variant="secondary">Back to cases</Button>
        </Link>
      </div>

      <DisputeCaseRoom
        dispute={caseData.dispute}
        order={caseData.order}
        messages={caseData.messages}
        role="buyer"
      />

      <DisputeInstructions
        sellerVisible={Boolean(caseData.dispute.seller_visible)}
        locked={Boolean(caseData.dispute.locked_at)}
      />
      <DisputeThread messages={caseData.messages} currentUserId={profile.id} />
      <div className="sticky bottom-0 z-30 -mx-4 bg-gradient-to-t from-background via-background to-transparent pb-[env(safe-area-inset-bottom)] pt-4 sm:mx-0 sm:px-0 sm:pb-3">
        <DisputeMessageForm
          disputeId={caseData.dispute.id}
          orderId={caseData.dispute.order_id}
          returnTo={`/account/disputes/${caseData.dispute.id}`}
          currentUserId={profile.id}
          senderRole="buyer"
          disabled={closed}
        />
      </div>
    </div>
  );
}
