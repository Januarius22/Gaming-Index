import NotificationList from "@/components/notifications/NotificationList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireAdminProfile } from "@/lib/auth";
import { getProfileNotifications } from "@/lib/data";

export default async function AdminNotificationsPage() {
  const profile = await requireAdminProfile();
  const notifications = await getProfileNotifications(profile.id, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Admin alerts for reviews, withdrawals, sales, and marketplace operations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NotificationList
          notifications={notifications}
          emptyMessage="No admin notifications yet."
        />
      </CardContent>
    </Card>
  );
}
