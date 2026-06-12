import AdminUsersTable from "@/components/admin/AdminUsersTable";
import FormMessage from "@/components/auth/FormMessage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getAdminUsers } from "@/lib/data";
import { paginateItems, parsePageParam } from "@/lib/utils";

function getUserNotice(notice?: string, error?: string) {
  switch (notice) {
    case "user-banned":
      return {
        message: "User banned successfully. Their listings are hidden until they are unbanned.",
        tone: "success" as const
      };
    case "user-unbanned":
      return {
        message: "User unbanned successfully. Their app access has been restored.",
        tone: "success" as const
      };
    case "user-ban-failed":
      return {
        message: error || "We could not update this user's ban status.",
        tone: "error" as const
      };
    default:
      return {
        message: "",
        tone: "success" as const
      };
  }
}

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string; notice?: string; error?: string }>;
}) {
  const users = await getAdminUsers();
  const params = (await searchParams) ?? {};
  const noticeState = getUserNotice(params.notice, params.error);
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedUsers,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(users, requestedPage, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          All platform users with role, seller access, and account posture at a glance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormMessage message={noticeState.message} tone={noticeState.tone} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} users
          </p>
          <PaginationControls
            pathname="/admin/users"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
        <AdminUsersTable
          users={paginatedUsers}
          returnTo={`/admin/users${currentPage > 1 ? `?page=${currentPage}` : ""}`}
        />
      </CardContent>
    </Card>
  );
}
