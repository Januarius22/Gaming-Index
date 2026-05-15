import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireSellerProfile } from "@/lib/auth";

export default async function SellerSettingsPage() {
  const profile = await requireSellerProfile();

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Account settings</CardTitle>
          <CardDescription>Keep your seller identity details organized and ready for future settings flows.</CardDescription>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace preferences</CardTitle>
          <CardDescription>Reserved for notification settings, payout preferences, and profile edits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>Email notifications for order updates will live here later.</p>
          <p>Password management and payout preferences can be added without disturbing layout boundaries.</p>
        </CardContent>
      </Card>
    </div>
  );
}
