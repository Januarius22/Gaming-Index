"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccountProfile } from "@/lib/auth";
import {
  addCartListingId,
  removeCartListingId,
  removeSavedListingId,
  toggleCartListingId,
  toggleSavedListingId
} from "@/lib/buyerStore";
import { getMarketplaceListingById } from "@/lib/data";
import { updateDemoProfile } from "@/lib/demoStore";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import type { ActionState } from "@/types";

function getSafeReturnPath(value: string, fallback = "/account/marketplace") {
  return value.startsWith("/account/") ? value : fallback;
}

function getRedirectWithNotice(pathname: string, notice: string) {
  const searchParams = new URLSearchParams({ notice });
  return `${pathname}?${searchParams.toString()}`;
}

function revalidateBuyerWorkspace() {
  revalidatePath("/account/marketplace");
  revalidatePath("/account/saved");
  revalidatePath("/account/orders");
}

export async function unlockSellerAccessAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  void prevState;
  void formData;
  const profile = await requireAccountProfile();

  if (profile.seller_enabled) {
    redirect("/seller/dashboard");
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase!
      .from("profiles")
      .update({ seller_enabled: true })
      .eq("id", profile.id);

    if (error) {
      return {
        status: "error",
        message: error.message
      };
    }

    revalidatePath("/account/dashboard");
    revalidatePath("/account/seller");
    revalidatePath("/admin/users");
    revalidatePath("/admin/sellers");
    redirect("/seller/kyc");
  }

  await updateDemoProfile(profile.id, { seller_enabled: true });

  revalidatePath("/account/dashboard");
  revalidatePath("/account/seller");
  revalidatePath("/admin/users");
  revalidatePath("/admin/sellers");
  redirect("/seller/kyc");
}

export async function toggleSavedListingAction(formData: FormData) {
  await requireAccountProfile();
  const listingId = String(formData.get("listingId") ?? "").trim();
  const returnTo = getSafeReturnPath(String(formData.get("returnTo") ?? ""));

  if (!listingId || !(await getMarketplaceListingById(listingId))) {
    redirect(getRedirectWithNotice(returnTo, "listing-save-failed"));
  }

  const result = await toggleSavedListingId(listingId);

  revalidateBuyerWorkspace();

  redirect(
    getRedirectWithNotice(
      returnTo,
      result.saved ? "listing-saved" : "listing-unsaved"
    )
  );
}

export async function addToCartAction(formData: FormData) {
  await requireAccountProfile();
  const listingId = String(formData.get("listingId") ?? "").trim();
  const returnTo = getSafeReturnPath(String(formData.get("returnTo") ?? ""));

  if (!listingId || !(await getMarketplaceListingById(listingId))) {
    redirect(getRedirectWithNotice(returnTo, "cart-add-failed"));
  }

  const result = await toggleCartListingId(listingId);

  revalidateBuyerWorkspace();

  redirect(
    getRedirectWithNotice(returnTo, result.inCart ? "cart-added" : "cart-removed")
  );
}

export async function buyNowAction(formData: FormData) {
  await requireAccountProfile();
  const listingId = String(formData.get("listingId") ?? "").trim();

  if (!listingId || !(await getMarketplaceListingById(listingId))) {
    redirect("/account/orders?notice=checkout-failed");
  }

  await addCartListingId(listingId);

  revalidateBuyerWorkspace();

  redirect("/account/orders?notice=checkout-started");
}

export async function removeSavedListingAction(formData: FormData) {
  await requireAccountProfile();
  const listingId = String(formData.get("listingId") ?? "").trim();
  const returnTo = getSafeReturnPath(String(formData.get("returnTo") ?? ""), "/account/saved");

  if (!listingId) {
    redirect(getRedirectWithNotice(returnTo, "listing-remove-failed"));
  }

  await removeSavedListingId(listingId);

  revalidateBuyerWorkspace();

  redirect(getRedirectWithNotice(returnTo, "listing-unsaved"));
}

export async function removeCartListingAction(formData: FormData) {
  await requireAccountProfile();
  const listingId = String(formData.get("listingId") ?? "").trim();
  const returnTo = getSafeReturnPath(String(formData.get("returnTo") ?? ""), "/account/orders");

  if (!listingId) {
    redirect(getRedirectWithNotice(returnTo, "cart-remove-failed"));
  }

  await removeCartListingId(listingId);

  revalidateBuyerWorkspace();

  redirect(getRedirectWithNotice(returnTo, "cart-removed"));
}
