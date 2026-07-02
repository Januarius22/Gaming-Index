import AccountShell from "@/components/account/AccountShell";
import { requireAccountProfile } from "@/lib/auth";
import { getAccountSidebarCounts } from "@/lib/data";

export default async function AccountLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireAccountProfile();
  const sidebarCounts = await getAccountSidebarCounts(profile);

  return <AccountShell profile={profile} sidebarCounts={sidebarCounts}>{children}</AccountShell>;
}
