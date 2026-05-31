"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSellerProfile } from "@/lib/auth";
import {
  addDemoKycSubmission,
  addDemoListingDeliveryDetails,
  addDemoListing,
  getDemoListings,
  updateDemoListingStatus
} from "@/lib/demoStore";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getNigeriaTimestamp, isValidPhoneNumber } from "@/lib/utils";
import type { KycActionState, ListingActionState, Profile } from "@/types";

const KYC_STORAGE_BUCKET = "kyc-documents";
const LISTING_STORAGE_BUCKET = "listing-media";
const MAX_KYC_FILE_BYTES = 20 * 1024 * 1024;
const MAX_LISTING_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_LISTING_IMAGES = 1;
const IMAGE_KYC_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);
const LISTING_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

function getUploadedFileName(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size <= 0) {
    return "";
  }

  return value.name.trim();
}

function getUploadedFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size <= 0) {
    return null;
  }

  return value;
}

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function getFileExtension(fileName: string) {
  const sanitized = fileName.trim().toLowerCase();
  const segments = sanitized.split(".");

  if (segments.length < 2) {
    return "";
  }

  return segments.at(-1) ?? "";
}

function inferContentType(file: File) {
  if (file.type) {
    return file.type;
  }

  const extension = getFileExtension(file.name);

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    case "pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

function validateKycUpload({
  file,
  fieldLabel,
  allowedExtensions
}: {
  file: File | null;
  fieldLabel: string;
  allowedExtensions: Set<string>;
}) {
  if (!file) {
    return `${fieldLabel} is required.`;
  }

  if (file.size > MAX_KYC_FILE_BYTES) {
    return `${fieldLabel} must be ${Math.floor(MAX_KYC_FILE_BYTES / (1024 * 1024))}MB or smaller.`;
  }

  const extension = getFileExtension(file.name);

  if (!allowedExtensions.has(extension)) {
    return `${fieldLabel} must be a ${Array.from(allowedExtensions)
      .map((value) => value.toUpperCase())
      .join(", ")} file.`;
  }

  return "";
}

async function uploadKycAsset({
  supabase,
  sellerId,
  fieldName,
  file
}: {
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>;
  sellerId: string;
  fieldName: string;
  file: File;
}): Promise<
  | { path: string; name: string; error?: undefined }
  | { path?: undefined; name?: undefined; error: string }
> {
  const safeName = sanitizeFileName(file.name || `${fieldName}.bin`) || `${fieldName}.bin`;
  const filePath = `${sellerId}/${crypto.randomUUID()}-${fieldName}-${safeName}`;
  const uploadPayload = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage.from(KYC_STORAGE_BUCKET).upload(filePath, uploadPayload, {
    contentType: inferContentType(file),
    upsert: false
  });

  if (error) {
    return {
      error: `KYC file upload failed for ${fieldName.replace(/_/g, " ")}: ${error.message}`
    };
  }

  return {
    path: filePath,
    name: file.name.trim()
  };
}

async function uploadListingAsset({
  supabase,
  sellerId,
  file,
  index
}: {
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>;
  sellerId: string;
  file: File;
  index: number;
}): Promise<
  | { path: string; name: string; error?: undefined }
  | { path?: undefined; name?: undefined; error: string }
> {
  const safeName = sanitizeFileName(file.name || `listing-image-${index + 1}.bin`) || `listing-image-${index + 1}.bin`;
  const filePath = `${sellerId}/${crypto.randomUUID()}-listing-${index + 1}-${safeName}`;
  const uploadPayload = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage.from(LISTING_STORAGE_BUCKET).upload(filePath, uploadPayload, {
    contentType: inferContentType(file),
    upsert: false
  });

  if (error) {
    return {
      error: `Listing image upload failed for image ${index + 1}: ${error.message}`
    };
  }

  return {
    path: filePath,
    name: file.name.trim()
  };
}

function getListingRemovalRedirectPath(
  basePath: string,
  notice: "listing-withdrawn" | "listing-withdraw-failed",
  errorMessage?: string
) {
  const [pathname, existingQuery = ""] = basePath.split("?");
  const searchParams = new URLSearchParams(existingQuery);
  searchParams.set("notice", notice);

  if (errorMessage) {
    searchParams.set("error", errorMessage);
  }

  return `${pathname}?${searchParams.toString()}`;
}

export async function saveKycSubmission({
  seller,
  formData
}: {
  seller: Profile;
  formData: FormData;
}): Promise<{ status: "success" } | { status: "error"; message: string }> {
  if (seller.kyc_status === "approved") {
    return {
      status: "error",
      message: "Your KYC is already approved. You do not need to submit it again."
    };
  }

  if (seller.kyc_status === "pending") {
    return {
      status: "error",
      message: "Your KYC is already pending review. Please wait for admin approval."
    };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const residentialAddress = String(formData.get("residentialAddress") ?? "").trim();
  const documentType = String(formData.get("documentType") ?? "").trim();
  const documentNumber = String(formData.get("documentNumber") ?? "").trim();
  const documentFrontFile = getUploadedFile(formData.get("documentFront"));
  const documentBackFile = getUploadedFile(formData.get("documentBack"));
  const selfieFile = getUploadedFile(formData.get("selfieFile"));
  const documentFrontName = getUploadedFileName(documentFrontFile);
  const documentBackName = getUploadedFileName(documentBackFile);
  const selfieFileName = getUploadedFileName(selfieFile);
  const stateCity = `${state} / ${city}`.trim();

  const missingFields = [
    !fullName && "Full legal name",
    !email && "Email address",
    !phoneNumber && "Phone number",
    !dateOfBirth && "Date of birth",
    !country && "Country",
    !state && "State",
    !city && "City",
    !residentialAddress && "Residential address",
    !documentType && "Identification type",
    !documentNumber && "Document number"
  ].filter(Boolean);

  if (missingFields.length > 0) {
    return {
      status: "error",
      message: `Please complete: ${missingFields.join(", ")}.`
    };
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    return {
      status: "error",
      message: "Phone number must contain only numbers and can include +, spaces, hyphens, or parentheses."
    };
  }

  const missingUploads = [
    !documentFrontName && "ID front",
    !documentBackName && "ID back",
    !selfieFileName && "Selfie image"
  ].filter(Boolean);

  if (missingUploads.length > 0) {
    return {
      status: "error",
      message: `Please upload: ${missingUploads.join(", ")}.`
    };
  }

  const uploadValidationError =
    validateKycUpload({
      file: documentFrontFile,
      fieldLabel: "ID front",
      allowedExtensions: IMAGE_KYC_EXTENSIONS
    }) ||
    validateKycUpload({
      file: documentBackFile,
      fieldLabel: "ID back",
      allowedExtensions: IMAGE_KYC_EXTENSIONS
    }) ||
    validateKycUpload({
      file: selfieFile,
      fieldLabel: "Selfie image",
      allowedExtensions: IMAGE_KYC_EXTENSIONS
    });

  if (uploadValidationError) {
    return {
      status: "error",
      message: uploadValidationError
    };
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const [frontUpload, backUpload, selfieUpload] = await Promise.all([
      uploadKycAsset({
        supabase: supabase!,
        sellerId: seller.id,
        fieldName: "document_front",
        file: documentFrontFile!
      }),
      uploadKycAsset({
        supabase: supabase!,
        sellerId: seller.id,
        fieldName: "document_back",
        file: documentBackFile!
      }),
      uploadKycAsset({
        supabase: supabase!,
        sellerId: seller.id,
        fieldName: "selfie",
        file: selfieFile!
      })
    ]);

    const uploadError =
      ("error" in frontUpload && frontUpload.error) ||
      ("error" in backUpload && backUpload.error) ||
      ("error" in selfieUpload && selfieUpload.error);

    if (uploadError) {
      return {
        status: "error",
        message: uploadError
      };
    }

    const { error: submissionError } = await supabase!.from("kyc_submissions").insert({
      seller_id: seller.id,
      full_name: fullName,
      email,
      username: seller.username,
      phone_number: phoneNumber,
      date_of_birth: dateOfBirth,
      country,
      state,
      city,
      state_city: stateCity,
      residential_address: residentialAddress,
      document_type: documentType,
      document_number: documentNumber,
      document_front_name: frontUpload.name,
      document_front_path: frontUpload.path,
      document_back_name: backUpload.name,
      document_back_path: backUpload.path,
      proof_of_address_type: "",
      proof_of_address_name: "",
      proof_of_address_path: "",
      selfie_file_name: selfieUpload.name,
      selfie_file_path: selfieUpload.path,
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
  } else {
    await addDemoKycSubmission({
      seller,
      fullName,
      email,
      phoneNumber,
      dateOfBirth,
      country,
      state,
      city,
      stateCity,
      residentialAddress,
      documentType,
      documentNumber,
      documentFrontName,
      documentBackName,
      selfieFileName
    });
  }

  revalidatePath("/seller/kyc");
  revalidatePath("/seller/dashboard");
  revalidatePath("/admin/kyc");

  return { status: "success" };
}

export async function submitKycAction(
  _prevState: KycActionState,
  formData: FormData
): Promise<KycActionState> {
  const seller = await requireSellerProfile();
  const result = await saveKycSubmission({ seller, formData });

  if (result.status === "error") {
    return result;
  }

  redirect("/seller/dashboard");
}

export async function submitListingAction(
  _prevState: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const seller = await requireSellerProfile();

  return saveListingSubmission({ seller, formData });
}

export async function saveListingSubmission({
  seller,
  formData
}: {
  seller: Profile;
  formData: FormData;
}): Promise<ListingActionState> {
  const game = String(formData.get("game") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const platform = String(formData.get("platform") ?? "").trim();
  const accountLevel = String(formData.get("accountLevel") ?? "").trim();
  const loginMethod = String(formData.get("loginMethod") ?? "").trim();
  const extraNotes = String(formData.get("extraNotes") ?? "").trim();
  const deliveryLoginId = String(formData.get("deliveryLoginId") ?? "").trim();
  const deliveryPassword = String(formData.get("deliveryPassword") ?? "").trim();
  const deliveryRecoveryInfo = String(formData.get("deliveryRecoveryInfo") ?? "").trim();
  const deliveryTransferNote = String(formData.get("deliveryTransferNote") ?? "").trim();
  const deliveryReleaseConfirmed =
    String(formData.get("deliveryReleaseConfirmed") ?? "").trim() === "yes";
  const deliveryNotPersonalConfirmed =
    String(formData.get("deliveryNotPersonalConfirmed") ?? "").trim() === "yes";
  const price = Number(formData.get("price") ?? 0);
  const listingImageEntries = formData.getAll("listingImage");
  const listingImageFiles = listingImageEntries
    .map((entry) => getUploadedFile(entry))
    .filter((file): file is File => Boolean(file));
  const listingImageFile = listingImageFiles[0] ?? null;

  if (seller.kyc_status !== "approved") {
    return {
      status: "error",
      message: "Your KYC must be approved before you can upload an account."
    };
  }

  if (!game || !title || !description || !platform || !accountLevel || !loginMethod) {
    return {
      status: "error",
      message: "Please complete all required listing fields."
    };
  }

  if (!deliveryLoginId || !deliveryPassword) {
    return {
      status: "error",
      message: "Please complete the private delivery login and password fields."
    };
  }

  if (!deliveryReleaseConfirmed || !deliveryNotPersonalConfirmed) {
    return {
      status: "error",
      message: "Please confirm the private delivery release warnings before publishing."
    };
  }

  if (!Number.isFinite(price) || price <= 0) {
    return {
      status: "error",
      message: "Please enter a valid listing price."
    };
  }

  if (!listingImageFile) {
    return {
      status: "error",
      message: "Upload one final grid image for this listing."
    };
  }

  if (listingImageFiles.length > MAX_LISTING_IMAGES) {
    return {
      status: "error",
      message: "Upload only one final grid image per listing."
    };
  }

  const imageValidationError = validateKycUpload({
    file: listingImageFile,
    fieldLabel: "Final grid image",
    allowedExtensions: LISTING_IMAGE_EXTENSIONS
  });

  if (imageValidationError) {
    return {
      status: "error",
      message: imageValidationError
    };
  }

  if (listingImageFile.size > MAX_LISTING_IMAGE_BYTES) {
    return {
      status: "error",
      message: "Final grid image must be 8MB or smaller."
    };
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const uploadedImage = await uploadListingAsset({
      supabase: supabase!,
      sellerId: seller.id,
      file: listingImageFile,
      index: 0
    });

    if ("error" in uploadedImage) {
      return {
        status: "error",
        message: uploadedImage.error
      };
    }

    const { data: createdListing, error } = await supabase!
      .from("listings")
      .insert({
      seller_id: seller.id,
      seller_name: seller.full_name,
      seller_username: seller.username,
      game,
      title,
      description,
      price,
      platform,
      account_level: accountLevel,
      login_method: loginMethod,
      extra_notes: extraNotes,
      image_names: [uploadedImage.name],
      image_paths: [uploadedImage.path],
      status: "approved"
      })
      .select("id")
      .maybeSingle();

    if (error) {
      return {
        status: "error",
        message: error.message
      };
    }

    if (!createdListing?.id) {
      return {
        status: "error",
        message: "Listing was created without an ID. Please try again."
      };
    }

    const { error: deliveryInsertError } = await supabase!
      .from("listing_delivery_details")
      .insert({
        listing_id: createdListing.id,
        seller_id: seller.id,
        account_login_id: deliveryLoginId,
        account_password: deliveryPassword,
        recovery_details: deliveryRecoveryInfo,
        transfer_note: deliveryTransferNote,
        ready_for_release_confirmed: deliveryReleaseConfirmed,
        not_personal_confirmed: deliveryNotPersonalConfirmed
      });

    if (deliveryInsertError) {
      await supabase!.from("listings").delete().eq("id", createdListing.id).eq("seller_id", seller.id);
      await supabase!.storage.from(LISTING_STORAGE_BUCKET).remove([uploadedImage.path]);

      return {
        status: "error",
        message: `Private delivery details could not be saved: ${deliveryInsertError.message}`
      };
    }

    revalidatePath("/seller/listings");
    revalidatePath("/seller/dashboard");
    revalidatePath("/admin/listings");
    revalidatePath("/marketplace");
    revalidatePath("/account/marketplace");

    return {
      status: "success",
      message: "Listing published successfully. Private delivery details were saved separately."
    };
  }

  const demoListing = await addDemoListing({
    seller,
    game,
    title,
    description,
    price,
    platform,
    accountLevel,
    loginMethod,
    extraNotes,
    imageNames: [listingImageFile.name.trim()]
  });

  await addDemoListingDeliveryDetails({
    listingId: demoListing.id,
    sellerId: seller.id,
    accountLoginId: deliveryLoginId,
    accountPassword: deliveryPassword,
    recoveryDetails: deliveryRecoveryInfo,
    transferNote: deliveryTransferNote,
    readyForReleaseConfirmed: deliveryReleaseConfirmed,
    notPersonalConfirmed: deliveryNotPersonalConfirmed
  });

  revalidatePath("/seller/listings");
  revalidatePath("/seller/dashboard");
  revalidatePath("/admin/listings");
  revalidatePath("/marketplace");
  revalidatePath("/account/marketplace");

  return {
    status: "success",
    message: "Listing published successfully. Private delivery details were saved separately."
  };
}

export async function withdrawOwnListingAction(formData: FormData) {
  const seller = await requireSellerProfile();
  const listingId = String(formData.get("listingId") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "").trim();
  const safeReturnTo = returnTo.startsWith("/seller/") ? returnTo : "/seller/listings";
  const withdrawnAt = getNigeriaTimestamp();

  if (!listingId) {
    redirect(getListingRemovalRedirectPath(safeReturnTo, "listing-withdraw-failed"));
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { data: listing, error: listingError } = await supabase!
      .from("listings")
      .select("id, status")
      .eq("id", listingId)
      .eq("seller_id", seller.id)
      .maybeSingle();

    if (listingError || !listing) {
      redirect(getListingRemovalRedirectPath(safeReturnTo, "listing-withdraw-failed"));
    }

    const { data: updatedListing, error: updateError } = await supabase!
      .from("listings")
      .update({
        status: "withdrawn",
        withdrawn_at: withdrawnAt
      })
      .eq("id", listingId)
      .eq("seller_id", seller.id)
      .eq("status", "approved")
      .select("id")
      .maybeSingle();

    if (updateError) {
      console.error("Seller listing withdraw failed", {
        listingId,
        sellerId: seller.id,
        error: updateError.message
      });
      redirect(
        getListingRemovalRedirectPath(
          safeReturnTo,
          "listing-withdraw-failed",
          updateError.message
        )
      );
    }

    if (!updatedListing) {
      redirect(
        getListingRemovalRedirectPath(
          safeReturnTo,
          "listing-withdraw-failed",
          "Only active unsold listings can be withdrawn."
        )
      );
    }
  } else {
    const existingListing = (await getDemoListings()).find((listing) => listing.id === listingId);

    if (
      !existingListing ||
      existingListing.seller_id !== seller.id ||
      existingListing.status !== "approved"
    ) {
      redirect(getListingRemovalRedirectPath(safeReturnTo, "listing-withdraw-failed"));
    }

    const withdrawnListing = await updateDemoListingStatus(listingId, "withdrawn", {
      withdrawn_at: withdrawnAt
    });

    if (!withdrawnListing) {
      redirect(getListingRemovalRedirectPath(safeReturnTo, "listing-withdraw-failed"));
    }
  }

  revalidatePath("/");
  revalidatePath("/marketplace");
  revalidatePath("/account/marketplace");
  revalidatePath("/account/saved");
  revalidatePath("/account/cart");
  revalidatePath("/seller/listings");
  revalidatePath("/seller/history");
  revalidatePath("/seller/dashboard");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/listing-history");
  revalidatePath("/admin/dashboard");

  redirect(getListingRemovalRedirectPath(safeReturnTo, "listing-withdrawn"));
}
