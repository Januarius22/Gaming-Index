import Link from "next/link";
import {
  AnalyticsMetricGrid,
  AnalyticsTable,
  BarListChart,
  DonutChartCard,
  SignalList,
  TrendChart
} from "@/components/analytics/AnalyticsPanels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireSellerProfile } from "@/lib/auth";
import { getSellerAnalytics } from "@/lib/data";
import { formatCompactCurrency, formatDate } from "@/lib/utils";

export default async function SellerAnalyticsPage() {
  const profile = await requireSellerProfile();
  const analytics = await getSellerAnalytics(profile);

  return (
    <div className="mx-auto w-full max-w-[1540px] space-y-6 px-1 sm:px-2">
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>
            Track earnings, listings, orders, withdrawals, and seller account health.
          </CardDescription>
        </CardHeader>
      </Card>

      <AnalyticsMetricGrid metrics={analytics.metrics} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]">
        <TrendChart
          title="Earnings Trend"
          description="Seller payout value from paid orders over recent months."
          data={analytics.earningsTrend}
          valueLabel="Primary line shows seller payout value."
          secondaryLabel="Sales"
          secondaryValueKind="count"
        />
        <DonutChartCard
          title="Listing Status"
          description="How your account inventory is distributed."
          data={analytics.listingStatus}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <BarListChart
          title="Games"
          description="Games represented in your listings."
          data={analytics.gameBreakdown}
        />
        <BarListChart
          title="Orders"
          description="Order state distribution."
          data={analytics.orderStatus}
        />
        <BarListChart
          title="Withdrawals"
          description="Withdrawal request status."
          data={analytics.withdrawalStatus}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <BarListChart
          title="Reputation"
          description="Rating, reviews, strikes, and enforcement signals."
          data={analytics.reputation}
          valueKind="decimal"
        />
        <SignalList
          title="Seller Signals"
          description="Shortcuts to the areas most likely to need action."
          signals={analytics.signals}
        />
      </div>

      <AnalyticsTable
        title="Recent Sales"
        description="Latest paid orders tied to your seller account."
        headers={["Order", "Payout", "Date", "Open"]}
        rows={analytics.recentSales.map((sale) => [
          <p key="title" className="font-semibold">
            {sale.title}
          </p>,
          formatCompactCurrency(sale.amount),
          formatDate(sale.created_at),
          <Link key="open" href={`/seller/orders`} className="font-semibold text-primary">
            Orders
          </Link>
        ])}
      />

      <Card>
        <CardContent className="p-5 text-sm leading-7 text-muted-foreground">
          Use this page to decide what to list next, when to withdraw, and which orders or disputes
          need attention.
        </CardContent>
      </Card>
    </div>
  );
}
