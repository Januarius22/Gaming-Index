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
import { getAdminAnalytics } from "@/lib/data";
import { formatCompactCurrency } from "@/lib/utils";

export default async function AdminAnalyticsPage() {
  const analytics = await getAdminAnalytics();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>
            Business health, marketplace performance, trust signals, and financial exposure in one view.
          </CardDescription>
        </CardHeader>
      </Card>

      <AnalyticsMetricGrid metrics={analytics.metrics} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]">
        <TrendChart
          title="Sales and Commission"
          description="Paid order volume with platform commission as the secondary signal."
          data={analytics.salesTrend}
          valueLabel="Primary line shows sales volume."
          secondaryLabel="Commission"
        />
        <DonutChartCard
          title="Listing Status"
          description="Current listing distribution across the marketplace."
          data={analytics.listingStatus}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <BarListChart
          title="Games"
          description="Where marketplace inventory is concentrated."
          data={analytics.gameBreakdown}
        />
        <BarListChart
          title="Orders"
          description="Order state distribution."
          data={analytics.orderStatus}
        />
        <BarListChart
          title="Disputes"
          description="Trust and safety case status."
          data={analytics.disputeStatus}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <BarListChart
          title="Financial Control"
          description="Commission, seller balances, withdrawals, and refund exposure."
          data={analytics.financialBreakdown}
          valueKind="currency"
        />
        <AnalyticsTable
          title="Top Sellers"
          description="Highest sales volume by seller."
          headers={["Seller", "Sales", "Revenue", "Open"]}
          rows={analytics.topSellers.map((seller) => [
            <div key="seller">
              <p className="font-semibold">{seller.seller_name}</p>
              <p className="text-sm text-muted-foreground">@{seller.seller_username}</p>
            </div>,
            seller.sales,
            formatCompactCurrency(seller.revenue),
            <Link key="open" href="/admin/sellers" className="font-semibold text-primary">
              Sellers
            </Link>
          ])}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BarListChart
          title="KYC Pipeline"
          description="Seller verification state."
          data={analytics.kycBreakdown}
        />
        <SignalList
          title="Recent Signals"
          description="Fast shortcuts into operational areas that may need attention."
          signals={analytics.recentSignals}
        />
      </div>

      <Card>
        <CardContent className="p-5 text-sm leading-7 text-muted-foreground">
          Use this page as a control layer. The dashboard stays quick; analytics carries the deeper
          business picture.
        </CardContent>
      </Card>
    </div>
  );
}
