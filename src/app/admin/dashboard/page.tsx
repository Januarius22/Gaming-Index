import Link from "next/link";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import NotificationList from "@/components/notifications/NotificationList";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireAdminProfile } from "@/lib/auth";
import { getAdminDashboardStats, getProfileNotifications } from "@/lib/data";

export default async function AdminDashboardPage() {
  const profile = await requireAdminProfile();
  const [{ stats }, notifications] = await Promise.all([
    getAdminDashboardStats(),
    getProfileNotifications(profile.id, 10)
  ]);
  const dashboardNotifications = notifications
    .filter((notification) => {
      const searchable = `${notification.type} ${notification.title}`.toLowerCase();

      return !["resolved", "rejected", "refunded", "paid"].some((status) =>
        searchable.includes(status)
      );
    })
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <AdminStatsCards stats={stats} />
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Latest admin notifications for review work and marketplace flow.
            </CardDescription>
          </div>
          <Link
            href="/admin/notifications"
            className={buttonClassName({ variant: "secondary", size: "sm" })}
          >
            See more
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationList
            notifications={dashboardNotifications}
            emptyMessage="No admin notifications yet."
            compact
          />
        </CardContent>
      </Card>
    </div>
  );
}
