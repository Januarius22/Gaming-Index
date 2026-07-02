import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireAccountProfile } from "@/lib/auth";

export default async function AccountSettingsPage() {
  const profile = await requireAccountProfile();

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Account settings</CardTitle>
          <CardDescription>
            Keep your buyer account details organized while seller tools stay optional.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-2xl bg-surface px-4 py-3">
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="mt-1 font-semibold text-foreground">{profile.full_name}</p>
          </div>
          <div className="rounded-2xl bg-surface px-4 py-3">
            <p className="text-sm text-muted-foreground">Username</p>
            <p className="mt-1 font-semibold text-foreground">@{profile.username}</p>
          </div>
          <div className="rounded-2xl bg-surface px-4 py-3">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="mt-1 font-semibold text-foreground">{profile.email}</p>
          </div>
          <div className="rounded-2xl bg-surface px-4 py-3">
            <p className="text-sm text-muted-foreground">Seller Access</p>
            <p className="mt-1 font-semibold text-foreground">
              {profile.seller_enabled ? "Enabled" : "Not enabled"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace status</CardTitle>
          <CardDescription>
            Your account tools are separated so buyer activity and seller activity stay organized.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>Notifications, wallet activity, orders, and disputes are available from the dashboard menu.</p>
          <p>Seller tools remain separate so your buying workflow stays clean and focused.</p>
        </CardContent>
      </Card>
    </div>
  );
}
