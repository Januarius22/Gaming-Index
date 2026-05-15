"use server";

import { revalidatePath } from "next/cache";
import { requireSellerProfile } from "@/lib/auth";
import { addDemoKycSubmission, addDemoListing } from "@/lib/demoStore";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import type { KycActionState, ListingActionState } from "@/types";

export async function submitKycAction(
  _prevState: KycActionState,
  formData: FormData
): Promise<KycActionState> {
  const seller = await requireSellerProfile();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const documentType = String(formData.get("documentType") ?? "").trim();
  const documentNumber = String(formData.get("documentNumber") ?? "").trim();

  if (!fullName || !documentType || !documentNumber) {
    return {
      status: "error",
      message: "Please complete all KYC fields."
    };
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { error: submissionError } = await supabase!.from("kyc_submissions").insert({
      seller_id: seller.id,
      full_name: fullName,
      document_type: documentType,
      document_number: documentNumber,
      status: "pending"
    });

    if (submissionError) {
      return {
        status: "error",
        message: submissionError.message
      };
    }

    const { error: profileError } = await supabase!
      .from("profiles")
      .update({ kyc_status: "pending" })
      .eq("id", seller.id);

    if (profileError) {
      return {
        status: "error",
        message: profileError.message
      };
    }

    return {
      status: "success",
      message: "Your KYC has been submitted and is now pending review."
    };
  }

  await addDemoKycSubmission({
    seller,
    fullName,
    documentType,
    documentNumber
  });

  revalidatePath("/seller/kyc");
  revalidatePath("/seller/dashboard");
  revalidatePath("/admin/kyc");

  return {
    status: "success",
    message: "Your KYC has been submitted and is now pending review."
  };
}

export async function submitListingAction(
  _prevState: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const seller = await requireSellerProfile();

  if (seller.kyc_status !== "approved") {
    return {
      status: "error",
      message: "Your KYC must be approved before you can upload an account."
    };
  }

  const game = String(formData.get("game") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const platform = String(formData.get("platform") ?? "").trim();
  const accountLevel = String(formData.get("accountLevel") ?? "").trim();
  const loginMethod = String(formData.get("loginMethod") ?? "").trim();
  const extraNotes = String(formData.get("extraNotes") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);

  if (!game || !title || !description || !platform || !accountLevel || !loginMethod) {
    return {
      status: "error",
      message: "Please complete all required listing fields."
    };
  }

  if (!Number.isFinite(price) || price <= 0) {
    return {
      status: "error",
      message: "Please enter a valid listing price."
    };
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase!.from("listings").insert({
      seller_id: seller.id,
      game,
      title,
      description,
      price,
      platform,
      account_level: accountLevel,
      login_method: loginMethod,
      extra_notes: extraNotes,
      status: "pending_review"
    });

    if (error) {
      return {
        status: "error",
        message: error.message
      };
    }

    return {
      status: "success",
      message: "Listing submitted successfully and sent for admin review."
    };
  }

  await addDemoListing({
    seller,
    game,
    title,
    description,
    price,
    platform,
    accountLevel,
    loginMethod,
    extraNotes
  });

  revalidatePath("/seller/listings");
  revalidatePath("/seller/dashboard");
  revalidatePath("/admin/listings");

  return {
    status: "success",
    message: "Listing submitted successfully and sent for admin review."
  };
}
