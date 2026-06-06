"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import FormMessage from "@/components/auth/FormMessage";
import KycReviewNoticeModal from "@/components/seller/KycReviewNoticeModal";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabaseClient";
import {
  IMAGE_KYC_EXTENSIONS,
  inferContentType,
  KYC_STORAGE_BUCKET,
  MAX_KYC_FILE_BYTES,
  sanitizeFileName,
  validateFileUpload
} from "@/lib/storageUploads";
import { documentTypeOptions, titleCase } from "@/lib/utils";
import type { KycSubmission, Profile } from "@/types";

export default function SellerKycPanel({
  profile,
  latestKycSubmission = null,
  initialOpen = false,
  feedbackMessage = "",
  feedbackTone = "error"
}: {
  profile: Profile;
  latestKycSubmission?: KycSubmission | null;
  initialOpen?: boolean;
  feedbackMessage?: string;
  feedbackTone?: "error" | "success";
}) {
  const [open, setOpen] = useState(initialOpen);
  const [feedbackOpen, setFeedbackOpen] = useState(Boolean(feedbackMessage));
  const [modalFeedback, setModalFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<"idle" | "uploading" | "submitting">("idle");
  const router = useRouter();
  const pathname = usePathname();
  const statusLabel = titleCase(profile.kyc_status);
  const canStartKyc = profile.kyc_status !== "approved" && profile.kyc_status !== "pending";
  const directUploadEnabled = hasSupabaseEnv;
  const feedbackStyles = useMemo(
    () =>
      feedbackTone === "success"
        ? {
            ring: "ring-emerald-200/80",
            bg: "bg-emerald-50/95",
            title: "text-emerald-700",
            text: "text-emerald-800"
          }
        : {
            ring: "ring-rose-200/80",
            bg: "bg-rose-50/95",
            title: "text-rose-700",
            text: "text-rose-800"
          },
    [feedbackTone]
  );
  const ctaLabel =
    profile.kyc_status === "approved"
      ? "KYC Approved"
      : profile.kyc_status === "pending"
        ? "KYC Under Review"
        : "Start KYC";
  const helperMessage =
    profile.kyc_status === "approved"
      ? "Your KYC is approved and seller upload access is fully unlocked."
      : profile.kyc_status === "pending"
        ? "Your KYC has already been submitted and is waiting for admin review."
        : profile.kyc_status === "rejected"
          ? "Your last KYC submission was rejected. Update the details below and submit again."
        : "Upload access is enabled only when your KYC status becomes approved.";
  const submitLabel =
    submitPhase === "uploading"
      ? "Uploading KYC files..."
      : submitPhase === "submitting"
        ? "Saving KYC details..."
        : "Submit KYC";

  useEffect(() => {
    if (!feedbackMessage) {
      return;
    }

    setFeedbackOpen(true);
    router.replace(pathname, { scroll: false });

    const timer = window.setTimeout(() => {
      setFeedbackOpen(false);
    }, 4200);

    return () => window.clearTimeout(timer);
  }, [feedbackMessage, pathname, router]);

  async function uploadKycAssetDirect({
    sellerId,
    fieldName,
    file
  }: {
    sellerId: string;
    fieldName: string;
    file: File;
  }) {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      throw new Error("Supabase storage is not available right now. Please refresh and try again.");
    }

    const safeName = sanitizeFileName(file.name || `${fieldName}.bin`) || `${fieldName}.bin`;
    const filePath = `${sellerId}/${crypto.randomUUID()}-${fieldName}-${safeName}`;
    const { error } = await supabase.storage.from(KYC_STORAGE_BUCKET).upload(filePath, file, {
      contentType: inferContentType(file),
      upsert: false
    });

    if (error) {
      throw new Error(`KYC file upload failed for ${fieldName.replace(/_/g, " ")}: ${error.message}`);
    }

    return {
      path: filePath,
      name: file.name.trim()
    };
  }

  async function removeUploadedKycAssets(paths: string[]) {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    const assetPaths = paths.filter(Boolean);

    if (assetPaths.length === 0) {
      return;
    }

    await supabase.storage.from(KYC_STORAGE_BUCKET).remove(assetPaths);
  }

  async function handleDirectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canStartKyc || submitting) {
      return;
    }

    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    const documentFrontFile = formData.get("documentFront");
    const documentBackFile = formData.get("documentBack");
    const selfieFile = formData.get("selfieFile");

    const validationError =
      validateFileUpload({
        file: documentFrontFile instanceof File ? documentFrontFile : null,
        fieldLabel: "ID front",
        allowedExtensions: IMAGE_KYC_EXTENSIONS,
        maxBytes: MAX_KYC_FILE_BYTES
      }) ||
      validateFileUpload({
        file: documentBackFile instanceof File ? documentBackFile : null,
        fieldLabel: "ID back",
        allowedExtensions: IMAGE_KYC_EXTENSIONS,
        maxBytes: MAX_KYC_FILE_BYTES
      }) ||
      validateFileUpload({
        file: selfieFile instanceof File ? selfieFile : null,
        fieldLabel: "Selfie image",
        allowedExtensions: IMAGE_KYC_EXTENSIONS,
        maxBytes: MAX_KYC_FILE_BYTES
      });

    if (validationError) {
      setModalFeedback(validationError);
      return;
    }

    const uploadedPaths: string[] = [];
    setModalFeedback("");
    setSubmitting(true);
    setSubmitPhase("uploading");

    try {
      const [frontUpload, backUpload, selfieUpload] = await Promise.all([
        uploadKycAssetDirect({
          sellerId: profile.id,
          fieldName: "document_front",
          file: documentFrontFile as File
        }),
        uploadKycAssetDirect({
          sellerId: profile.id,
          fieldName: "document_back",
          file: documentBackFile as File
        }),
        uploadKycAssetDirect({
          sellerId: profile.id,
          fieldName: "selfie",
          file: selfieFile as File
        })
      ]);

      uploadedPaths.push(frontUpload.path, backUpload.path, selfieUpload.path);

      formData.delete("documentFront");
      formData.delete("documentBack");
      formData.delete("selfieFile");
      formData.append("documentFrontUploadedName", frontUpload.name);
      formData.append("documentFrontUploadedPath", frontUpload.path);
      formData.append("documentBackUploadedName", backUpload.name);
      formData.append("documentBackUploadedPath", backUpload.path);
      formData.append("selfieUploadedName", selfieUpload.name);
      formData.append("selfieUploadedPath", selfieUpload.path);

      setSubmitPhase("submitting");

      const response = await fetch("/seller/kyc/submit", {
        method: "POST",
        body: formData,
        credentials: "same-origin"
      });

      const responseUrl = new URL(response.url, window.location.origin);
      const target = `${responseUrl.pathname}${responseUrl.search}`;

      if (response.redirected) {
        if (responseUrl.pathname === "/seller/dashboard") {
          setOpen(false);
          router.push(target);
          router.refresh();
          return;
        }

        if (responseUrl.pathname === "/seller/kyc") {
          await removeUploadedKycAssets(uploadedPaths);
          setModalFeedback(
            responseUrl.searchParams.get("error") ||
              "We could not submit your KYC right now. Please try again."
          );
          return;
        }

        await removeUploadedKycAssets(uploadedPaths);
        router.push(target);
        router.refresh();
        return;
      }

      if (!response.ok) {
        await removeUploadedKycAssets(uploadedPaths);
        setModalFeedback("We could not submit your KYC right now. Please try again.");
        return;
      }

      setOpen(false);
      router.push("/seller/dashboard?kyc=submitted");
      router.refresh();
    } catch (error) {
      await removeUploadedKycAssets(uploadedPaths);
      setModalFeedback(
        error instanceof Error
          ? error.message
          : "We could not submit your KYC right now. Please try again."
      );
    } finally {
      setSubmitting(false);
      setSubmitPhase("idle");
    }
  }

  return (
    <>
      <KycReviewNoticeModal
        submissionId={latestKycSubmission?.status === "rejected" ? latestKycSubmission.id : undefined}
        rejectionReason={latestKycSubmission?.status === "rejected" ? latestKycSubmission.rejection_reason : undefined}
      />
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Complete your KYC verification to unlock selling features.</CardTitle>
          <CardDescription>
            Complete and get approved before uploading any gaming account to the marketplace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-3xl bg-surface p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Current status
            </p>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {statusLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {helperMessage}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => setOpen(true)} disabled={!canStartKyc}>
              {ctaLabel}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {feedbackOpen && feedbackMessage ? (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="fixed right-4 top-4 z-[60] w-[min(92vw,28rem)]"
          >
            <div
              className={`rounded-[24px] border border-white/70 ${feedbackStyles.bg} p-4 shadow-2xl ring-1 backdrop-blur ${feedbackStyles.ring}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className={`text-sm font-semibold ${feedbackStyles.title}`}>
                    KYC submission issue
                  </p>
                  <p className={`text-sm leading-6 ${feedbackStyles.text}`}>{feedbackMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(false)}
                  className={`rounded-full p-2 transition hover:bg-white/70 ${feedbackStyles.title}`}
                  aria-label="Dismiss feedback"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Modal
        open={open}
        onClose={() => {
          if (submitting) {
            return;
          }

          setModalFeedback("");
          setOpen(false);
        }}
        title="Submit KYC details"
        description="Provide your identity information and upload the required files so the admin team can review your seller access."
      >
        <form
          action="/seller/kyc/submit"
          method="POST"
          encType="multipart/form-data"
          onSubmit={directUploadEnabled ? handleDirectSubmit : undefined}
          className="space-y-8"
        >
          <div className="rounded-[28px] border border-border bg-surface/70 p-5 md:p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-xl font-semibold text-foreground">Personal info</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use the same legal identity details that appear on your document.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="fullName" className="text-sm font-semibold text-foreground">
                    Full legal name
                  </label>
                  <Input id="fullName" name="fullName" defaultValue={profile.full_name} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-foreground">
                    Email address
                  </label>
                  <Input id="email" name="email" type="email" defaultValue={profile.email} required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="text-sm font-semibold text-foreground">
                    Phone number
                  </label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    inputMode="tel"
                    pattern="^\+?[0-9\s()-]{7,20}$"
                    title="Use only numbers and optional +, spaces, hyphens, or parentheses."
                    placeholder="+234 801 234 5678"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="dateOfBirth" className="text-sm font-semibold text-foreground">
                    Date of birth
                  </label>
                  <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-semibold text-foreground">
                    Country
                  </label>
                  <Input id="country" name="country" placeholder="Nigeria" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-semibold text-foreground">
                    State
                  </label>
                  <Input id="state" name="state" placeholder="Lagos" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-semibold text-foreground">
                    City
                  </label>
                  <Input id="city" name="city" placeholder="Lekki" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="residentialAddress" className="text-sm font-semibold text-foreground">
                    Residential address
                  </label>
                  <Textarea
                    id="residentialAddress"
                    name="residentialAddress"
                    className="min-h-28 rounded-2xl"
                    placeholder="Enter your full residential address"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-surface/70 p-5 md:p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-xl font-semibold text-foreground">Identification</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload the identification document you want the admin team to review.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="documentType" className="text-sm font-semibold text-foreground">
                    Identification type
                  </label>
                  <Select id="documentType" name="documentType" defaultValue="" required>
                    <option value="" disabled>
                      Select a document type
                    </option>
                    {documentTypeOptions.map((option) => (
                      <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="documentNumber" className="text-sm font-semibold text-foreground">
                    Document number
                  </label>
                  <Input
                    id="documentNumber"
                    name="documentNumber"
                    placeholder="Enter your ID number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="documentFront" className="text-sm font-semibold text-foreground">
                    ID front
                  </label>
                  <input
                    id="documentFront"
                    name="documentFront"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
                    required
                    className="block w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm file:mr-4 file:rounded-xl file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:font-semibold file:text-primary"
                  />
                  <p className="text-xs leading-6 text-muted-foreground">
                    JPG, PNG, WEBP, HEIC, or HEIF up to 20MB.
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="documentBack" className="text-sm font-semibold text-foreground">
                    ID back
                  </label>
                  <input
                    id="documentBack"
                    name="documentBack"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
                    required
                    className="block w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm file:mr-4 file:rounded-xl file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:font-semibold file:text-primary"
                  />
                  <p className="text-xs leading-6 text-muted-foreground">
                    JPG, PNG, WEBP, HEIC, or HEIF up to 20MB.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-surface/70 p-5 md:p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-xl font-semibold text-foreground">Selfie verification</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload the selfie image you want included with this KYC submission.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="selfieFile" className="text-sm font-semibold text-foreground">
                    Selfie image
                  </label>
                  <input
                    id="selfieFile"
                    name="selfieFile"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
                    required
                    className="block w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm file:mr-4 file:rounded-xl file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:font-semibold file:text-primary"
                  />
                  <p className="text-xs leading-6 text-muted-foreground">
                    JPG, PNG, WEBP, HEIC, or HEIF up to 20MB.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <FormMessage message={modalFeedback} />

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs leading-6 text-muted-foreground">
              {directUploadEnabled
                ? "Large KYC images upload directly to secure storage before submission."
                : "Your KYC files will be submitted together with this form."}
            </p>
            <Button type="submit" disabled={submitting}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
