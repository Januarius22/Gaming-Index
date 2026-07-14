"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { closeSiteAnnouncementAction, createSiteAnnouncementAction } from "@/actions/admin";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { formatDate, titleCase } from "@/lib/utils";
import type { ActionState, SiteAnnouncement } from "@/types";

const initialState: ActionState = {
  status: "idle"
};

export default function AdminAnnouncementsPanel({
  announcements
}: {
  announcements: SiteAnnouncement[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, formAction] = useActionState(createSiteAnnouncementAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alerts and News</CardTitle>
          <CardDescription>
            Publish short updates across buyer and seller workspaces. Active updates appear as a marquee.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form ref={formRef} action={formAction} className="space-y-4 rounded-[24px] border border-border bg-surface p-4">
            <FormMessage
              message={state.message}
              tone={state.status === "success" ? "success" : "error"}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">Title</span>
                <Input name="title" placeholder="Marketplace update" required />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">Optional link</span>
                <Input name="linkPath" placeholder="/account/help" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">Audience</span>
                <Select name="audience" defaultValue="all">
                  <option value="all">Everyone</option>
                  <option value="buyers">Buyers</option>
                  <option value="sellers">Sellers</option>
                </Select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-foreground">Tone</span>
                <Select name="tone" defaultValue="info">
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Critical</option>
                </Select>
              </label>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Message</span>
              <Textarea name="message" rows={3} placeholder="Write a clear, short update." required />
            </label>
            <SubmitButton pendingLabel="Publishing..." className="w-full">
              Publish announcement
            </SubmitButton>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Announcement History</CardTitle>
          <CardDescription>Close an active update when it should stop showing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {announcements.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
              No announcements yet.
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="grid gap-4 rounded-[24px] border border-border bg-surface p-4 lg:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-lg font-semibold text-foreground">
                      {announcement.title}
                    </h2>
                    <Badge variant={announcement.is_active ? "success" : "neutral"}>
                      {announcement.is_active ? "Active" : "Closed"}
                    </Badge>
                    <Badge variant="info">{titleCase(announcement.audience)}</Badge>
                    <Badge variant={announcement.tone === "danger" ? "danger" : announcement.tone === "warning" ? "warning" : "neutral"}>
                      {titleCase(announcement.tone)}
                    </Badge>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{announcement.message}</p>
                  <p className="text-xs text-muted-foreground">
                    Published {formatDate(announcement.created_at)}
                    {announcement.closed_at ? ` - Closed ${formatDate(announcement.closed_at)}` : ""}
                  </p>
                </div>
                {announcement.is_active ? (
                  <CloseAnnouncementButton announcementId={announcement.id} />
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CloseAnnouncementButton({ announcementId }: { announcementId: string }) {
  const router = useRouter();
  const [state, formAction] = useActionState(closeSiteAnnouncementAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="flex flex-col items-start gap-2 lg:items-end">
      <input type="hidden" name="announcementId" value={announcementId} />
      <SubmitButton variant="secondary" pendingLabel="Closing...">
        Close
      </SubmitButton>
      <FormMessage
        message={state.status === "error" ? state.message : ""}
        tone="error"
      />
    </form>
  );
}
