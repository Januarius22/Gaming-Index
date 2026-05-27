"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { updateKycStatusAction } from "@/actions/admin";
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
  const [selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);
  const [rejectingSubmission, setRejectingSubmission] = useState<KycSubmission | null>(null);
  const selectedState =
    selectedSubmission?.state ||
    selectedSubmission?.state_city?.split("/")[0]?.trim() ||
    "Not provided";
  const selectedCity =
    selectedSubmission?.city ||
    selectedSubmission?.state_city?.split("/")[1]?.trim() ||
    "Not provided";

  return (
    <>
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
              submissions.map((submission) => {
                const resolved = submission.status !== "pending";

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
                        <form action={updateKycStatusAction}>
                          <input type="hidden" name="submissionId" value={submission.id} />
                          <input type="hidden" name="sellerId" value={submission.seller_id} />
                          <input type="hidden" name="status" value="approved" />
                          <input type="hidden" name="redirectPage" value={currentPage} />
                          <Button size="sm" type="submit" disabled={resolved}>
                            Approve
                          </Button>
                        </form>
                        <Button
                          size="sm"
                          type="button"
                          variant="secondary"
                          disabled={resolved}
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
                Address verification
              </p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>Proof Type: {selectedSubmission.proof_of_address_type || "Not provided"}</p>
                <p>Submitted: {formatDate(selectedSubmission.created_at)}</p>
                <p>Status: {selectedSubmission.status}</p>
                {selectedSubmission.rejection_reason ? (
                  <p>Admin note: {selectedSubmission.rejection_reason}</p>
                ) : null}
              </div>
              <div className="mt-4">
                <UploadedAssetPreview
                  label="Proof of address"
                  fileName={selectedSubmission.proof_of_address_name}
                  assetUrl={selectedSubmission.proof_of_address_url}
                />
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
          <form action={updateKycStatusAction} className="space-y-5">
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
                placeholder="Example: The ID back image was blurry and the proof of address did not show the full document."
                required
              />
            </div>
            <div className="flex justify-end gap-3">  
              <Button
                variant="secondary"
                type="button"
                onClick={() => setRejectingSubmission(null)}
              >
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Reject KYC
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
