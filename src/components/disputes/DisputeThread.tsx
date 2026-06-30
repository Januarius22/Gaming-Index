import Link from "next/link";
import { ImageIcon, Video } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { DisputeMessage } from "@/types";

const roleLabel = {
  buyer: "Buyer",
  seller: "Seller",
  admin: "Admin"
} as const;

const roleVariant = {
  buyer: "info",
  seller: "neutral",
  admin: "success"
} as const;

export default function DisputeThread({ messages }: { messages: DisputeMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="rounded-3xl border border-border bg-white p-8 text-center text-sm text-muted-foreground">
        No messages yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <article key={message.id} className="rounded-3xl border border-border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{message.sender_name}</p>
                <Badge variant={roleVariant[message.sender_role]}>{roleLabel[message.sender_role]}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(message.created_at)}</p>
            </div>
          </div>

          {message.message ? (
            <p className="mt-4 whitespace-pre-line leading-7 text-muted-foreground">{message.message}</p>
          ) : null}

          {message.attachments && message.attachments.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {message.attachments.map((attachment) => (
                <Link
                  key={attachment.id}
                  href={attachment.file_url ?? "#"}
                  target="_blank"
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-sm font-semibold text-foreground transition hover:bg-primary-soft"
                >
                  {attachment.file_type === "video" ? (
                    <Video className="h-5 w-5 text-primary" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-primary" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{attachment.file_name || "Evidence"}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
