import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { requireSellerProfile } from "@/lib/auth";

export default async function SellerWithdrawalProcessingPage() {
  await requireSellerProfile();

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardContent className="p-8 text-center sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-heading text-3xl font-semibold text-foreground">
            Withdrawal request submitted
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
            Your request is being reviewed and will be processed shortly.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/seller/withdrawals">
              <Button>View withdrawals</Button>
            </Link>
            <Link href="/seller/wallet">
              <Button variant="secondary">Back to wallet</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
