"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ImageIcon, Video } from "lucide-react";
import { BrandMark } from "@/components/branding/BrandLogo";
import Badge from "@/components/ui/Badge";
import { cn, formatDate } from "@/lib/utils";
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

export default function DisputeThread({
  messages,
  currentUserId
}: {
  messages: DisputeMessage[];
  currentUserId: string;
}) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="relative isolate overflow-hidden rounded-3xl border border-border bg-white p-8 text-center text-sm text-muted-foreground">
        <ChatWatermark />
        <span className="relative z-10">No messages yet.</span>
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-[24rem] space-y-4 overflow-hidden rounded-3xl px-1 py-3 sm:px-3">
      <ChatWatermark />
      {messages.map((message) => {
        const mine = message.sender_id === currentUserId;
        const admin = message.sender_role === "admin";

        return (
          <article
            key={message.id}
            className={cn(
              "relative z-10 flex w-full",
              mine ? "justify-end" : admin ? "justify-center" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[min(34rem,92%)] rounded-3xl border p-4 shadow-sm",
                mine
                  ? "border-primary/20 bg-primary text-white"
                  : admin
                    ? "border-emerald-100 bg-emerald-50"
                    : "border-border bg-white"
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className={cn("font-semibold", mine ? "text-white" : "text-foreground")}>
                  {mine ? "You" : message.sender_name}
                </p>
                <Badge variant={roleVariant[message.sender_role]}>
                  {roleLabel[message.sender_role]}
                </Badge>
              </div>
              <p className={cn("mt-1 text-xs", mine ? "text-white/75" : "text-muted-foreground")}>
                {formatDate(message.created_at)}
              </p>

              {message.message ? (
                <p className={cn("mt-3 whitespace-pre-line leading-7", mine ? "text-white" : "text-muted-foreground")}>
                  {message.message}
                </p>
              ) : null}

              {message.attachments && message.attachments.length > 0 ? (
                <div className="mt-4 grid gap-2">
                  {message.attachments.map((attachment) => (
                    <Link
                      key={attachment.id}
                      href={attachment.file_url ?? "#"}
                      target="_blank"
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border p-3 text-sm font-semibold transition",
                        mine
                          ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
                          : "border-border bg-surface text-foreground hover:bg-primary-soft"
                      )}
                    >
                      {attachment.file_type === "video" ? (
                        <Video className={cn("h-5 w-5 shrink-0", mine ? "text-white" : "text-primary")} />
                      ) : (
                        <ImageIcon className={cn("h-5 w-5 shrink-0", mine ? "text-white" : "text-primary")} />
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {attachment.file_name || "Evidence"}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}

function ChatWatermark() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
      <BrandMark className="h-44 w-44 opacity-[0.035] grayscale sm:h-60 sm:w-60" />
    </div>
  );
}
