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
import {
  IMAGE_KYC_EXTENSIONS,
  inferContentType,
  KYC_STORAGE_BUCKET,
  MAX_KYC_FILE_BYTES,
  sanitizeFileName,
  validateFileUpload,
  validateUploadedStorageAsset
} from "@/lib/storageUploads";
import { getNigeriaTimestamp, isValidPhoneNumber } from "@/lib/utils";
import type { KycActionState, Listing, ListingActionState, Profile } from "@/types";

const LISTING_STORAGE_BUCKET = "listing-media";
const MAX_LISTING_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_LISTING_IMAGES = 1;
const LISTING_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const DUPLICATE_LISTING_WINDOW_MS = 10 * 60 * 1000;

export type WithdrawalActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function acknowledgeSellerEnforcementAction(enforcementId: string) {
  await requireSellerProfile();

  if (!enforcementId || !hasSupabaseEnv) {
    return;
  }

  const supabase = await getSupabaseServerClient();
  await supabase?.rpc("acknowledge_seller_enforcement", {
    target_enforcement_id: enforcementId
  });

  revalidatePath("/seller/dashboard");
}

export async function requestWithdrawalAction(
  _previousState: WithdrawalActionState,
  formData: FormData
): Promise<WithdrawalActionState> {
  await requireSellerProfile();

  const amount = Number(String(formData.get("amount") ?? "").replace(/,/g, "").trim());
  const bankName = String(formData.get("bankName") ?? "").trim();
  const accountNumber = String(formData.get("accountNumber") ?? "").trim();
  const accountName = String(formData.get("accountName") ?? "").trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      status: "error",
      message: "Enter a valid withdrawal amount."
    };
  }

  if (!bankName || !accountNumber || !accountName) {
    return {
      status: "error",
      message: "Add your complete bank details."
    };
  }

  if (!hasSupabaseEnv) {
    return {
      status: "error",
      message: "Connect Supabase to request withdrawals."
    };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase!.rpc("submit_withdrawal_request", {
    withdrawal_amount: amount,
    withdrawal_bank_name: bankName,
    withdrawal_account_number: accountNumber,
    withdrawal_account_name: accountName
  });

  if (error) {
    return {
      status: "error",
      message: error.message
    };
  }

  revalidatePath("/seller/wallet");
  revalidatePath("/seller/withdrawals");
  revalidatePath("/seller/notifications");
  revalidatePath("/seller/dashboard");
  revalidatePath("/admin/withdrawals");
  revalidatePath("/admin/notifications");
  revalidatePath("/admin/dashboard");

  redirect("/seller/withdrawals/processing");
}

