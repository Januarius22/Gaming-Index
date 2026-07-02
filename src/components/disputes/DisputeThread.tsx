"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, CheckCheck, CircleAlert, ImageIcon, LoaderCircle, Video } from "lucide-react";
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
  const [visibleMessages, setVisibleMessages] = useState(messages);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [visibleMessages.length]);

  useEffect(() => {
    setVisibleMessages(messages);
  }, [messages]);

  useEffect(() => {
    const addPendingMessage = (event: Event) => {
      const message = (event as CustomEvent<DisputeMessage>).detail;

      setVisibleMessages((currentMessages) => [...currentMessages, message]);
    };

    const markSent = (event: Event) => {
      const { id } = (event as CustomEvent<{ id: string }>).detail;

      setVisibleMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === id ? { ...message, delivery_status: "sent" } : message
        )
      );
    };

    const markFailed = (event: Event) => {
      const { id } = (event as CustomEvent<{ id: string }>).detail;

      setVisibleMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === id ? { ...message, delivery_status: "failed" } : message
        )
      );
    };

    window.addEventListener("dispute-message:pending", addPendingMessage);
    window.addEventListener("dispute-message:sent", markSent);
    window.addEventListener("dispute-message:failed", markFailed);

    return () => {
      window.removeEventListener("dispute-message:pending", addPendingMessage);
      window.removeEventListener("dispute-message:sent", markSent);
      window.removeEventListener("dispute-message:failed", markFailed);
    };
  }, []);

  if (visibleMessages.length === 0) {
    return (
      <div className="relative isolate overflow-hidden rounded-3xl border border-border bg-white p-8 text-center text-sm text-muted-foreground">
        <ChatWatermark />
        <span className="relative z-10">No messages yet.</span>
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-[24rem] space-y-4 overflow-x-hidden rounded-3xl px-1 py-3 sm:px-3">
      <ChatWatermark />
      {visibleMessages.map((message) => {
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
                "min-w-0 max-w-[min(34rem,92%)] overflow-hidden rounded-3xl border p-4 shadow-sm",
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
              <div
                className={cn(
                  "mt-1 flex items-center gap-1.5 text-xs",
                  mine ? "text-white/75" : "text-muted-foreground"
                )}
              >
                <span>{formatDate(message.created_at)}</span>
                {mine ? <DeliveryReceipt message={message} mine={mine} /> : null}
              </div>

              {message.message ? (
                <p className={cn("mt-3 whitespace-pre-line leading-7", mine ? "text-white" : "text-muted-foreground")}>
                  {message.message}
                </p>
              ) : null}

              {message.attachments && message.attachments.length > 0 ? (
                <div className="mt-4 grid min-w-0 gap-2 overflow-hidden">
                  {message.attachments.map((attachment) => (
                    <Link
                      key={attachment.id}
                      href={attachment.file_url ?? "#"}
                      target="_blank"
                      className={cn(
                        "flex min-w-0 max-w-full items-center gap-3 overflow-hidden rounded-2xl border p-3 text-sm font-semibold transition",
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
                      <span className="block min-w-0 flex-1 truncate">
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

function DeliveryReceipt({ message, mine }: { message: DisputeMessage; mine: boolean }) {
  if (!mine) {
    return null;
  }

  if (message.delivery_status === "sending") {
    return <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-label="Sending" />;
  }

  if (message.delivery_status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-white/85" aria-label="Message failed">
        <CircleAlert className="h-3.5 w-3.5" />
        Failed
      </span>
    );
  }

  if ((message.read_count ?? 0) > 0) {
    return <CheckCheck className="h-3.5 w-3.5" aria-label="Seen" />;
  }

  return <Check className="h-3.5 w-3.5" aria-label="Sent" />;
}

function ChatWatermark() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
      <BrandMark className="h-44 w-44 opacity-[0.035] grayscale sm:h-60 sm:w-60" />
    </div>
  );
}
