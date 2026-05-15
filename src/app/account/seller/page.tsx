import SellerAccessPanel from "@/components/account/SellerAccessPanel";
import { requireAccountProfile } from "@/lib/auth";

export default async function AccountSellerPage() {
  const profile = await requireAccountProfile();

  return <SellerAccessPanel profile={profile} />;
}
