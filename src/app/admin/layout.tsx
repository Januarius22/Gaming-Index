import AdminShell from "@/components/admin/AdminShell";
import { requireAdminProfile } from "@/lib/auth";
import { getAdminSidebarCounts, getProfileSettings } from "@/lib/data";

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireAdminProfile();
  const [sidebarCounts, settings] = await Promise.all([
    getAdminSidebarCounts(profile),
    getProfileSettings(profile.id)
  ]);

  return (
    <AdminShell profile={profile} sidebarCounts={sidebarCounts} settings={settings}>
      {children}
    </AdminShell>
  );
}
