import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { changePasswordAction, updateAdminSettingsAction } from "@/actions/settings";
import WorkspaceSettingsForm, {
  type SettingsSection
} from "@/components/settings/WorkspaceSettingsForm";
import { requireAdminProfile } from "@/lib/auth";
import { getProfileSettings } from "@/lib/data";

const sections = ["profile", "appearance", "security", "notifications"] as const;

export default async function AdminSettingsSectionPage({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!sections.includes(section as Exclude<SettingsSection, "payout">)) {
    notFound();
  }

  const profile = await requireAdminProfile();
  const settings = await getProfileSettings(profile.id);

  return (
    <div className="space-y-5">
      <Link
        href="/admin/settings"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-dark"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to settings
      </Link>
      <WorkspaceSettingsForm
        action={updateAdminSettingsAction}
        passwordAction={changePasswordAction}
        profile={profile}
        section={section as SettingsSection}
        settings={settings}
        workspace="admin"
      />
    </div>
  );
}
