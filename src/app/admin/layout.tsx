import AdminShell from "@/components/admin/AdminShell";
import { requireAdminProfile } from "@/lib/auth";
import { getAdminSidebarCounts, getProfileNotifications, getProfileSettings } from "@/lib/data";

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireAdminProfile();
  const [sidebarCounts, settings, notifications] = await Promise.all([
    getAdminSidebarCounts(profile),
    getProfileSettings(profile.id),
    getProfileNotifications(profile.id, 3)
  ]);

  return (
    <AdminShell
      profile={profile}
      sidebarCounts={sidebarCounts}
      settings={settings}
      notifications={notifications}
    >
      {children}
    </AdminShell>
  );
}
