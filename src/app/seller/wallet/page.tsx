import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  CreditCard,
  Landmark,
  ReceiptText,
  TrendingUp,
  Wallet
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireSellerProfile } from "@/lib/auth";
import { getProfileWallet, getSellerWithdrawalRequests } from "@/lib/data";
import { cn, formatCurrency, formatDate, titleCase } from "@/lib/utils";

const statusVariant = {
  paid: "success",
  rejected: "danger",
  pending: "warning",
  approved: "info",
  cancelled: "neutral"
} as const;

export default async function SellerWalletPage() {
  const profile = await requireSellerProfile();
  const [wallet, withdrawalRequests] = await Promise.all([
    getProfileWallet(profile.id),
    getSellerWithdrawalRequests(profile.id)
  ]);
  const latestWithdrawal = withdrawalRequests[0];

  const summaryCards = [
    {
      label: "Available balance",
      value: wallet.available_balance,
      helper: "Ready for withdrawal after release.",
      icon: Wallet,
      featured: true
    },
    {
      label: "Pending balance",
      value: wallet.pending_balance,
      helper: "Still inside buyer protection hold.",
      icon: Clock3
    },
    {
      label: "Total earned",
      value: wallet.total_earned,
      helper: "Released seller earnings.",
      icon: TrendingUp
    },
    {
      label: "Total withdrawn",
      value: wallet.total_withdrawn,
      helper: "Paid payout requests.",
      icon: CreditCard
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="p-5 sm:p-6">
          <CardTitle>Wallet</CardTitle>
          <CardDescription>
            Track seller earnings as they move from pending hold to available balance.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className={cn(
                    "min-w-0 rounded-[24px] p-4 sm:p-5",
                    card.featured ? "bg-primary-dark text-white" : "bg-surface text-foreground"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className={cn("text-sm", card.featured ? "text-blue-100" : "text-muted-foreground")}>
                      {card.label}
                    </p>
                    <div
                      className={cn(
                        "rounded-2xl p-2.5",
                        card.featured ? "bg-white/12 text-white" : "bg-white text-primary shadow-sm"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-4 break-words font-heading text-3xl font-semibold">
                    {formatCurrency(card.value)}
                  </p>
                  <p className={cn("mt-2 text-sm leading-6", card.featured ? "text-blue-100" : "text-muted-foreground")}>
                    {card.helper}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Withdrawals</CardTitle>
                <CardDescription>Request payouts and track review status.</CardDescription>
              </div>
              <div className="rounded-2xl bg-primary-soft p-3 text-primary">
                <Landmark className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-5 pt-0 sm:p-6 sm:pt-0">
            <div className="rounded-[22px] bg-surface p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Open requests</span>
                <span className="font-semibold text-foreground">
                  {withdrawalRequests.filter((request) => request.status === "pending" || request.status === "approved").length}
                </span>
              </div>
            </div>
            <Link
              href="/seller/withdrawals"
              className={buttonClassName({ variant: "primary", className: "w-full gap-2" })}
            >
              Manage withdrawals
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>View every wallet balance movement.</CardDescription>
              </div>
              <div className="rounded-2xl bg-primary-soft p-3 text-primary">
                <ReceiptText className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-5 pt-0 sm:p-6 sm:pt-0">
            <div className="rounded-[22px] bg-surface p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Lifetime earned</span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(wallet.total_earned)}
                </span>
              </div>
            </div>
            <Link
              href="/seller/transactions"
              className={buttonClassName({ variant: "secondary", className: "w-full gap-2" })}
            >
              Open activity
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {latestWithdrawal ? (
        <Card>
          <CardHeader className="p-5 sm:p-6">
            <CardTitle>Latest withdrawal</CardTitle>
            <CardDescription>Your most recent payout request.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
            <div className="flex flex-col gap-3 rounded-[22px] bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  {formatCurrency(latestWithdrawal.amount)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {latestWithdrawal.bank_name} on {formatDate(latestWithdrawal.created_at)}
                </p>
              </div>
              <Badge variant={statusVariant[latestWithdrawal.status]}>
                {titleCase(latestWithdrawal.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
