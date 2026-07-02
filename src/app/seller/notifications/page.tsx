import NotificationList from "@/components/notifications/NotificationList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { requireSellerProfile } from "@/lib/auth";
import { getProfileNotifications, markProfileNotificationsRead } from "@/lib/data";
import { paginateItems, parsePageParam } from "@/lib/utils";

export default async function SellerNotificationsPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const profile = await requireSellerProfile();
  const notifications = await getProfileNotifications(profile.id, 100);
  await markProfileNotificationsRead(profile.id);
  const params = (await searchParams) ?? {};
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedNotifications,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(notifications, requestedPage, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Seller updates for sales, wallet movement, withdrawals, and account reviews.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} notifications
          </p>
          <PaginationControls
            pathname="/seller/notifications"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
        <NotificationList
          notifications={paginatedNotifications}
          emptyMessage="No seller notifications yet."
        />
      </CardContent>
    </Card>
  );
}
