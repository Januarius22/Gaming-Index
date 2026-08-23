import NotificationInbox from "@/components/notifications/NotificationInbox";
import { requireAdminProfile } from "@/lib/auth";
import { getProfileNotifications, markProfileNotificationsRead } from "@/lib/data";

export default async function AdminNotificationsPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string; category?: string; filter?: string }>;
}) {
  const profile = await requireAdminProfile();
  const notifications = await getProfileNotifications(profile.id, 100);
  const params = (await searchParams) ?? {};
  await markProfileNotificationsRead(profile.id);

  return (
    <NotificationInbox
      notifications={notifications}
      title="Notifications"
      description="Reviews, withdrawals, disputes, sales, and marketplace operations."
      pathname="/admin/notifications"
      emptyMessage="No admin notifications yet."
      searchParams={params}
    />
  );
}
