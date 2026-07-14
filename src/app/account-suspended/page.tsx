import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import SubmitButton from "@/components/auth/SubmitButton";
import Badge from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getCurrentProfile, getDashboardRoute } from "@/lib/auth";
import { getBusinessSettings } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AccountSuspendedPage() {
  const [profile, businessSettings] = await Promise.all([
    getCurrentProfile(),
    getBusinessSettings()
  ]);

  if (!profile) {
    redirect("/auth/login");
  }

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (!profile.is_banned) {
    redirect(getDashboardRoute(profile.role));
  }

  const suspensionStartedAt = profile.banned_at ?? profile.created_at;
  const appealExpiresAt = new Date(
    new Date(suspensionStartedAt).getTime() +
      businessSettings.suspension_appeal_window_days * 24 * 60 * 60 * 1000
  ).toISOString();

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
              Account suspended
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              Your account is currently suspended. You may submit an appeal if you believe this
              action should be reviewed.
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Appeal window: {businessSettings.suspension_appeal_window_days} days - closes {formatDate(appealExpiresAt)}
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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/account-suspended/appeal"
                className={buttonClassName({ variant: "primary", className: "rounded-2xl" })}
              >
                Submit appeal
              </Link>
              <form action={logoutAction}>
                <SubmitButton pendingLabel="Logging out..." variant="secondary" className="w-full rounded-2xl">
                  Log out
                </SubmitButton>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
