import AccountShell from "@/components/account/AccountShell";
import { requireAccountProfile } from "@/lib/auth";
import { getAccountSidebarCounts, getProfileSettings } from "@/lib/data";

export default async function AccountLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireAccountProfile();
  const [sidebarCounts, settings] = await Promise.all([
    getAccountSidebarCounts(profile),
    getProfileSettings(profile.id)
  ]);

  return (
    <AccountShell profile={profile} sidebarCounts={sidebarCounts} settings={settings}>
      {children}
    </AccountShell>
  );
}
