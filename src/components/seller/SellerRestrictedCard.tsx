import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export default function SellerRestrictedCard({
  restrictedUntil,
  reason
}: {
  restrictedUntil?: string | null;
  reason?: string;
}) {
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-50 text-danger">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <CardTitle className="pt-4">Seller uploads are restricted.</CardTitle>
        <CardDescription>
          {restrictedUntil ? `Restriction ends ${formatDate(restrictedUntil)}.` : "Seller access is currently limited."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {reason ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {reason}
          </div>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/seller/disputes">
            <Button variant="secondary">View disputes</Button>
          </Link>
          <Link href="/seller/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
