import Link from "next/link";
import FormMessage from "@/components/auth/FormMessage";
import KycReviewTable from "@/components/admin/KycReviewTable";
import Button, { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getAdminKycQueuePage } from "@/lib/data";
import { cn } from "@/lib/utils";

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
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).filter((pageNumber) => Math.abs(pageNumber - currentPage) <= 2 || pageNumber === 1 || pageNumber === totalPages);
  const uniquePageNumbers = [...new Set(pageNumbers)];
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
            <div className="flex flex-wrap items-center gap-2">
              {currentPage > 1 ? (
                <Link href={`/admin/kyc?page=${currentPage - 1}`}>
                  <Button variant="secondary" size="sm">Previous</Button>
                </Link>
              ) : (
                <span className={cn(buttonClassName({ variant: "secondary", size: "sm" }), "pointer-events-none opacity-60")}>
                  Previous
                </span>
              )}

              {uniquePageNumbers.map((pageNumber, index) => {
                const previousPage = uniquePageNumbers[index - 1];
                const showGap = previousPage && pageNumber - previousPage > 1;

                return (
                  <div key={pageNumber} className="flex items-center gap-2">
                    {showGap ? <span className="px-1 text-sm text-muted-foreground">...</span> : null}
                    <Link href={`/admin/kyc?page=${pageNumber}`}>
                      <span
                        className={buttonClassName({
                          variant: pageNumber === currentPage ? "primary" : "secondary",
                          size: "sm"
                        })}
                      >
                        {pageNumber}
                      </span>
                    </Link>
                  </div>
                );
              })}

              {currentPage < totalPages ? (
                <Link href={`/admin/kyc?page=${currentPage + 1}`}>
                  <Button variant="secondary" size="sm">Next</Button>
                </Link>
              ) : (
                <span className={cn(buttonClassName({ variant: "secondary", size: "sm" }), "pointer-events-none opacity-60")}>
                  Next
                </span>
              )}
            </div>
          ) : null}
        </div>
        <KycReviewTable submissions={submissions} currentPage={currentPage} />
      </CardContent>
    </Card>
  );
}
