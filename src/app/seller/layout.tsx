import SellerShell from "@/components/seller/SellerShell";
import { requireSellerProfile } from "@/lib/auth";
import { getProfileSettings, getSellerSidebarCounts } from "@/lib/data";

export default async function SellerLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireSellerProfile();
  const [sidebarCounts, settings] = await Promise.all([
    getSellerSidebarCounts(profile),
    getProfileSettings(profile.id)
  ]);

  return (
    <SellerShell profile={profile} sidebarCounts={sidebarCounts} settings={settings}>
      {children}
    </SellerShell>
  );
}
