import Link from "next/link";
import { MessageSquareWarning } from "lucide-react";
import { openDisputeCaseAction } from "@/actions/disputes";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireAccountProfile } from "@/lib/auth";
import { getBuyerDisputeCandidates, getBuyerDisputes } from "@/lib/data";
import { formatCurrency, formatDate, titleCase } from "@/lib/utils";

const statusVariant = {
  open: "danger",
  reviewing: "warning",
  resolved: "success",
  rejected: "neutral",
  refunded: "success"
} as const;

export default async function AccountDisputesPage() {
  const profile = await requireAccountProfile();
  const [candidates, disputes] = await Promise.all([
    getBuyerDisputeCandidates(profile),
    getBuyerDisputes(profile)
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dispute Center</CardTitle>
          <CardDescription>Report an issue on a paid account and follow the case here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {candidates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
              No eligible paid orders are available for dispute.
            </div>
          ) : (
            candidates.map(({ order, dispute }) => (
              <div
                key={order.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-foreground">{order.listing_title || "Purchased account"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatCurrency(order.amount)} - {formatDate(order.created_at)}
                  </p>
                  {dispute ? (
                    <div className="mt-3">
                      <Badge variant={statusVariant[dispute.status]}>{titleCase(dispute.status)}</Badge>
                    </div>
                  ) : null}
                </div>
                {dispute ? (
                  <Link href={`/account/disputes/${dispute.id}`}>
                    <Button variant="secondary">View case</Button>
                  </Link>
                ) : (
                  <form action={openDisputeCaseAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <Button type="submit">
                      <MessageSquareWarning className="mr-2 h-4 w-4" />
                      Open case
                    </Button>
                  </form>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {disputes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No dispute cases yet.</p>
          ) : (
            disputes.slice(0, 5).map((dispute) => (
              <Link
                key={dispute.id}
                href={`/account/disputes/${dispute.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4 transition hover:bg-primary-soft"
              >
                <div>
                  <p className="font-semibold text-foreground">{dispute.listing_title || "Order case"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{dispute.reason}</p>
                </div>
                <Badge variant={statusVariant[dispute.status]}>{titleCase(dispute.status)}</Badge>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
