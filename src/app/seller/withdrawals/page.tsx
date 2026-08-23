import { Landmark } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import WithdrawalRequestForm from "@/components/seller/WithdrawalRequestForm";
import EmptyState from "@/components/ui/EmptyState";
import { requireSellerProfile } from "@/lib/auth";
import { getCurrencyRates, getProfileSettings, getProfileWallet, getSellerWithdrawalRequests } from "@/lib/data";
import { BASE_CURRENCY_CODE, formatCurrency, formatDate, titleCase } from "@/lib/utils";

const statusVariant = {
  paid: "success",
  rejected: "danger",
  pending: "warning",
  approved: "info",
  cancelled: "neutral"
} as const;

export default async function SellerWithdrawalsPage() {
  const profile = await requireSellerProfile();
  const [wallet, withdrawalRequests, settings, currencyRates] = await Promise.all([
    getProfileWallet(profile.id),
    getSellerWithdrawalRequests(profile.id),
    getProfileSettings(profile.id),
    getCurrencyRates()
  ]);
  const displayCurrency = settings.display_currency;
  const showDisplayEstimate = displayCurrency !== BASE_CURRENCY_CODE;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(300px,0.45fr)]">
      <Card>
        <CardHeader className="p-5 sm:p-6">
          <CardTitle>Request withdrawal</CardTitle>
          <CardDescription>Send available wallet funds to your bank account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
          <WithdrawalRequestForm
            availableBalance={wallet.available_balance}
            settings={settings}
            currencyRates={currencyRates}
          />
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
              {formatCurrency(wallet.available_balance, BASE_CURRENCY_CODE, currencyRates)}
            </p>
            {showDisplayEstimate ? (
              <p className="mt-2 text-xs font-medium text-blue-100">
                Estimate: {formatCurrency(wallet.available_balance, displayCurrency, currencyRates)}
              </p>
            ) : null}
          </div>
          <div className="rounded-[22px] bg-surface p-4">
            <p className="text-sm text-muted-foreground">Pending release</p>
            <p className="mt-3 break-words font-heading text-2xl font-semibold text-foreground">
              {formatCurrency(wallet.pending_balance, BASE_CURRENCY_CODE, currencyRates)}
            </p>
            {showDisplayEstimate ? (
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                Estimate: {formatCurrency(wallet.pending_balance, displayCurrency, currencyRates)}
              </p>
            ) : null}
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
            <EmptyState
              icon={<Landmark className="h-7 w-7" />}
              title="No withdrawal requests yet"
              description="Submitted withdrawal requests will appear here with status updates."
              className="min-h-[18rem]"
            />
          ) : (
            withdrawalRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col gap-3 rounded-[22px] bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{formatCurrency(request.amount, BASE_CURRENCY_CODE, currencyRates)}</p>
                  {showDisplayEstimate ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Estimate: {formatCurrency(request.amount, displayCurrency, currencyRates)}
                    </p>
                  ) : null}
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
                  {request.payout_reference ? (
                    <div className="mt-2 rounded-2xl bg-white p-3 text-sm">
                      <p className="font-semibold text-foreground">Payout reference</p>
                      <p className="mt-1 break-words text-muted-foreground">{request.payout_reference}</p>
                      {request.payout_proof_url ? (
                        <a
                          href={request.payout_proof_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex font-semibold text-primary hover:text-primary-dark"
                        >
                          View payout proof
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <Badge variant={statusVariant[request.status]} className="self-start sm:self-center">
                  {titleCase(request.status)}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
