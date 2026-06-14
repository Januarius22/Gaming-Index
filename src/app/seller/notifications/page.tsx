import NotificationList from "@/components/notifications/NotificationList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireSellerProfile } from "@/lib/auth";
import { getProfileNotifications } from "@/lib/data";

export default async function SellerNotificationsPage() {
  const profile = await requireSellerProfile();
  const notifications = await getProfileNotifications(profile.id, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Seller updates for sales, wallet movement, withdrawals, and account reviews.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NotificationList
          notifications={notifications}
          emptyMessage="No seller notifications yet."
        />
      </CardContent>
    </Card>
  );
}
