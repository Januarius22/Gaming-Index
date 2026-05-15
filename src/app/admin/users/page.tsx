import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { getAdminUsers } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          All platform users with role, seller access, and account posture at a glance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Created Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No users yet.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-border/60">
                    <td className="px-4 py-4 font-medium text-foreground">{user.full_name}</td>
                    <td className="px-4 py-4">@{user.username}</td>
                    <td className="px-4 py-4">{user.email}</td>
                    <td className="px-4 py-4 capitalize">{user.role}</td>
                    <td className="px-4 py-4">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-4">
                      <Badge variant={user.seller_enabled ? "info" : "neutral"}>
                        {user.seller_enabled ? "Seller enabled" : "Buyer account"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
