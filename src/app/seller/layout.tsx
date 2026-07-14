import SellerShell from "@/components/seller/SellerShell";
import { requireSellerProfile } from "@/lib/auth";
import { getActiveSiteAnnouncements, getProfileNotifications, getProfileSettings, getSellerSidebarCounts } from "@/lib/data";

export default async function SellerLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireSellerProfile();
  const [sidebarCounts, settings, notifications, announcements] = await Promise.all([
    getSellerSidebarCounts(profile),
    getProfileSettings(profile.id),
    getProfileNotifications(profile.id, 3),
    getActiveSiteAnnouncements("sellers")
  ]);

  return (
    <SellerShell
      profile={profile}
      sidebarCounts={sidebarCounts}
      settings={settings}
      notifications={notifications}
      announcements={announcements}
    >
      {children}
    </SellerShell>
  );
}
