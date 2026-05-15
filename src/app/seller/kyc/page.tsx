import SellerKycPanel from "@/components/seller/SellerKycPanel";
import { requireSellerProfile } from "@/lib/auth";

export default async function SellerKycPage() {
  const profile = await requireSellerProfile();

  return <SellerKycPanel profile={profile} />;
}
