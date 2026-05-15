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
          <CardTitle>Workspace preferences</CardTitle>
          <CardDescription>
            Reserved for saved carts, buyer notifications, dispute settings, and profile
            edits later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>Buyer-facing alerts and order tracking controls can live here later.</p>
          <p>Seller tools remain separate so your buying workflow stays clean and focused.</p>
        </CardContent>
      </Card>
    </div>
  );
}
