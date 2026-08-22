import { redirect } from "next/navigation";
import { PauseCircle } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { requestAccountReactivationAction } from "@/actions/settings";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import Badge from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { getCurrentProfile, getDashboardRoute, signOutServerSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

const DEACTIVATION_WINDOW_DAYS = 30;

export default async function AccountDeactivatedPage({
  searchParams
}: {
  searchParams?: Promise<{ notice?: string }>;
}) {
  const [profile, params] = await Promise.all([
    getCurrentProfile(),
    searchParams ?? Promise.resolve({} as { notice?: string })
  ]);

  if (!profile) {
    redirect("/auth/login");
  }

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (profile.is_deleted) {
    await signOutServerSession();
    redirect("/auth/login");
  }

  if (profile.is_banned) {
    redirect("/account-suspended");
  }

  if (!profile.is_deactivated) {
    redirect(getDashboardRoute(profile.role));
  }

  const deactivatedAt = profile.deactivated_at ?? profile.account_status_updated_at ?? profile.created_at;
  const reactivationWindowClosesAt = new Date(
    new Date(deactivatedAt).getTime() + DEACTIVATION_WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  const notice =
    params.notice === "reactivation-requested"
      ? "Reactivation request sent. Our team will review it."
      : params.notice === "reactivation-failed"
        ? "Reactivation request could not be sent right now."
        : "";

  return (
    <main className="min-h-screen bg-surface px-4 py-10">
      <Card className="mx-auto max-w-2xl border-border/70">
        <CardContent>
          <div className="flex flex-col items-center rounded-[32px] bg-white px-5 py-10 text-center sm:px-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-primary-soft text-primary ring-1 ring-primary/10">
              <PauseCircle className="h-8 w-8" />
            </div>

            <Badge variant="neutral" className="mt-6">
              Account deactivated
            </Badge>

            <h1 className="mt-5 font-heading text-3xl font-semibold text-foreground">
              Your account is paused
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              Your workspace is inactive for now. You can request reactivation within 30 days.
            </p>

            <div className="mt-8 w-full rounded-3xl border border-border bg-surface p-5 text-left">
              <p className="text-sm font-semibold text-foreground">Account status</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {profile.deactivation_reason || "No reason was provided."}
              </p>
              <div className="mt-4 grid gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:grid-cols-2">
                <p>Paused {formatDate(deactivatedAt)}</p>
                <p>Window closes {formatDate(reactivationWindowClosesAt)}</p>
              </div>
            </div>

            <div className="mt-6 w-full">
              <FormMessage
                message={notice}
                tone={params.notice === "reactivation-failed" ? "error" : "success"}
              />
            </div>

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <form action={requestAccountReactivationAction}>
                <input
                  type="hidden"
                  name="reason"
                  value="User requested reactivation from deactivated account notice."
                />
                <SubmitButton pendingLabel="Sending..." className="w-full rounded-2xl">
                  Request reactivation
                </SubmitButton>
              </form>
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
