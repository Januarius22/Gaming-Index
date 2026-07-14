import AccountShell from "@/components/account/AccountShell";
import { requireAccountProfile } from "@/lib/auth";
import { getAccountSidebarCounts, getActiveSiteAnnouncements, getProfileNotifications, getProfileSettings } from "@/lib/data";

export default async function AccountLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireAccountProfile();
  const [sidebarCounts, settings, notifications, announcements] = await Promise.all([
    getAccountSidebarCounts(profile),
    getProfileSettings(profile.id),
    getProfileNotifications(profile.id, 3),
    getActiveSiteAnnouncements("buyers")
  ]);

  return (
    <AccountShell
      profile={profile}
      sidebarCounts={sidebarCounts}
      settings={settings}
      notifications={notifications}
      announcements={announcements}
    >
      {children}
    </AccountShell>
  );
}
