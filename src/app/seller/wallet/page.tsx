import { Clock3, CreditCard, TrendingUp, Wallet } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireSellerProfile } from "@/lib/auth";
import { getProfileWallet } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function SellerWalletPage() {
  const profile = await requireSellerProfile();
  const wallet = await getProfileWallet(profile.id);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.45fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>
            Track seller earnings as they move from pending hold to available balance.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-primary-dark p-5 text-white sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-blue-100">Available balance</p>
              <div className="rounded-2xl bg-white/12 p-3 text-white">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 break-words font-heading text-4xl font-semibold">
              {formatCurrency(wallet.available_balance)}
            </p>
            <p className="mt-2 text-sm leading-6 text-blue-100">
              Funds ready for withdrawal after release.
            </p>
          </div>
          <div className="rounded-3xl bg-surface p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">Pending balance</p>
              <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
                <Clock3 className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 break-words font-heading text-4xl font-semibold text-foreground">
              {formatCurrency(wallet.pending_balance)}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Earnings still inside the buyer protection hold.
            </p>
          </div>
          <div className="rounded-3xl bg-surface p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">Total earned</p>
              <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 break-words font-heading text-3xl font-semibold text-foreground">
              {formatCurrency(wallet.total_earned)}
            </p>
          </div>
          <div className="rounded-3xl bg-surface p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">Total withdrawn</p>
              <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 break-words font-heading text-3xl font-semibold text-foreground">
              {formatCurrency(wallet.total_withdrawn)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payouts</CardTitle>
          <CardDescription>Request money from your available balance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button disabled={wallet.available_balance <= 0} className="w-full">
            Withdraw
          </Button>
          <p className="text-sm leading-6 text-muted-foreground">
            Withdrawal requests are connected after the balance movement flow, so every payout can
            match a wallet transaction and admin review.
          </p>
          <div className="rounded-3xl bg-surface p-4 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-3">
              <span className="text-muted-foreground">Available now</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(wallet.available_balance)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-3">
              <span className="text-muted-foreground">Pending release</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(wallet.pending_balance)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
