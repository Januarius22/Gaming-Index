import AccountShell from "@/components/account/AccountShell";
import { requireAccountProfile } from "@/lib/auth";

export default async function AccountLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireAccountProfile();

  return <AccountShell profile={profile}>{children}</AccountShell>;
}
