import { updateBusinessSettingsAction } from "@/actions/admin";
import SubmitButton from "@/components/auth/SubmitButton";
import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { getBusinessSettings } from "@/lib/data";

export default async function AdminBusinessPage({
  searchParams
}: {
  searchParams?: Promise<{ notice?: string; error?: string }>;
}) {
  const [{ notice, error }, settings] = await Promise.all([
    searchParams ?? Promise.resolve({} as { notice?: string; error?: string }),
    getBusinessSettings()
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Business Settings</CardTitle>
              <CardDescription>
                Core marketplace rules for commission, buyer protection, disputes, and payouts.
              </CardDescription>
            </div>
            <Badge variant="info">Admin controlled</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {notice ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                notice === "business-settings-saved" || notice === "demo-business-settings"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {notice === "business-settings-saved"
                ? "Business settings saved."
                : notice === "demo-business-settings"
                  ? "Demo mode cannot save business settings. Connect Supabase to persist changes."
                  : error || "Business settings could not be saved."}
            </div>
          ) : null}

          <form action={updateBusinessSettingsAction} className="space-y-5">
            <section className="rounded-[24px] border border-border bg-surface p-4">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Revenue
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Commission is stored on each order when checkout starts.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">Platform commission (%)</span>
                  <Input
                    name="platformCommissionPercent"
                    type="number"
                    min="0"
                    max="50"
                    step="0.01"
                    defaultValue={settings.platform_commission_rate * 100}
                    required
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">Buyer protection hold (hours)</span>
                  <Input
                    name="buyerProtectionHoldHours"
                    type="number"
                    min="1"
                    step="1"
                    defaultValue={settings.buyer_protection_hold_hours}
                    required
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">Withdrawal review target (hours)</span>
                  <Input
                    name="withdrawalReviewHours"
                    type="number"
                    min="1"
                    step="1"
                    defaultValue={settings.withdrawal_review_hours}
                    required
                  />
                </label>
              </div>
            </section>

            <section className="rounded-[24px] border border-border bg-surface p-4">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Disputes
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Evidence limits keep cases manageable and uploads predictable.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">Dispute window (hours)</span>
                  <Input
                    name="disputeWindowHours"
                    type="number"
                    min="1"
                    step="1"
                    defaultValue={settings.dispute_window_hours}
                    required
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">Image limit</span>
                  <Input
                    name="maxDisputeImages"
                    type="number"
                    min="1"
                    step="1"
                    defaultValue={settings.max_dispute_images}
                    required
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">Video limit</span>
                  <Input
                    name="maxDisputeVideos"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={settings.max_dispute_videos}
                    required
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">Video length (seconds)</span>
                  <Input
                    name="maxDisputeVideoSeconds"
                    type="number"
                    min="1"
                    step="1"
                    defaultValue={settings.max_dispute_video_seconds}
                    required
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">Image size (MB)</span>
                  <Input
                    name="maxDisputeImageSizeMb"
                    type="number"
                    min="1"
                    step="1"
                    defaultValue={settings.max_dispute_image_size_mb}
                    required
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">Video size (MB)</span>
                  <Input
                    name="maxDisputeVideoSizeMb"
                    type="number"
                    min="1"
                    step="1"
                    defaultValue={settings.max_dispute_video_size_mb}
                    required
                  />
                </label>
              </div>
            </section>

            <section className="rounded-[24px] border border-border bg-surface p-4">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Marketplace Controls
              </h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-foreground">Listing image limit</span>
                  <Input
                    name="maxListingImages"
                    type="number"
                    min="1"
                    step="1"
                    defaultValue={settings.max_listing_images}
                    required
                  />
                </label>
                <label className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-foreground">
                  Auto-release funds
                  <input
                    name="autoReleaseEnabled"
                    type="checkbox"
                    defaultChecked={settings.auto_release_enabled}
                    className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-foreground">
                  Partial refunds
                  <input
                    name="partialRefundEnabled"
                    type="checkbox"
                    defaultChecked={settings.partial_refund_enabled}
                    className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                  />
                </label>
              </div>
            </section>

            <SubmitButton pendingLabel="Saving settings..." className="w-full">
              Save business settings
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
