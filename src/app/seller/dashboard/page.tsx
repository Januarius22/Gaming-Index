import Link from "next/link";
import SellerStatsCards from "@/components/seller/SellerStatsCards";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getSellerDashboardStats } from "@/lib/data";
import { requireSellerProfile } from "@/lib/auth";
import { titleCase } from "@/lib/utils";

export default async function SellerDashboardPage() {
  const profile = await requireSellerProfile();
  const stats = await getSellerDashboardStats(profile);

  return (
    <div className="space-y-6">
      <SellerStatsCards stats={stats} />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Seller overview</CardTitle>
            <CardDescription>
              Keep an eye on your KYC progress, listing activity, and the next step to unlock selling.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-3xl bg-surface p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                KYC status
              </p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {titleCase(profile.kyc_status)}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Complete KYC verification to unlock upload access and move listings into the review queue.
              </p>
            </div>
            <div className="rounded-3xl border border-primary/12 bg-primary-soft/55 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-dark">
                Upload tip
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                When you prepare account screenshots, combine them into one clean photo grid so buyers can read the key account proof quickly.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/seller/upload">
                <Button>Upload Account</Button>
              </Link>
              <Link href="/seller/listings">
                <Button variant="secondary">View Listings</Button>
              </Link>
              <Link href="/seller/kyc">
                <Button variant="subtle">Complete KYC</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account summary</CardTitle>
            <CardDescription>Your seller identity and workspace setup.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
              <span className="text-muted-foreground">Full Name</span>
              <span className="font-semibold text-foreground">{profile.full_name}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
              <span className="text-muted-foreground">Username</span>
              <span className="font-semibold text-foreground">@{profile.username}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
              <span className="text-muted-foreground">Email</span>
              <span className="font-semibold text-foreground">{profile.email}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
              <span className="text-muted-foreground">Seller Access</span>
              <span className="font-semibold text-foreground">
                {profile.seller_enabled ? "Enabled" : "Not enabled"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
