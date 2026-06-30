import Link from "next/link";
import FormMessage from "@/components/auth/FormMessage";
import NotificationList from "@/components/notifications/NotificationList";
import SellerEnforcementNoticeModal from "@/components/seller/SellerEnforcementNoticeModal";
import KycReviewNoticeModal from "@/components/seller/KycReviewNoticeModal";
import SellerStatsCards from "@/components/seller/SellerStatsCards";
import Button, { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  getLatestSellerKycSubmission,
  getLatestSellerEnforcement,
  getProfileNotifications,
  getSellerDashboardStats
} from "@/lib/data";
import { canUploadAccounts, requireSellerProfile } from "@/lib/auth";
import { titleCase } from "@/lib/utils";

export default async function SellerDashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ kyc?: string }>;
}) {
  const profile = await requireSellerProfile();
  const [stats, latestKycSubmission, notifications, latestEnforcement] = await Promise.all([
    getSellerDashboardStats(profile),
    getLatestSellerKycSubmission(profile.id),
    getProfileNotifications(profile.id, 3),
    getLatestSellerEnforcement(profile.id)
  ]);
  const params = (await searchParams) ?? {};
  const uploadUnlocked = canUploadAccounts(profile.kyc_status, profile);
  const kycHeading =
    profile.kyc_status === "pending" ? "Pending review" : titleCase(profile.kyc_status);
  const kycDescription =
    profile.kyc_status === "approved"
      ? "Your KYC is approved and upload access is fully enabled."
      : profile.kyc_status === "pending"
        ? "Your KYC has been submitted successfully and is now waiting for admin review."
        : profile.kyc_status === "rejected"
          ? "Your previous KYC submission was rejected. Update your details and submit again."
          : "Complete KYC verification to unlock upload access and publish listings directly.";
  const kycButtonLabel =
    profile.kyc_status === "pending"
      ? "View KYC Status"
      : profile.kyc_status === "approved"
        ? "KYC Approved"
        : "Complete KYC";

  return (
    <div className="space-y-6">
      <KycReviewNoticeModal
        submissionId={latestKycSubmission?.status === "rejected" ? latestKycSubmission.id : undefined}
        rejectionReason={latestKycSubmission?.status === "rejected" ? latestKycSubmission.rejection_reason : undefined}
      />
      <SellerEnforcementNoticeModal enforcement={latestEnforcement} />
      {params.kyc === "submitted" ? (
        <FormMessage
          message="KYC submitted successfully. Your verification is now pending admin review."
          tone="success"
        />
      ) : null}

      <SellerStatsCards stats={stats} />

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
          <div className="space-y-2">
            <CardTitle className="text-lg">Recent notifications</CardTitle>
            <CardDescription>Latest sales, wallet, and account updates.</CardDescription>
          </div>
          <Link
            href="/seller/notifications"
            className={buttonClassName({ variant: "secondary", size: "sm" })}
          >
            See more
          </Link>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
          <NotificationList
            notifications={notifications}
            emptyMessage="No seller notifications yet."
            compact
          />
        </CardContent>
      </Card>

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
                {kycHeading}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {kycDescription}
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
              <Link href={uploadUnlocked ? "/seller/upload" : "/seller/kyc"}>
                <Button variant={uploadUnlocked ? "primary" : "secondary"}>
                  {uploadUnlocked ? "Upload Account" : "Upload Locked Until Approval"}
                </Button>
              </Link>
              <Link href="/seller/listings">
                <Button variant="secondary">View Listings</Button>
              </Link>
              <Link href="/seller/kyc">
                <Button variant="subtle" disabled={profile.kyc_status === "approved"}>
                  {kycButtonLabel}
                </Button>
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
