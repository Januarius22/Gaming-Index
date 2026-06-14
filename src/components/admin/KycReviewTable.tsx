"use client";

import { useEffect, useState, useTransition } from "react";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { reviewKycStatusAction } from "@/actions/admin";
import FormMessage from "@/components/auth/FormMessage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import { formatDate, statusVariant } from "@/lib/utils";
import type { KycSubmission } from "@/types";

function isImageAsset(fileName?: string, assetUrl?: string) {
  const value = `${fileName ?? ""} ${assetUrl ?? ""}`.toLowerCase();
  return [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"].some((extension) =>
    value.includes(extension)
  );
}

function isPdfAsset(fileName?: string, assetUrl?: string) {
  const value = `${fileName ?? ""} ${assetUrl ?? ""}`.toLowerCase();
  return value.includes(".pdf");
}

function UploadedAssetPreview({
  label,
  fileName,
  assetUrl
}: {
  label: string;
  fileName?: string;
  assetUrl?: string;
}) {
  if (!fileName) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white px-4 py-5 text-sm text-muted-foreground">
        {label}: Not captured
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-3 shadow-sm">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{fileName}</p>

      {assetUrl ? (
        isImageAsset(fileName, assetUrl) ? (
          <a href={assetUrl} target="_blank" rel="noreferrer" className="mt-3 block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetUrl}
              alt={label}
              className="h-44 w-full rounded-2xl object-cover"
            />
          </a>
        ) : isPdfAsset(fileName, assetUrl) ? (
          <div className="mt-3 space-y-3">
            <iframe
              src={assetUrl}
              title={label}
              className="h-64 w-full rounded-2xl border border-border bg-white"
            />
            <a
              href={assetUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-xl border border-border px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary-soft"
            >
              Open full file
            </a>
          </div>
        ) : (
          <a
            href={assetUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex rounded-xl border border-border px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary-soft"
          >
            Open file
          </a>
        )
      ) : (
        <div className="mt-3 rounded-xl bg-surface px-3 py-3 text-sm text-muted-foreground">
          Preview unavailable for this older submission.
        </div>
      )}
    </div>
  );
}

export default function KycReviewTable({
  submissions,
  currentPage
}: {
  submissions: KycSubmission[];
  currentPage: number;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [visibleSubmissions, setVisibleSubmissions] = useState(submissions);
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);
  const [rejectingSubmission, setRejectingSubmission] = useState<KycSubmission | null>(null);
  const [pendingSubmissionId, setPendingSubmissionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const selectedState =
    selectedSubmission?.state ||
    selectedSubmission?.state_city?.split("/")[0]?.trim() ||
    "Not provided";
  const selectedCity =
    selectedSubmission?.city ||
    selectedSubmission?.state_city?.split("/")[1]?.trim() ||
    "Not provided";

  useEffect(() => {
    setVisibleSubmissions(submissions);
  }, [submissions]);

  const submitKycReview = (formData: FormData) => {
    const submissionId = String(formData.get("submissionId") ?? "");
    setPendingSubmissionId(submissionId);
    setFeedback(null);

    startTransition(() => {
      void (async () => {
        const result = await reviewKycStatusAction(formData);

        if (result.status === "success" && result.submissionId && result.reviewedStatus) {
          setVisibleSubmissions((currentSubmissions) =>
            currentSubmissions.map((submission) =>
              submission.id === result.submissionId
                ? {
                    ...submission,
                    status: result.reviewedStatus!,
                    rejection_reason: result.rejectionReason
                  }
                : submission
            )
          );
          setRejectingSubmission(null);
          router.refresh();
        }

        setFeedback({
          message: result.message,
          tone: result.status === "success" ? "success" : "error"
        });
        setPendingSubmissionId(null);
      })();
    });
  };

  return (
    <>
      <FormMessage message={feedback?.message} tone={feedback?.tone} />
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-4 py-3 font-medium">Seller Name</th>
              <th className="px-4 py-3 font-medium">Username</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">KYC Status</th>
              <th className="px-4 py-3 font-medium">Submitted Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No KYC submissions yet.
                </td>
              </tr>
            ) : (
              visibleSubmissions.map((submission) => {
                const resolved = submission.status !== "pending";
                const isReviewing = pendingSubmissionId === submission.id;

                return (
                  <tr key={submission.id} className="border-b border-border/60 align-top">
                    <td className="px-4 py-4 font-medium text-foreground">
                      {submission.full_name}
                    </td>
                    <td className="px-4 py-4">@{submission.username}</td>
                    <td className="px-4 py-4">{submission.email}</td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant(submission.status)}>{submission.status}</Badge>
                    </td>
                    <td className="px-4 py-4">{formatDate(submission.created_at)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            submitKycReview(new FormData(event.currentTarget));
                          }}
                        >
                          <input type="hidden" name="submissionId" value={submission.id} />
                          <input type="hidden" name="sellerId" value={submission.seller_id} />
                          <input type="hidden" name="status" value="approved" />
                          <input type="hidden" name="redirectPage" value={currentPage} />
                          <Button size="sm" type="submit" disabled={resolved || isReviewing}>
                            {isReviewing ? "Approving..." : "Approve"}
                          </Button>
                        </form>
                        <Button
                          size="sm"
                          type="button"
                          variant="secondary"
                          disabled={resolved || isReviewing}
                          onClick={() => setRejectingSubmission(submission)}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-2"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(selectedSubmission)}
        onClose={() => setSelectedSubmission(null)}
        title={selectedSubmission ? `${selectedSubmission.full_name} KYC details` : "KYC details"}
        description="Review the seller's submitted identity details before updating approval status."
      >
        {selectedSubmission ? (
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-3xl bg-surface p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Personal info
              </p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>Email: {selectedSubmission.email || "Not provided"}</p>
                <p>Phone: {selectedSubmission.phone_number || "Not provided"}</p>
                <p>Date of birth: {selectedSubmission.date_of_birth || "Not provided"}</p>
                <p>Country: {selectedSubmission.country || "Not provided"}</p>
                <p>State: {selectedState}</p>
                <p>City: {selectedCity}</p>
                <p>Address: {selectedSubmission.residential_address || "Not provided"}</p>
              </div>
            </section>

            <section className="rounded-3xl bg-surface p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Identification
              </p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>Document Type: {selectedSubmission.document_type}</p>
                <p>Document Number: {selectedSubmission.document_number}</p>
              </div>
              <div className="mt-4 grid gap-3">
                <UploadedAssetPreview
                  label="Front of ID"
                  fileName={selectedSubmission.document_front_name}
                  assetUrl={selectedSubmission.document_front_url}
                />
                <UploadedAssetPreview
                  label="Back of ID"
                  fileName={selectedSubmission.document_back_name}
                  assetUrl={selectedSubmission.document_back_url}
                />
              </div>
            </section>

            <section className="rounded-3xl bg-surface p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Selfie verification
              </p>
              <div className="mt-4">
                <UploadedAssetPreview
                  label="Selfie"
                  fileName={selectedSubmission.selfie_file_name}
                  assetUrl={selectedSubmission.selfie_file_url}
                />
              </div>
            </section>

            <section className="rounded-3xl bg-surface p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Submission summary
              </p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>Submitted: {formatDate(selectedSubmission.created_at)}</p>
                <p>Status: {selectedSubmission.status}</p>
                <p>Address provided: {selectedSubmission.residential_address ? "Yes" : "No"}</p>
                {selectedSubmission.rejection_reason ? (
                  <p>Admin note: {selectedSubmission.rejection_reason}</p>
                ) : null}
              </div>
            </section>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(rejectingSubmission)}
        onClose={() => setRejectingSubmission(null)}
        title={rejectingSubmission ? `Reject ${rejectingSubmission.full_name}'s KYC` : "Reject KYC"}
        description="Tell the seller exactly what needs to be corrected before they submit again."
      >
        {rejectingSubmission ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitKycReview(new FormData(event.currentTarget));
            }}
            className="space-y-5"
          >
            <input type="hidden" name="submissionId" value={rejectingSubmission.id} />
            <input type="hidden" name="sellerId" value={rejectingSubmission.seller_id} />
            <input type="hidden" name="status" value="rejected" />
            <input type="hidden" name="redirectPage" value={currentPage} />
            <div className="space-y-2">
              <label
                htmlFor="rejectionReason"
                className="text-sm font-semibold text-foreground"
              >
                What was wrong?
              </label>
              <Textarea
                id="rejectionReason"
                name="rejectionReason"
                placeholder="Example: The ID back image was blurry and the selfie did not clearly match the document photo."
                required
              />
            </div>
            <div className="flex justify-end gap-3">  
              <Button
                variant="secondary"
                type="button"
                disabled={pendingSubmissionId === rejectingSubmission.id}
                onClick={() => setRejectingSubmission(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                type="submit"
                disabled={pendingSubmissionId === rejectingSubmission.id}
              >
                {pendingSubmissionId === rejectingSubmission.id ? "Rejecting..." : "Reject KYC"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
