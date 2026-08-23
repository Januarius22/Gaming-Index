import { CheckCircle2, Eye, FileImage, LockKeyhole, MessageSquare, ShieldAlert, UserRound } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { cn, formatCurrency, formatDate, titleCase } from "@/lib/utils";
import type { Dispute, DisputeMessage, Order } from "@/types";

const statusVariant = {
  pending_admin_review: "warning",
  awaiting_seller_response: "info",
  under_investigation: "warning",
  resolved: "success",
  rejected: "neutral",
  refunded: "success",
  open: "danger",
  reviewing: "warning"
} as const;

const timelineSteps = [
  { status: "pending_admin_review", label: "Admin review", icon: Eye },
  { status: "awaiting_seller_response", label: "Seller response", icon: UserRound },
  { status: "under_investigation", label: "Investigation", icon: ShieldAlert },
  { status: "resolved", label: "Decision", icon: CheckCircle2 }
] as const;

function getTimelineState(dispute: Dispute, stepStatus: (typeof timelineSteps)[number]["status"]) {
  if (dispute.status === "rejected" || dispute.status === "refunded" || dispute.status === "resolved") {
    return stepStatus === "resolved" ? "active" : "complete";
  }

  const activeIndex = timelineSteps.findIndex((step) => step.status === dispute.status);
  const stepIndex = timelineSteps.findIndex((step) => step.status === stepStatus);

  if (activeIndex === -1) {
    return stepIndex === 0 ? "active" : "pending";
  }

  if (stepIndex < activeIndex) {
    return "complete";
  }

  return stepIndex === activeIndex ? "active" : "pending";
}

function countEvidence(messages: DisputeMessage[]) {
  return messages.reduce((sum, message) => sum + (message.attachments?.length ?? 0), 0);
}

export default function DisputeCaseRoom({
  dispute,
  order,
  messages,
  role
}: {
  dispute: Dispute;
  order?: Order | null;
  messages: DisputeMessage[];
  role: "buyer" | "seller" | "admin";
}) {
  const evidenceCount = countEvidence(messages);
  const locked = Boolean(dispute.locked_at);

  return (
    <Card className="border-border/70">
      <CardContent className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Case room
            </p>
            <h2 className="mt-2 break-words font-heading text-2xl font-semibold text-foreground">
              {dispute.listing_title || "Order case"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {role === "admin"
                ? "Review evidence, decide next steps, and keep the case record complete."
                : role === "seller"
                  ? "Respond only to the case details Gaming Index has escalated to you."
                  : "Gaming Index reviews your case first and involves the seller only when needed."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant[dispute.status]}>{titleCase(dispute.status)}</Badge>
            {locked ? (
              <Badge variant="neutral" className="gap-1">
                <LockKeyhole className="h-3.5 w-3.5" />
                Locked
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl bg-surface p-4">
            <p className="text-sm text-muted-foreground">Order value</p>
            <p className="mt-2 font-heading text-2xl font-semibold text-foreground">
              {order ? formatCurrency(order.amount) : "Pending"}
            </p>
          </div>
          <div className="rounded-3xl bg-surface p-4">
            <p className="text-sm text-muted-foreground">Evidence files</p>
            <p className="mt-2 font-heading text-2xl font-semibold text-foreground">
              {evidenceCount}
            </p>
          </div>
          <div className="rounded-3xl bg-surface p-4">
            <p className="text-sm text-muted-foreground">Opened</p>
            <p className="mt-2 font-semibold text-foreground">{formatDate(dispute.created_at)}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          {timelineSteps.map((step) => {
            const Icon = step.icon;
            const state = getTimelineState(dispute, step.status);

            return (
              <div
                key={step.status}
                className={cn(
                  "rounded-2xl border p-4",
                  state === "complete" && "border-primary/20 bg-primary-soft/70",
                  state === "active" && "border-primary/40 bg-white shadow-[0_16px_40px_-28px_rgba(0,87,255,0.5)]",
                  state === "pending" && "border-border bg-surface/70"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-2xl",
                    state === "pending" ? "bg-white text-muted-foreground" : "bg-primary text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">{step.label}</p>
                <p className="mt-1 text-xs capitalize text-muted-foreground">{state}</p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <PartyCard label="Buyer" name={dispute.buyer_name || "Buyer"} detail={dispute.buyer_email || ""} />
          <PartyCard
            label="Seller"
            name={dispute.seller_name || "Seller"}
            detail={dispute.seller_username ? `@${dispute.seller_username}` : ""}
            muted={!dispute.seller_visible && role !== "admin"}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MessageSquare className="h-4 w-4 text-primary" />
              Case description
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{dispute.details}</p>
          </div>
          <div className="rounded-3xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileImage className="h-4 w-4 text-primary" />
              Evidence policy
            </div>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Evidence stays attached to the case record. Admin can lock the discussion once enough information is available.
            </p>
          </div>
        </div>

        {dispute.resolution ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-800">
            <p className="font-semibold">Resolution</p>
            <p className="mt-1">{dispute.resolution}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function PartyCard({
  label,
  name,
  detail,
  muted = false
}: {
  label: string;
  name: string;
  detail: string;
  muted?: boolean;
}) {
  return (
    <div className={cn("rounded-3xl bg-surface p-4", muted && "opacity-70")}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 break-words font-semibold text-foreground">
        {muted ? "Not invited yet" : name}
      </p>
      {detail && !muted ? (
        <p className="mt-1 break-all text-sm text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}
