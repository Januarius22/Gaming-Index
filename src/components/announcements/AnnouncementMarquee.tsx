import Link from "next/link";
import { AlertCircle, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteAnnouncement } from "@/types";

const toneClassNames: Record<SiteAnnouncement["tone"], string> = {
  info: "border-primary/20 bg-primary-soft text-primary-dark",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-rose-200 bg-rose-50 text-rose-800"
};

export default function AnnouncementMarquee({
  announcements
}: {
  announcements: SiteAnnouncement[];
}) {
  if (announcements.length === 0) {
    return null;
  }

  const marqueeItems = [...announcements, ...announcements];

  return (
    <div className="border-b border-border/70 bg-white px-4 py-3 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex min-w-max animate-[gi-marquee_32s_linear_infinite] items-center gap-3 py-2">
          {marqueeItems.map((announcement, index) => {
            const content = (
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
                  toneClassNames[announcement.tone]
                )}
              >
                {announcement.tone === "danger" ? (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <Megaphone className="h-4 w-4 shrink-0" />
                )}
                <span className="max-w-[72vw] truncate sm:max-w-none">
                  {announcement.title}: {announcement.message}
                </span>
              </span>
            );

            return announcement.link_path ? (
              <Link
                key={`${announcement.id}-${index}`}
                href={announcement.link_path}
                className="transition hover:opacity-80"
              >
                {content}
              </Link>
            ) : (
              <span key={`${announcement.id}-${index}`}>{content}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
