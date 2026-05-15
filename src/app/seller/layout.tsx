import SellerShell from "@/components/seller/SellerShell";
import { requireSellerProfile } from "@/lib/auth";

export default async function SellerLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireSellerProfile();

  return <SellerShell profile={profile}>{children}</SellerShell>;
}
