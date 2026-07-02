import Link from "next/link";
import { notFound } from "next/navigation";
import { replyToSellerSupportTicketAction } from "@/actions/support";
import SupportReplyForm from "@/components/support/SupportReplyForm";
import SupportTicketThread from "@/components/support/SupportTicketThread";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireSellerProfile } from "@/lib/auth";
import { getSupportTicketDetail } from "@/lib/data";
import { formatDate, titleCase } from "@/lib/utils";

const statusVariant = {
  open: "warning",
  in_review: "info",
  resolved: "success",
  closed: "neutral"
} as const;

export default async function SellerSupportDetailPage({
  params
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const profile = await requireSellerProfile();
  const { ticketId } = await params;
  const ticketData = await getSupportTicketDetail(profile, ticketId, "user");

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
        <Link href="/seller/support">
          <Button variant="secondary">Back to support</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant[ticketData.ticket.status]}>{titleCase(ticketData.ticket.status)}</Badge>
            <Badge variant="neutral">{titleCase(ticketData.ticket.category)}</Badge>
          </div>
          <CardDescription>Opened {formatDate(ticketData.ticket.created_at)}</CardDescription>
        </CardHeader>
        <CardContent>
          <SupportTicketThread messages={ticketData.messages} currentUserId={profile.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reply</CardTitle>
          <CardDescription>{closed ? "This request is closed." : "Continue the conversation with support."}</CardDescription>
        </CardHeader>
        <CardContent>
          <SupportReplyForm
            ticketId={ticketData.ticket.id}
            action={replyToSellerSupportTicketAction}
            disabled={closed}
          />
        </CardContent>
      </Card>
    </div>
  );
}
