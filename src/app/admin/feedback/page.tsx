import AdminFeedbackTable from "@/components/admin/AdminFeedbackTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getAdminFeedback } from "@/lib/data";
import { paginateItems, parsePageParam } from "@/lib/utils";

export default async function AdminFeedbackPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const requestedPage = parsePageParam(params.page);
  const feedback = await getAdminFeedback();
  const {
    items: paginatedFeedback,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(feedback, requestedPage, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback</CardTitle>
        <CardDescription>Review user thoughts, reports, and suggestions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} feedback
          </p>
          <PaginationControls
            pathname="/admin/feedback"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
        <AdminFeedbackTable feedback={paginatedFeedback} />
      </CardContent>
    </Card>
  );
}
