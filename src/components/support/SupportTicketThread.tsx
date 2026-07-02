import { cn, formatDate } from "@/lib/utils";
import type { SupportTicketMessage } from "@/types";

export default function SupportTicketThread({
  messages,
  currentUserId
}: {
  messages: SupportTicketMessage[];
  currentUserId: string;
}) {
  if (messages.length === 0) {
    return (
      <p className="rounded-[22px] bg-surface p-5 text-sm text-muted-foreground">
        No messages yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const mine = message.sender_id === currentUserId;

        return (
          <article
            key={message.id}
            className={cn("flex", mine ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[min(38rem,92%)] rounded-3xl border p-4 shadow-sm",
                mine
                  ? "border-primary/20 bg-primary text-white"
                  : "border-border bg-surface text-foreground"
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{mine ? "You" : message.sender_name}</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    mine ? "bg-white/15 text-white" : "bg-white text-muted-foreground"
                  )}
                >
                  {message.sender_role === "admin" ? "Support" : "User"}
                </span>
              </div>
              <p className={cn("mt-1 text-xs", mine ? "text-white/75" : "text-muted-foreground")}>
                {formatDate(message.created_at)}
              </p>
              <p className={cn("mt-3 whitespace-pre-line leading-7", mine ? "text-white" : "text-muted-foreground")}>
                {message.message}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
