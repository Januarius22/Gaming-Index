import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile, getDashboardRoute } from "@/lib/auth";

export default async function SuspensionAppealSubmittedPage() {
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
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[24px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <Badge variant="success">Appeal submitted</Badge>
            <CardTitle className="mt-4 text-3xl">Thank you. Your request has been received.</CardTitle>
            <CardDescription className="mx-auto mt-2 max-w-xl">
              Our team will review your appeal and notify you when there is an update.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/account-suspended"
            className={buttonClassName({ variant: "secondary", className: "rounded-2xl" })}
          >
            Back to suspension notice
          </Link>
          <Link href="/auth/login" className={buttonClassName({ className: "rounded-2xl" })}>
            Return to sign in
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
