import SellerShell from "@/components/seller/SellerShell";
import { requireSellerProfile } from "@/lib/auth";
import { getSellerSidebarCounts } from "@/lib/data";

export default async function SellerLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireSellerProfile();
  const sidebarCounts = await getSellerSidebarCounts(profile);

  return <SellerShell profile={profile} sidebarCounts={sidebarCounts}>{children}</SellerShell>;
}
