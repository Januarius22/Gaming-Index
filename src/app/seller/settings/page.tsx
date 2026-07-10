import SettingsHub from "@/components/settings/SettingsHub";
import { requireSellerProfile } from "@/lib/auth";
import { getProfileSettings } from "@/lib/data";

export default async function SellerSettingsPage() {
  const profile = await requireSellerProfile();
  const settings = await getProfileSettings(profile.id);

  return <SettingsHub settings={settings} workspace="seller" />;
}
