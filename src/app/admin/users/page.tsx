import AdminUsersTable from "@/components/admin/AdminUsersTable";
import FormMessage from "@/components/auth/FormMessage";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getEffectiveAccountStatus } from "@/lib/accountStatus";
import { getAdminUsers } from "@/lib/data";
import { paginateItems, parsePageParam } from "@/lib/utils";
import type { AccountStatus } from "@/types";

const statusFilters: Array<{ value: "all" | AccountStatus; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "under_review", label: "Under review" },
  { value: "limited", label: "Limited" },
  { value: "suspended", label: "Suspended" },
  { value: "deactivated", label: "Deactivated" },
  { value: "pending_deletion", label: "Pending deletion" },
  { value: "deleted", label: "Deleted" }
];

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
  searchParams?: Promise<{ page?: string; notice?: string; error?: string; status?: string }>;
}) {
  const users = await getAdminUsers();
  const params = (await searchParams) ?? {};
  const selectedStatus = statusFilters.some((filter) => filter.value === params.status)
    ? (params.status as "all" | AccountStatus)
    : "all";
  const filteredUsers =
    selectedStatus === "all"
      ? users
      : users.filter((user) => getEffectiveAccountStatus(user).status === selectedStatus);
  const noticeState = getUserNotice(params.notice, params.error);
  const requestedPage = parsePageParam(params.page);
  const {
    items: paginatedUsers,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(filteredUsers, requestedPage, 10);

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
        <form className="flex flex-col gap-3 rounded-[24px] border border-border bg-surface p-4 sm:flex-row sm:items-end">
          <label className="flex-1 space-y-2 text-sm font-semibold text-foreground">
            <span>Account status</span>
            <select
              name="status"
              defaultValue={selectedStatus}
              className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-ring"
            >
              {statusFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" className="sm:w-auto">
            Filter users
          </Button>
        </form>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} users
          </p>
          <PaginationControls
            pathname="/admin/users"
            query={{ status: selectedStatus !== "all" ? selectedStatus : undefined }}
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
