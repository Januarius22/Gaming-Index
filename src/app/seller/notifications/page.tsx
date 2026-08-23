import NotificationInbox from "@/components/notifications/NotificationInbox";
import { requireSellerProfile } from "@/lib/auth";
import { getProfileNotifications, markProfileNotificationsRead } from "@/lib/data";

export default async function SellerNotificationsPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string; category?: string; filter?: string }>;
}) {
  const profile = await requireSellerProfile();
  const notifications = await getProfileNotifications(profile.id, 100);
  const params = (await searchParams) ?? {};
  await markProfileNotificationsRead(profile.id);

  return (
    <NotificationInbox
      notifications={notifications}
      title="Notifications"
      description="Sales, wallet movement, withdrawals, disputes, and account reviews."
      pathname="/seller/notifications"
      emptyMessage="No seller notifications yet."
      searchParams={params}
    />
  );
}
