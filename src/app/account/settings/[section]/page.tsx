import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { changePasswordAction, updateAccountSettingsAction } from "@/actions/settings";
import WorkspaceSettingsForm, {
  type SettingsSection
} from "@/components/settings/WorkspaceSettingsForm";
import { requireAccountProfile } from "@/lib/auth";
import { getCurrencyRates, getProfileSettings } from "@/lib/data";

const sections = ["profile", "currency", "appearance", "security", "notifications", "payout"] as const;

export default async function AccountSettingsSectionPage({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!sections.includes(section as SettingsSection)) {
    notFound();
  }

  const profile = await requireAccountProfile();
  const [settings, currencyRates] = await Promise.all([
    getProfileSettings(profile.id),
    getCurrencyRates()
  ]);

  return (
    <div className="space-y-5">
      <Link
        href="/account/settings"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to settings
      </Link>
      <WorkspaceSettingsForm
        action={updateAccountSettingsAction}
        passwordAction={changePasswordAction}
        currencyRates={currencyRates}
        profile={profile}
        section={section as SettingsSection}
        settings={settings}
        workspace="account"
      />
    </div>
  );
}
