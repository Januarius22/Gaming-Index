import Link from "next/link";
import { notFound } from "next/navigation";
import { replyToSupportTicketAction } from "@/actions/support";
import AdminSupportControls from "@/components/support/AdminSupportControls";
import SupportReplyForm from "@/components/support/SupportReplyForm";
import SupportTicketThread from "@/components/support/SupportTicketThread";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireAdminProfile } from "@/lib/auth";
import { getSupportTicketDetail } from "@/lib/data";
import { formatDate, titleCase } from "@/lib/utils";

const statusVariant = {
  open: "warning",
  in_review: "info",
  resolved: "success",
  closed: "neutral"
} as const;

export default async function AdminSupportDetailPage({
  params
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const profile = await requireAdminProfile();
  const { ticketId } = await params;
  const ticketData = await getSupportTicketDetail(profile, ticketId, "admin");

  if (!ticketData) {
    notFound();
  }

  const closed = ticketData.ticket.status === "closed" || ticketData.ticket.status === "resolved";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Support request</p>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {ticketData.ticket.subject}
          </h1>
        </div>
        <Link href="/admin/support">
          <Button variant="secondary">Back to support</Button>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.36fr)]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant[ticketData.ticket.status]}>{titleCase(ticketData.ticket.status)}</Badge>
              <Badge variant="neutral">{titleCase(ticketData.ticket.category)}</Badge>
              <Badge variant={ticketData.ticket.workspace === "seller" ? "info" : "neutral"}>
                {titleCase(ticketData.ticket.workspace)}
              </Badge>
            </div>
            <CardDescription>Opened {formatDate(ticketData.ticket.created_at)}</CardDescription>
          </CardHeader>
          <CardContent>
            <SupportTicketThread messages={ticketData.messages} currentUserId={profile.id} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Requester</CardTitle>
              <CardDescription>{ticketData.ticket.profile_email}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">
              <p className="font-semibold text-foreground">{ticketData.ticket.profile_name ?? "User"}</p>
              <p>@{ticketData.ticket.profile_username ?? "user"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Update request handling state.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminSupportControls
                ticketId={ticketData.ticket.id}
                requesterId={ticketData.ticket.profile_id}
                workspace={ticketData.ticket.workspace}
                status={ticketData.ticket.status}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {closed ? (
        <p className="rounded-[22px] border border-border bg-surface p-5 text-sm text-muted-foreground">
          This support request is closed.
        </p>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Reply</CardTitle>
            <CardDescription>Send an update to the requester.</CardDescription>
          </CardHeader>
          <CardContent>
            <SupportReplyForm
              ticketId={ticketData.ticket.id}
              action={replyToSupportTicketAction}
              hiddenFields={{
                requesterId: ticketData.ticket.profile_id,
                workspace: ticketData.ticket.workspace
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
