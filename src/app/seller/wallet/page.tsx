import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function SellerWalletPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>Dummy wallet balances for the current marketplace phase.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-primary-dark p-6 text-white">
            <p className="text-sm text-blue-100">Available Balance</p>
            <p className="mt-4 font-heading text-4xl font-semibold">$0</p>
          </div>
          <div className="rounded-3xl bg-surface p-6">
            <p className="text-sm text-muted-foreground">Pending Balance</p>
            <p className="mt-4 font-heading text-4xl font-semibold text-foreground">$0</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payouts</CardTitle>
          <CardDescription>Withdrawals will be enabled in a later phase.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button disabled className="w-full">
            Withdraw
          </Button>
          <p className="text-sm leading-6 text-muted-foreground">
            Payouts will be enabled later once transaction flows move beyond the current dummy logic.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
