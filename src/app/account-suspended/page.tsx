import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getCurrentProfile, getDashboardRoute } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default async function AccountSuspendedPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (!profile.is_banned) {
    redirect(getDashboardRoute(profile.role));
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-10">
      <Card className="mx-auto max-w-2xl border-border/70">
        <CardContent>
          <div className="flex flex-col items-center rounded-[32px] bg-white px-5 py-10 text-center sm:px-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-rose-50 text-rose-700 ring-1 ring-rose-100">
              <ShieldAlert className="h-8 w-8" />
            </div>

            <Badge variant="danger" className="mt-6">
              Account suspended
            </Badge>

            <h1 className="mt-5 font-heading text-3xl font-semibold text-foreground">
              Your account has been suspended.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              You can still sign in to view this notice, but marketplace, checkout, seller, and
              account workspace features are unavailable until an admin lifts the suspension.
            </p>

            <div className="mt-8 w-full rounded-3xl border border-rose-100 bg-rose-50 p-5 text-left">
              <p className="text-sm font-semibold text-rose-700">Reason from admin</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {profile.banned_reason || "No reason was provided."}
              </p>
              {profile.banned_at ? (
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">
                  Suspended {formatDate(profile.banned_at)}
                </p>
              ) : null}
            </div>

            <div className="mt-6 w-full rounded-3xl border border-border bg-surface p-5 text-left text-sm leading-7 text-muted-foreground">
              To appeal, contact Gaming Index support with your account email:
              <span className="font-semibold text-foreground"> {profile.email}</span>.
            </div>

            <form action={logoutAction} className="mt-8">
              <Button type="submit" variant="secondary" className="rounded-2xl">
                Log out
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
