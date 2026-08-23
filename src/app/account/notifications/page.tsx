import NotificationInbox from "@/components/notifications/NotificationInbox";
import { requireAccountProfile } from "@/lib/auth";
import { getProfileNotifications, markProfileNotificationsRead } from "@/lib/data";

export default async function AccountNotificationsPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string; category?: string; filter?: string }>;
}) {
  const profile = await requireAccountProfile();
  const notifications = await getProfileNotifications(profile.id, 100);
  const params = (await searchParams) ?? {};
  await markProfileNotificationsRead(profile.id);

  return (
    <NotificationInbox
      notifications={notifications}
      title="Notifications"
      description="Order, refund, dispute, wallet, and account updates."
      pathname="/account/notifications"
      emptyMessage="No account notifications yet."
      searchParams={params}
    />
  );
}
