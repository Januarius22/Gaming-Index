import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireSellerProfile } from "@/lib/auth";
import { getProfileWalletTransactions } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

const bucketVariant = {
  available: "success",
  pending: "warning",
  external: "neutral"
} as const;

export default async function SellerTransactionsPage() {
  const profile = await requireSellerProfile();
  const transactions = await getProfileWalletTransactions(profile.id, 50);

  return (
    <Card>
      <CardHeader className="p-5 sm:p-6">
        <CardTitle>Wallet activity</CardTitle>
        <CardDescription>Balance movements linked to sales, releases, and withdrawals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
        {transactions.length === 0 ? (
          <p className="rounded-[22px] bg-surface p-5 text-sm text-muted-foreground">
            No wallet transactions yet.
          </p>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex flex-col gap-3 rounded-[22px] bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="break-words font-semibold text-foreground">
                  {transaction.description || transaction.type}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{transaction.type}</span>
                  <span aria-hidden="true">/</span>
                  <span>{formatDate(transaction.created_at)}</span>
                  <Badge variant={bucketVariant[transaction.balance_bucket]}>{transaction.balance_bucket}</Badge>
                </div>
              </div>
              <p
                className={
                  transaction.direction === "credit"
                    ? "font-heading text-2xl font-semibold text-emerald-700"
                    : "font-heading text-2xl font-semibold text-rose-700"
                }
              >
                {transaction.direction === "credit" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
