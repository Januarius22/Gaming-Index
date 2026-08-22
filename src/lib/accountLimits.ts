import type { Profile } from "@/types";

export const ACCOUNT_LIMITED_MESSAGE =
  "Your account is currently limited. This action is unavailable while our team reviews your account.";

export function isAccountLimited(profile: Pick<Profile, "account_status">) {
  return profile.account_status === "limited";
}

export function getAccountLimitedMessage(profile: Pick<Profile, "account_status_reason">) {
  return profile.account_status_reason
    ? `${ACCOUNT_LIMITED_MESSAGE} Reason: ${profile.account_status_reason}`
    : ACCOUNT_LIMITED_MESSAGE;
}

export function getAccountLimitedRedirect(pathname: string) {
  const [basePath, existingQuery = ""] = pathname.split("?");
  const searchParams = new URLSearchParams(existingQuery);
  searchParams.set("notice", "account-limited");
  return `${basePath}?${searchParams.toString()}`;
}
