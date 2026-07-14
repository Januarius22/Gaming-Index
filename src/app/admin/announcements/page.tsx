import AdminAnnouncementsPanel from "@/components/admin/AdminAnnouncementsPanel";
import { getSiteAnnouncements } from "@/lib/data";

export default async function AdminAnnouncementsPage() {
  const announcements = await getSiteAnnouncements({ includeInactive: true });

  return <AdminAnnouncementsPanel announcements={announcements} />;
}
