import Link from "next/link";
import AccountStatsCards from "@/components/account/AccountStatsCards";
import { buttonClassName } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/Card";
import { requireAccountProfile } from "@/lib/auth";
import { getAccountDashboardStats } from "@/lib/data";
import { titleCase } from "@/lib/utils";

export default async function AccountDashboardPage() {
  const profile = await requireAccountProfile();
  const stats = await getAccountDashboardStats(profile);

  return (
    <div className="space-y-6">
      <AccountStatsCards stats={stats} />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Account overview</CardTitle>
            <CardDescription>
              Browse the marketplace freely, then unlock seller tools only when you are
              ready to list accounts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-3xl bg-surface p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Seller access
              </p>
              <p className="mt-3 text-3xl font-semibold text-foreground">
                {profile.seller_enabled ? "Enabled" : "Buyer account only"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {profile.seller_enabled
                  ? `Your KYC status is ${titleCase(profile.kyc_status)} and your seller workspace is ready.`
                  : "You can browse as a buyer now and unlock seller access later without creating a second account."}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/account/marketplace"
                className={buttonClassName({
                  className: "w-full whitespace-nowrap"
                })}
              >
                Browse Marketplace
              </Link>
              <Link
                href="/account/seller"
                className={buttonClassName({
                  variant: "secondary",
                  className: "w-full whitespace-nowrap"
                })}
              >
                {profile.seller_enabled ? "Open Seller Center" : "Become a Seller"}
              </Link>
              <Link
                href="/account/settings"
                className={buttonClassName({
                  variant: "subtle",
                  className: "w-full whitespace-nowrap"
                })}
              >
                Account Settings
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile snapshot</CardTitle>
            <CardDescription>Your account identity and marketplace readiness.</CardDescription>
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
