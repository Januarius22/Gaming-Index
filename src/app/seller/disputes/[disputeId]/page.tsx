import Link from "next/link";
import { notFound } from "next/navigation";
import CaseAutoRefresh from "@/components/disputes/CaseAutoRefresh";
import DisputeInstructions from "@/components/disputes/DisputeInstructions";
import DisputeMessageForm from "@/components/disputes/DisputeMessageForm";
import DisputeNotice from "@/components/disputes/DisputeNotice";
import DisputeThread from "@/components/disputes/DisputeThread";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireSellerProfile } from "@/lib/auth";
import { getDisputeCase } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusVariant = {
  open: "danger",
  reviewing: "warning",
  resolved: "success",
  rejected: "neutral",
  refunded: "success"
} as const;

export default async function SellerDisputeCasePage({
  params,
  searchParams
}: {
  params: Promise<{ disputeId: string }>;
  searchParams?: Promise<{ notice?: string; message?: string }>;
}) {
  const profile = await requireSellerProfile();
  const [{ disputeId }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve<{ notice?: string; message?: string }>({})
  ]);
  const caseData = await getDisputeCase(profile, disputeId, "seller");

  if (!caseData) {
    notFound();
  }

  const closed =
    caseData.dispute.status === "resolved" ||
    caseData.dispute.status === "rejected" ||
    caseData.dispute.status === "refunded";

  return (
    <div className="space-y-6">
      <CaseAutoRefresh />
      <DisputeNotice notice={resolvedSearchParams.notice} message={resolvedSearchParams.message} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-blue-100/80">Dispute Case</p>
          <h1 className="font-heading text-2xl font-semibold text-white">
            {caseData.dispute.listing_title || "Order case"}
          </h1>
        </div>
        <Link href="/seller/disputes">
          <Button variant="secondary">Back to cases</Button>
        </Link>
      </div>

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
          {caseData.dispute.resolution ? (
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="font-semibold text-foreground">Resolution</p>
              <p className="mt-1">{caseData.dispute.resolution}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <DisputeInstructions />
      <DisputeThread messages={caseData.messages} />
      <DisputeMessageForm
        disputeId={caseData.dispute.id}
        orderId={caseData.dispute.order_id}
        returnTo={`/seller/disputes/${caseData.dispute.id}`}
        disabled={closed}
      />
    </div>
  );
}
