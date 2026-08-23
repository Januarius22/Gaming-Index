import { ReceiptText } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PaginationControls from "@/components/ui/PaginationControls";
import { requireSellerProfile } from "@/lib/auth";
import { getCurrencyRates, getProfileSettings, getProfileWalletTransactions } from "@/lib/data";
import {
  BASE_CURRENCY_CODE,
  formatCurrency,
  formatDate,
  paginateItems,
  parsePageParam,
  titleCase
} from "@/lib/utils";

const bucketVariant = {
  available: "success",
  pending: "warning",
  external: "neutral"
} as const;

function formatTransactionType(value: string) {
  return titleCase(value);
}

export default async function SellerTransactionsPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const profile = await requireSellerProfile();
  const [transactions, settings, currencyRates] = await Promise.all([
    getProfileWalletTransactions(profile.id, 50),
    getProfileSettings(profile.id),
    getCurrencyRates()
  ]);
  const displayCurrency = settings.display_currency;
  const showBaseCurrency = displayCurrency !== BASE_CURRENCY_CODE;
  const formatDisplayCurrency = (value: number) => formatCurrency(value, displayCurrency, currencyRates);
  const formatBaseCurrency = (value: number) => formatCurrency(value, BASE_CURRENCY_CODE, currencyRates);
  const params = (await searchParams) ?? {};
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedTransactions,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(transactions, requestedPage, 5);

  return (
    <Card>
      <CardHeader className="p-5 sm:p-6">
        <CardTitle>Wallet activity</CardTitle>
        <CardDescription>Balance movements linked to sales, releases, and withdrawals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} transactions
          </p>
          <PaginationControls
            pathname="/seller/transactions"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>

        {paginatedTransactions.length === 0 ? (
          <EmptyState
            icon={<ReceiptText className="h-7 w-7" />}
            title="No wallet activity yet"
            description="Sales, releases, withdrawals, and balance movements will appear here."
            className="min-h-[18rem]"
          />
        ) : (
          paginatedTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-col gap-3 rounded-[22px] bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="break-words font-semibold text-foreground">
                  {transaction.description || formatTransactionType(transaction.type)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{formatTransactionType(transaction.type)}</span>
                  <span aria-hidden="true">/</span>
                  <span>{formatDate(transaction.created_at)}</span>
                  <Badge variant={bucketVariant[transaction.balance_bucket]}>
                    {formatTransactionType(transaction.balance_bucket)}
                  </Badge>
                </div>
              </div>
              <p
                className={
                  transaction.direction === "credit"
                    ? "font-heading text-2xl font-semibold text-emerald-700"
                    : "font-heading text-2xl font-semibold text-rose-700"
                }
              >
                <span>
                  {transaction.direction === "credit" ? "+" : "-"}
                  {formatDisplayCurrency(transaction.amount)}
                </span>
                {showBaseCurrency ? (
                  <span className="block text-right text-xs font-normal text-muted-foreground">
                    Base: {formatBaseCurrency(transaction.amount)}
                  </span>
                ) : null}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
