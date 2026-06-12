import { NextResponse } from "next/server";
import { canUploadAccounts, getCurrentProfile } from "@/lib/auth";
import { saveListingSubmission } from "@/actions/seller";

function buildRedirectUrl(request: Request, pathname: string, params?: Record<string, string>) {
  const url = new URL(pathname, request.url);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

function redirectTo(request: Request, pathname: string, params?: Record<string, string>) {
  return NextResponse.redirect(buildRedirectUrl(request, pathname, params), {
    status: 303
  });
}

export async function POST(request: Request) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return redirectTo(request, "/auth/login");
  }

  if (profile.role === "admin") {
    return redirectTo(request, "/admin/dashboard");
  }

  if (profile.is_banned) {
    return redirectTo(request, "/account-suspended");
  }

  if (!profile.seller_enabled) {
    return redirectTo(request, "/account/seller");
  }

  if (!canUploadAccounts(profile.kyc_status)) {
    return redirectTo(request, "/seller/upload");
  }

  const formData = await request.formData();
  const result = await saveListingSubmission({ seller: profile, formData });

  if (result.status === "error") {
    return redirectTo(request, "/seller/upload", {
      error: result.message ?? "Unable to publish listing right now."
    });
  }

  return redirectTo(request, "/seller/listings", {
    listing: "published"
  });
}
