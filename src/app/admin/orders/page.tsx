import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getAdminOrders } from "@/lib/data";
import { formatCurrency, formatDate, statusVariant } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>Marketplace transaction records will appear here as payment logic is expanded.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Buyer</th>
                <th className="px-4 py-3 font-medium">Game Account</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-border/60">
                    <td className="px-4 py-4 font-medium text-foreground">{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-4">{order.buyer_name}</td>
                    <td className="px-4 py-4">{order.listing_title}</td>
                    <td className="px-4 py-4">{formatCurrency(order.amount)}</td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                    </td>
                    <td className="px-4 py-4">{formatDate(order.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
