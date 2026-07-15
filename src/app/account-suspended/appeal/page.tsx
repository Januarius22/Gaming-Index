import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import SuspensionAppealForm from "@/components/account/SuspensionAppealForm";
import Badge from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile, getDashboardRoute } from "@/lib/auth";
import { getBusinessSettings } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function SuspensionAppealPage() {
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

  if (profile.is_deleted) {
    redirect("/auth/login");
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
      <Card className="mx-auto max-w-3xl border-border/70">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[24px] bg-rose-50 text-rose-700 ring-1 ring-rose-100">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <Badge variant="danger">Account suspended</Badge>
            <CardTitle className="mt-4 text-3xl">Submit an appeal</CardTitle>
            <CardDescription className="mx-auto mt-2 max-w-xl">
              Request a review if you believe this suspension should be reconsidered.
            </CardDescription>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Submit within {businessSettings.suspension_appeal_window_days} days - closes {formatDate(appealExpiresAt)}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-3xl border border-rose-100 bg-rose-50 p-5">
            <p className="text-sm font-semibold text-rose-700">Suspension reason</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {profile.banned_reason || "No reason was provided."}
            </p>
            {profile.banned_at ? (
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">
                Suspended {formatDate(profile.banned_at)}
              </p>
            ) : null}
          </div>

          <SuspensionAppealForm defaultEmail={profile.email} />

          <Link
            href="/account-suspended"
            className={buttonClassName({ variant: "secondary", className: "gap-2" })}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to suspension notice
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
