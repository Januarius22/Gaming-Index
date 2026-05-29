import FormMessage from "@/components/auth/FormMessage";
import KycReviewTable from "@/components/admin/KycReviewTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getAdminKycQueuePage } from "@/lib/data";

export default async function AdminKycPage({
  searchParams
}: {
  searchParams?: Promise<{ notice?: string; page?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const requestedPage = Math.max(1, Number(params.page ?? "1") || 1);
  const { submissions, currentPage, totalCount, totalPages } = await getAdminKycQueuePage(
    requestedPage,
    10
  );
  const noticeMessage =
    params.notice === "kyc-approved"
      ? "KYC approved successfully."
      : params.notice === "kyc-rejected"
        ? "KYC rejected successfully."
        : params.notice === "kyc-update-failed"
          ? "KYC status could not be updated. Please try again."
          : params.notice === "kyc-profile-sync-failed"
            ? "KYC review changed, but the seller profile did not sync. Update the profile policy in Supabase and try again."
        : "";
  const noticeTone =
    params.notice === "kyc-update-failed" || params.notice === "kyc-profile-sync-failed"
      ? "error"
      : "success";
  const pageStart = totalCount === 0 ? 0 : (currentPage - 1) * 10 + 1;
  const pageEnd = totalCount === 0 ? 0 : Math.min(currentPage * 10, totalCount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC reviews</CardTitle>
        <CardDescription>Review seller identity submissions and update approval status.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormMessage message={noticeMessage} tone={noticeTone} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} KYC submissions
          </p>
          {totalPages > 1 ? (
            <PaginationControls
              pathname="/admin/kyc"
              currentPage={currentPage}
              totalPages={totalPages}
              query={{ notice: params.notice }}
            />
          ) : null}
        </div>
        <KycReviewTable submissions={submissions} currentPage={currentPage} />
      </CardContent>
    </Card>
  );
}
