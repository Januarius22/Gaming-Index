import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireSellerProfile } from "@/lib/auth";
import { getSellerDisputes } from "@/lib/data";
import { formatCurrency, formatDate, titleCase } from "@/lib/utils";

const statusVariant = {
  open: "danger",
  reviewing: "warning",
  resolved: "success",
  rejected: "neutral",
  refunded: "success"
} as const;

export default async function SellerDisputesPage() {
  const profile = await requireSellerProfile();
  const disputes = await getSellerDisputes(profile);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disputes</CardTitle>
        <CardDescription>Open cases connected to your sold accounts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {disputes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
            No seller disputes yet.
          </div>
        ) : (
          disputes.map((dispute) => (
            <div
              key={dispute.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-foreground">{dispute.listing_title || "Order case"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatCurrency(dispute.amount ?? 0)} - {formatDate(dispute.created_at)}
                </p>
                <div className="mt-3">
                  <Badge variant={statusVariant[dispute.status]}>{titleCase(dispute.status)}</Badge>
                </div>
              </div>
              <Link href={`/seller/disputes/${dispute.id}`}>
                <Button variant="secondary">Open case</Button>
              </Link>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
