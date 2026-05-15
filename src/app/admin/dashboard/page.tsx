import AdminStatsCards from "@/components/admin/AdminStatsCards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getAdminDashboardStats } from "@/lib/data";

export default async function AdminDashboardPage() {
  const { stats, activity } = await getAdminDashboardStats();

  return (
    <div className="space-y-6">
      <AdminStatsCards stats={stats} />
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Operational signals for onboarding, review work, and marketplace flow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activity.map((item) => (
            <div key={item.id} className="rounded-3xl bg-surface p-5">
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
