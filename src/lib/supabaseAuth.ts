type SupabaseAuthErrorLike = {
  __isAuthError?: boolean;
  code?: string;
  message?: string;
  status?: number;
};

export function isSupabaseAuthCookieName(name: string) {
  return name.startsWith("sb-") && name.includes("auth-token");
}

export function isInvalidRefreshTokenError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const authError = error as SupabaseAuthErrorLike;
  const message = typeof authError.message === "string" ? authError.message.toLowerCase() : "";

  return (
    authError.code === "refresh_token_not_found" ||
    message.includes("invalid refresh token") ||
    message.includes("refresh token not found")
  );
}

export function isMissingAuthSessionError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const authError = error as SupabaseAuthErrorLike;
  const message = typeof authError.message === "string" ? authError.message.toLowerCase() : "";

  return message.includes("auth session missing");
}

export function isRecoverableAuthSessionError(error: unknown) {
  return isInvalidRefreshTokenError(error) || isMissingAuthSessionError(error);
}
