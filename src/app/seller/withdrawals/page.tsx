import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import WithdrawalRequestForm from "@/components/seller/WithdrawalRequestForm";
import { requireSellerProfile } from "@/lib/auth";
import { getProfileWallet, getSellerWithdrawalRequests } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusVariant = {
  paid: "success",
  rejected: "danger",
  pending: "warning",
  approved: "info",
  cancelled: "neutral"
} as const;

export default async function SellerWithdrawalsPage() {
  const profile = await requireSellerProfile();
  const [wallet, withdrawalRequests] = await Promise.all([
    getProfileWallet(profile.id),
    getSellerWithdrawalRequests(profile.id)
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(300px,0.45fr)]">
      <Card>
        <CardHeader className="p-5 sm:p-6">
          <CardTitle>Request withdrawal</CardTitle>
          <CardDescription>Send available wallet funds to your bank account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
          <WithdrawalRequestForm availableBalance={wallet.available_balance} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-5 sm:p-6">
          <CardTitle>Balance</CardTitle>
          <CardDescription>Only released funds can be withdrawn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
          <div className="rounded-[22px] bg-primary-dark p-4 text-white">
            <p className="text-sm text-blue-100">Available now</p>
            <p className="mt-3 break-words font-heading text-3xl font-semibold">
              {formatCurrency(wallet.available_balance)}
            </p>
          </div>
          <div className="rounded-[22px] bg-surface p-4">
            <p className="text-sm text-muted-foreground">Pending release</p>
            <p className="mt-3 break-words font-heading text-2xl font-semibold text-foreground">
              {formatCurrency(wallet.pending_balance)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-2">
        <CardHeader className="p-5 sm:p-6">
          <CardTitle>Withdrawal history</CardTitle>
          <CardDescription>Track payout requests from submission to payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
          {withdrawalRequests.length === 0 ? (
            <p className="rounded-[22px] bg-surface p-5 text-sm text-muted-foreground">
              No withdrawal requests yet.
            </p>
          ) : (
            withdrawalRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-3 rounded-[22px] bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{formatCurrency(request.amount)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {request.bank_name || "Bank not provided"} on {formatDate(request.created_at)}
                  </p>
                  <p className="mt-1 break-words text-xs text-muted-foreground">
                    {request.account_name} {request.account_number ? `- ${request.account_number}` : ""}
                  </p>
                  {request.admin_note ? (
                    <div className="mt-2 rounded-2xl bg-white p-3 text-sm">
                      <p className="font-semibold text-foreground">Rejection reason</p>
                      <p className="mt-1 break-words text-muted-foreground">{request.admin_note}</p>
                    </div>
                  ) : null}
                </div>
                <Badge variant={statusVariant[request.status]} className="self-start sm:self-center">
                  {request.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
