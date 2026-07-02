import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { getAdminSupportTickets } from "@/lib/data";
import { formatDate, paginateItems, parsePageParam, titleCase } from "@/lib/utils";

const statusVariant = {
  open: "warning",
  in_review: "info",
  resolved: "success",
  closed: "neutral"
} as const;

export default async function AdminSupportPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const tickets = await getAdminSupportTickets();
  const {
    items: paginatedTickets,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(tickets, parsePageParam(params.page), 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support</CardTitle>
        <CardDescription>Review and respond to customer support requests.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pageStart}-{pageEnd} of {totalCount} requests
          </p>
          <PaginationControls
            pathname="/admin/support"
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No support requests yet.
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-border/60 align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">{ticket.profile_name ?? "User"}</div>
                      <div className="text-xs text-muted-foreground">
                        @{ticket.profile_username ?? "user"} - {ticket.profile_email ?? ""}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-foreground">{ticket.subject}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="neutral">{titleCase(ticket.category)}</Badge>
                        <Badge variant={ticket.workspace === "seller" ? "info" : "neutral"}>
                          {titleCase(ticket.workspace)}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant[ticket.status]}>{titleCase(ticket.status)}</Badge>
                    </td>
                    <td className="px-4 py-4">{formatDate(ticket.last_message_at)}</td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/support/${ticket.id}`}
                        className={buttonClassName({ variant: "secondary", size: "sm" })}
                      >
                        Open request
                      </Link>
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
