import SettingsHub from "@/components/settings/SettingsHub";
import { requireAdminProfile } from "@/lib/auth";
import { getProfileSettings } from "@/lib/data";

export default async function AdminSettingsPage() {
  const profile = await requireAdminProfile();
  const settings = await getProfileSettings(profile.id);

  return <SettingsHub settings={settings} workspace="admin" />;
}
