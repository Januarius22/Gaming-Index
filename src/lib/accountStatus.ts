import type { AccountStatus, Profile } from "@/types";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

const statusCopy: Record<AccountStatus, { label: string; variant: BadgeVariant }> = {
  active: { label: "Active", variant: "success" },
  under_review: { label: "Under review", variant: "warning" },
  limited: { label: "Limited", variant: "warning" },
  suspended: { label: "Suspended", variant: "danger" },
  deactivated: { label: "Deactivated", variant: "neutral" },
  pending_deletion: { label: "Pending deletion", variant: "warning" },
  deleted: { label: "Deleted", variant: "danger" }
};

export const editableAccountStatuses: Array<{
  value: AccountStatus;
  label: string;
}> = [
  { value: "active", label: "Active" },
  { value: "under_review", label: "Under review" },
  { value: "limited", label: "Limited" }
];

export function getEffectiveAccountStatus(
  profile: Pick<
    Profile,
    | "account_status"
    | "is_banned"
    | "is_deactivated"
    | "is_deleted"
    | "banned_reason"
    | "deactivation_reason"
    | "deleted_reason"
    | "account_status_reason"
  >
) {
  const status: AccountStatus = profile.is_deleted
    ? "deleted"
    : profile.is_deactivated
      ? "deactivated"
      : profile.is_banned
        ? "suspended"
        : profile.account_status ?? "active";

  const copy = statusCopy[status];
  const reason =
    status === "deleted"
      ? profile.deleted_reason
      : status === "deactivated"
        ? profile.deactivation_reason
        : status === "suspended"
          ? profile.banned_reason
          : profile.account_status_reason;

  return {
    status,
    label: copy.label,
    variant: copy.variant,
    reason: reason ?? ""
  };
}
