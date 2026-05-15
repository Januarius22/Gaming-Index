import { ReceiptText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function AccountOrdersPage() {
  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>
          Your buyer purchase history will appear here once transaction flow is connected.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-surface px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-primary shadow-sm">
            <ReceiptText className="h-6 w-6" />
          </div>
          <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">
            No purchases yet
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            When buyer checkout is enabled, this page can track order status, delivery,
            and post-purchase support from your account workspace.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
