"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import ListingPhotoGrid from "@/components/public/ListingPhotoGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabaseClient";
import {
  inferContentType,
  sanitizeFileName,
  validateFileUpload
} from "@/lib/storageUploads";
import { gameOptions, loginMethodOptions, platformOptions } from "@/lib/utils";

const LISTING_STORAGE_BUCKET = "listing-media";
const MAX_LISTING_IMAGE_BYTES = 12 * 1024 * 1024;
const LISTING_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);
const ACCOUNT_LIMITED_MESSAGE =
  "Your account is currently limited. Publishing is unavailable while our team reviews your account.";

export default function SellerUploadForm({
  sellerId,
  accountLimited = false,
  feedbackMessage = ""
}: {
  sellerId: string;
  accountLimited?: boolean;
  feedbackMessage?: string;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [localFeedback, setLocalFeedback] = useState(feedbackMessage);
  const router = useRouter();
  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ""),
    [selectedFile]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    setLocalFeedback(feedbackMessage);
  }, [feedbackMessage]);

  async function uploadListingImageDirect(file: File) {
    if (!hasSupabaseEnv) {
      throw new Error("Connect Supabase to upload listing images.");
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      throw new Error("Supabase storage is not available right now. Please refresh and try again.");
    }

    const safeName = sanitizeFileName(file.name || "listing-image.png") || "listing-image.png";
    const filePath = `${sellerId}/${crypto.randomUUID()}-listing-1-${safeName}`;
    const { error } = await supabase.storage.from(LISTING_STORAGE_BUCKET).upload(filePath, file, {
      contentType: inferContentType(file),
      upsert: false
    });

    if (error) {
      throw new Error(`Listing image upload failed: ${error.message}`);
    }

    return {
      path: filePath,
      name: file.name.trim() || safeName
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (accountLimited) {
      setLocalFeedback(ACCOUNT_LIMITED_MESSAGE);
      return;
    }

    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    const listingImageFile = selectedFile;
    const validationError = validateFileUpload({
      file: listingImageFile,
      fieldLabel: "Final grid image",
      allowedExtensions: LISTING_IMAGE_EXTENSIONS,
      maxBytes: MAX_LISTING_IMAGE_BYTES
    });

    if (validationError) {
      setLocalFeedback(validationError);
      return;
    }

    let uploadedPath = "";
    setIsSubmitting(true);
    setLocalFeedback("");

    try {
      const uploadedImage = await uploadListingImageDirect(listingImageFile!);
      uploadedPath = uploadedImage.path;

      const formData = new FormData(form);
      formData.delete("listingImage");
      formData.set("uploadedListingImagePath", uploadedImage.path);
      formData.set("uploadedListingImageName", uploadedImage.name);

      const response = await fetch("/seller/upload/submit", {
        method: "POST",
        body: formData
      });

      if (response.redirected) {
        router.push(response.url);
        return;
      }

      if (!response.ok) {
        throw new Error("Listing could not be published right now.");
      }

      router.push("/seller/listings?listing=published");
    } catch (error) {
      if (uploadedPath) {
        await getSupabaseBrowserClient()?.storage.from(LISTING_STORAGE_BUCKET).remove([uploadedPath]);
      }

      setLocalFeedback(error instanceof Error ? error.message : "Listing could not be published right now.");
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-5xl">
      <CardHeader>
        <CardTitle>Publish a gaming account listing</CardTitle>
        <CardDescription>
          Approved sellers can publish mobile gaming account listings here directly.
        </CardDescription>
        <div className="rounded-3xl border border-primary/12 bg-primary-soft/55 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-dark">
            Grid image tip
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Build your collage yourself first, then upload one final image only. Make sure
            the single image clearly shows the lobby, rank, inventory, rare skins, bundles,
            or weapon proof buyers care about most.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {accountLimited ? (
            <FormMessage message={ACCOUNT_LIMITED_MESSAGE} tone="error" />
          ) : null}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="game" className="text-sm font-semibold text-foreground">
                Game
              </label>
              <Select id="game" name="game" defaultValue="" required>
                <option value="" disabled>
                  Select a game
                </option>
                {gameOptions.map((game) => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-semibold text-foreground">
                Price
              </label>
              <Input
                id="price"
                type="text"
                inputMode="numeric"
                value={priceInput}
                onChange={(event) => {
                  const digits = event.target.value.replace(/[^\d]/g, "");
                  setPriceInput(digits ? new Intl.NumberFormat("en-NG").format(Number(digits)) : "");
                }}
                placeholder="200,000"
                required
              />
              <input type="hidden" name="price" value={priceInput.replace(/,/g, "")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="title" className="text-sm font-semibold text-foreground">
                Account Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Example: CODM Ranked Account with Premium Loadout"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="text-sm font-semibold text-foreground">
                Account Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe skins, rank, unlocked items, and account quality."
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="platform" className="text-sm font-semibold text-foreground">
                Platform
              </label>
              <Select id="platform" name="platform" defaultValue="" required>
                <option value="" disabled>
                  Select platform
                </option>
                {platformOptions.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="accountLevel" className="text-sm font-semibold text-foreground">
                Account Level
              </label>
              <Input id="accountLevel" name="accountLevel" placeholder="Level 120" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="loginMethod" className="text-sm font-semibold text-foreground">
                Login Method
              </label>
              <Select id="loginMethod" name="loginMethod" defaultValue="" required>
                <option value="" disabled>
                  Select login method
                </option>
                {loginMethodOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="extraNotes" className="text-sm font-semibold text-foreground">
                Extra Notes <span className="font-normal text-muted-foreground">(Optional)</span>
              </label>
              <Input id="extraNotes" name="extraNotes" placeholder="Any extra notes for buyers" />
            </div>
          </div>

          <div className="rounded-[26px] border border-border/70 bg-surface p-5 text-sm leading-6 text-muted-foreground">
            Only list accounts you are authorized to transfer. Listing details, images, and delivery
            information must match the account being sold.
          </div>

          <div className="space-y-5 rounded-[30px] border border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,250,235,0.95),rgba(255,255,255,0.98))] p-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
                Private delivery details
              </p>
              <h3 className="font-heading text-2xl font-semibold text-foreground">
                These details stay hidden from the marketplace.
              </h3>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Add the account access details the buyer should receive after payment.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="deliveryLoginId" className="text-sm font-semibold text-foreground">
                  Account login email or username
                </label>
                <Input
                  id="deliveryLoginId"
                  name="deliveryLoginId"
                  placeholder="login@example.com or account username"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="deliveryPassword" className="text-sm font-semibold text-foreground">
                  Account password
                </label>
                <PasswordInput
                  id="deliveryPassword"
                  name="deliveryPassword"
                  placeholder="Password the buyer will receive"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="deliveryRecoveryInfo" className="text-sm font-semibold text-foreground">
                  Recovery details or backup codes{" "}
                  <span className="font-normal text-muted-foreground">(Optional)</span>
                </label>
                <Textarea
                  id="deliveryRecoveryInfo"
                  name="deliveryRecoveryInfo"
                  className="min-h-28"
                  placeholder="Recovery email, backup codes, or recovery steps."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="deliveryTransferNote" className="text-sm font-semibold text-foreground">
                  Transfer note for the buyer{" "}
                  <span className="font-normal text-muted-foreground">(Optional)</span>
                </label>
                <Textarea
                  id="deliveryTransferNote"
                  name="deliveryTransferNote"
                  className="min-h-24"
                  placeholder="Short handoff note for the buyer."
                />
              </div>
            </div>

            <div className="grid gap-3">
              <label className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-white/85 px-4 py-3 text-sm text-foreground shadow-sm">
                <input
                  type="checkbox"
                  name="deliveryReleaseConfirmed"
                  value="yes"
                  required
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span>
                  I understand these details will be released after successful payment.
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-white/85 px-4 py-3 text-sm text-foreground shadow-sm">
                <input
                  type="checkbox"
                  name="deliveryNotPersonalConfirmed"
                  value="yes"
                  required
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span>
                  I confirm these details are for the account being sold.
                </span>
              </label>
            </div>
          </div>

          <div className="rounded-[28px] border border-dashed border-border bg-surface p-6">
            <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div className="rounded-[28px] border border-white/80 bg-white p-3 shadow-sm">
                {previewUrl ? (
                  <div className="aspect-[16/11] overflow-hidden rounded-[28px] bg-slate-950 p-2">
                    <div className="relative h-full overflow-hidden rounded-[22px] bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Selected listing grid preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <ListingPhotoGrid
                    size="guide"
                    listing={{
                      id: "guide-listing",
                      seller_id: "guide-seller",
                      seller_name: "Seller guide",
                      seller_username: "gridready",
                      game: "Free Fire",
                      title: "Example photo grid",
                      description: "Guide only",
                      price: 0,
                      platform: "Mobile",
                      account_level: "Level 70",
                      login_method: "Email",
                      extra_notes: "",
                      status: "draft",
                      created_at: "2026-05-14T00:00:00.000Z"
                    }}
                  />
                )}
              </div>
              <div className="space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-primary shadow-sm">
                  <ImagePlus className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Use this as sample</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Create one clean final grid image yourself, then upload that single image
                    for the marketplace card and listing page.
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="listingImage" className="text-sm font-semibold text-foreground">
                    Final grid image
                  </label>
                  <input
                    id="listingImage"
                    name="listingImage"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
                    required
                    onChange={(event) =>
                      setSelectedFile(event.currentTarget.files?.[0] ?? null)
                    }
                    className="block w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm file:mr-4 file:rounded-xl file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:font-semibold file:text-primary"
                  />
                  <p className="text-xs leading-6 text-muted-foreground">
                    Upload one JPG, PNG, WEBP, or HEIC image only.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <FormMessage message={localFeedback} tone="error" />

          <div className="flex justify-end">
            <SubmitButton disabled={isSubmitting || accountLimited} pendingLabel="Publishing listing...">
              Publish Listing
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
