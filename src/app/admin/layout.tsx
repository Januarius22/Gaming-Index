import AdminShell from "@/components/admin/AdminShell";
import { requireAdminProfile } from "@/lib/auth";
import { getAdminSidebarCounts } from "@/lib/data";

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireAdminProfile();
  const sidebarCounts = await getAdminSidebarCounts(profile);

  return <AdminShell profile={profile} sidebarCounts={sidebarCounts}>{children}</AdminShell>;
}
