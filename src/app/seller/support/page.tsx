import Link from "next/link";
import { submitSellerSupportTicketAction } from "@/actions/support";
import SupportTicketForm from "@/components/support/SupportTicketForm";
import Badge from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import PaginationControls from "@/components/ui/PaginationControls";
import { requireSellerProfile } from "@/lib/auth";
import { getProfileSupportTickets } from "@/lib/data";
import { formatDate, paginateItems, parsePageParam, titleCase } from "@/lib/utils";

const statusVariant = {
  open: "warning",
  in_review: "info",
  resolved: "success",
  closed: "neutral"
} as const;

export default async function SellerSupportPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const profile = await requireSellerProfile();
  const params = (await searchParams) ?? {};
  const tickets = await getProfileSupportTickets(profile.id);
  const {
    items: paginatedTickets,
    currentPage,
    totalPages,
    totalCount,
    pageStart,
    pageEnd
  } = paginateItems(tickets, parsePageParam(params.page), 5);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Support</CardTitle>
          <CardDescription>Get help with seller tools, orders, KYC, and withdrawals.</CardDescription>
        </CardHeader>
        <CardContent>
          <SupportTicketForm action={submitSellerSupportTicketAction} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your requests</CardTitle>
          <CardDescription>Recent support conversations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tickets.length === 0 ? (
            <p className="rounded-[22px] bg-surface p-5 text-sm text-muted-foreground">
              No support requests yet.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {pageStart}-{pageEnd} of {totalCount}
                </p>
                <PaginationControls
                  pathname="/seller/support"
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              </div>
              {paginatedTickets.map((ticket) => (
                <div key={ticket.id} className="rounded-[22px] bg-surface p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant[ticket.status]}>{titleCase(ticket.status)}</Badge>
                    <Badge variant="neutral">{titleCase(ticket.category)}</Badge>
                  </div>
                  <p className="mt-3 font-semibold text-foreground">{ticket.subject}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(ticket.last_message_at)}
                  </p>
                  <Link
                    href={`/seller/support/${ticket.id}`}
                    className={buttonClassName({
                      variant: "secondary",
                      size: "sm",
                      className: "mt-3"
                    })}
                  >
                    Open request
                  </Link>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