function normalizeDuplicateValue(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function isSameListingSubmission(
  listing: Pick<
    Listing,
    "seller_id" | "game" | "title" | "description" | "price" | "platform" | "account_level" | "login_method" | "extra_notes"
  >,
  values: {
    sellerId: string;
    game: string;
    title: string;
    description: string;
    price: number;
    platform: string;
    accountLevel: string;
    loginMethod: string;
    extraNotes: string;
  }
) {
  return (
    listing.seller_id === values.sellerId &&
    normalizeDuplicateValue(listing.game) === normalizeDuplicateValue(values.game) &&
    normalizeDuplicateValue(listing.title) === normalizeDuplicateValue(values.title) &&
    normalizeDuplicateValue(listing.description) === normalizeDuplicateValue(values.description) &&
    Number(listing.price) === values.price &&
    normalizeDuplicateValue(listing.platform) === normalizeDuplicateValue(values.platform) &&
    normalizeDuplicateValue(listing.account_level) === normalizeDuplicateValue(values.accountLevel) &&
    normalizeDuplicateValue(listing.login_method) === normalizeDuplicateValue(values.loginMethod) &&
    normalizeDuplicateValue(listing.extra_notes ?? "") === normalizeDuplicateValue(values.extraNotes)
  );
}

async function hasRecentDuplicateListing({
  sellerId,
  game,
  title,
  description,
  price,
  platform,
  accountLevel,
  loginMethod,
  extraNotes
}: {
  sellerId: string;
  game: string;
  title: string;
  description: string;
  price: number;
  platform: string;
  accountLevel: string;
  loginMethod: string;
  extraNotes: string;
}) {
  const duplicateWindowStart = getNigeriaTimestamp(
    new Date(Date.now() - DUPLICATE_LISTING_WINDOW_MS)
  );
  const duplicateValues = {
    sellerId,
    game,
    title,
    description,
    price,
    platform,
    accountLevel,
    loginMethod,
    extraNotes
  };

  if (!hasSupabaseEnv) {
    const listings = await getDemoListings();

    return listings.some(
      (listing) =>
        listing.created_at >= duplicateWindowStart &&
        isSameListingSubmission(listing, duplicateValues)
    );
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase!
    .from("listings")
    .select(
      "seller_id, game, title, description, price, platform, account_level, login_method, extra_notes"
    )
    .eq("seller_id", sellerId)
    .eq("game", game)
    .eq("title", title)
    .eq("price", price)
    .eq("platform", platform)
    .eq("account_level", accountLevel)
    .eq("login_method", loginMethod)
    .gte("created_at", duplicateWindowStart)
    .limit(5);

  if (error) {
    return false;
  }

  return ((data as Listing[] | null) ?? []).some((listing) =>
    isSameListingSubmission(listing, duplicateValues)
  );
}

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

function sellerRestrictionActive(seller: Profile) {
  return Boolean(
    seller.seller_restricted_until &&
      new Date(seller.seller_restricted_until).getTime() > Date.now()
  );
}

async function removeKycAssets(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>,
  assetPaths: string[]
) {
  const paths = assetPaths.filter(Boolean);

  if (paths.length === 0) {
    return;
  }

  await supabase.storage.from(KYC_STORAGE_BUCKET).remove(paths);
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
  if (seller.is_banned) {
    return {
      status: "error",
      message: "Your account is suspended. Seller features are unavailable."
    };
  }

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
  const documentFrontUploadedName = String(formData.get("documentFrontUploadedName") ?? "").trim();
  const documentFrontUploadedPath = String(formData.get("documentFrontUploadedPath") ?? "").trim();
  const documentBackUploadedName = String(formData.get("documentBackUploadedName") ?? "").trim();
  const documentBackUploadedPath = String(formData.get("documentBackUploadedPath") ?? "").trim();
  const selfieUploadedName = String(formData.get("selfieUploadedName") ?? "").trim();
  const selfieUploadedPath = String(formData.get("selfieUploadedPath") ?? "").trim();
  const documentFrontFile = getUploadedFile(formData.get("documentFront"));
  const documentBackFile = getUploadedFile(formData.get("documentBack"));
  const selfieFile = getUploadedFile(formData.get("selfieFile"));
  const documentFrontName = documentFrontUploadedName || getUploadedFileName(documentFrontFile);
  const documentBackName = documentBackUploadedName || getUploadedFileName(documentBackFile);
  const selfieFileName = selfieUploadedName || getUploadedFileName(selfieFile);
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
    (documentFrontUploadedPath
      ? validateUploadedStorageAsset({
          fileName: documentFrontName,
          filePath: documentFrontUploadedPath,
          fieldLabel: "ID front",
          allowedExtensions: IMAGE_KYC_EXTENSIONS,
          expectedOwnerId: seller.id
        })
      : validateFileUpload({
          file: documentFrontFile,
          fieldLabel: "ID front",
          allowedExtensions: IMAGE_KYC_EXTENSIONS,
          maxBytes: MAX_KYC_FILE_BYTES
        })) ||
    (documentBackUploadedPath
      ? validateUploadedStorageAsset({
          fileName: documentBackName,
          filePath: documentBackUploadedPath,
          fieldLabel: "ID back",
          allowedExtensions: IMAGE_KYC_EXTENSIONS,
          expectedOwnerId: seller.id
        })
      : validateFileUpload({
          file: documentBackFile,
          fieldLabel: "ID back",
          allowedExtensions: IMAGE_KYC_EXTENSIONS,
          maxBytes: MAX_KYC_FILE_BYTES
        })) ||
    (selfieUploadedPath
      ? validateUploadedStorageAsset({
          fileName: selfieFileName,
          filePath: selfieUploadedPath,
          fieldLabel: "Selfie image",
          allowedExtensions: IMAGE_KYC_EXTENSIONS,
          expectedOwnerId: seller.id
        })
      : validateFileUpload({
          file: selfieFile,
          fieldLabel: "Selfie image",
          allowedExtensions: IMAGE_KYC_EXTENSIONS,
          maxBytes: MAX_KYC_FILE_BYTES
        }));

  if (uploadValidationError) {
    return {
      status: "error",
      message: uploadValidationError
    };
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const directUploadsReady =
      Boolean(documentFrontUploadedPath && documentBackUploadedPath && selfieUploadedPath);
    const uploadedAssetPaths: string[] = [];
    const [frontUpload, backUpload, selfieUpload] = directUploadsReady
      ? [
          {
            path: documentFrontUploadedPath,
            name: documentFrontName
          },
          {
            path: documentBackUploadedPath,
            name: documentBackName
          },
          {
            path: selfieUploadedPath,
            name: selfieFileName
          }
        ]
      : await Promise.all([
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

    if ("error" in frontUpload || "error" in backUpload || "error" in selfieUpload) {
      return {
        status: "error",
        message:
          ("error" in frontUpload && frontUpload.error) ||
          ("error" in backUpload && backUpload.error) ||
          ("error" in selfieUpload && selfieUpload.error) ||
          "KYC file upload failed."
      };
    }

    uploadedAssetPaths.push(frontUpload.path, backUpload.path, selfieUpload.path);

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
      await removeKycAssets(supabase!, uploadedAssetPaths);

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
  revalidatePath("/seller/notifications");
  revalidatePath("/seller/dashboard");
  revalidatePath("/admin/kyc");
  revalidatePath("/admin/notifications");
  revalidatePath("/admin/dashboard");

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
  if (seller.is_banned) {
    return {
      status: "error",
      message: "Your account is suspended. Seller features are unavailable."
    };
  }

  if (sellerRestrictionActive(seller)) {
    return {
      status: "error",
      message: "Your seller uploads are temporarily restricted."
    };
  }

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
  const price = Number(String(formData.get("price") ?? "0").replace(/,/g, ""));
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

  const imageValidationError = validateFileUpload({
    file: listingImageFile,
    fieldLabel: "Final grid image",
    allowedExtensions: LISTING_IMAGE_EXTENSIONS,
    maxBytes: MAX_LISTING_IMAGE_BYTES
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

  const duplicateListingExists = await hasRecentDuplicateListing({
    sellerId: seller.id,
    game,
    title,
    description,
    price,
    platform,
    accountLevel,
    loginMethod,
    extraNotes
  });

  if (duplicateListingExists) {
    return {
      status: "success",
      message:
        "This listing was already published recently. Please check My Listings before publishing it again."
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
      seller_avatar_url: seller.avatar_url ?? "",
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
    revalidatePath("/seller/notifications");
    revalidatePath("/seller/dashboard");
    revalidatePath("/admin/listings");
    revalidatePath("/admin/notifications");
    revalidatePath("/admin/dashboard");
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
  revalidatePath("/seller/notifications");
  revalidatePath("/seller/dashboard");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/notifications");
  revalidatePath("/admin/dashboard");
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
  revalidatePath("/seller/notifications");
  revalidatePath("/seller/dashboard");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/listing-history");
  revalidatePath("/admin/dashboard");

  redirect(getListingRemovalRedirectPath(safeReturnTo, "listing-withdrawn"));
}
