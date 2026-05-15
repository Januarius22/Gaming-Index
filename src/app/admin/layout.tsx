import AdminShell from "@/components/admin/AdminShell";
import { requireAdminProfile } from "@/lib/auth";

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireAdminProfile();

  return <AdminShell profile={profile}>{children}</AdminShell>;
}
