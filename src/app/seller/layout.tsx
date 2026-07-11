import SellerShell from "@/components/seller/SellerShell";
import { requireSellerProfile } from "@/lib/auth";
import { getProfileNotifications, getProfileSettings, getSellerSidebarCounts } from "@/lib/data";

export default async function SellerLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireSellerProfile();
  const [sidebarCounts, settings, notifications] = await Promise.all([
    getSellerSidebarCounts(profile),
    getProfileSettings(profile.id),
    getProfileNotifications(profile.id, 3)
  ]);

  return (
    <SellerShell
      profile={profile}
      sidebarCounts={sidebarCounts}
      settings={settings}
      notifications={notifications}
    >
      {children}
    </SellerShell>
  );
}
