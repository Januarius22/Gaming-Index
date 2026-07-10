import SettingsHub from "@/components/settings/SettingsHub";
import { requireAccountProfile } from "@/lib/auth";
import { getProfileSettings } from "@/lib/data";

export default async function AccountSettingsPage() {
  const profile = await requireAccountProfile();
  const settings = await getProfileSettings(profile.id);

  return <SettingsHub settings={settings} workspace="account" />;
}
