import { updateKycStatusAction } from "@/actions/admin";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDate, statusVariant } from "@/lib/utils";
import type { KycSubmission } from "@/types";

export default function KycReviewTable({ submissions }: { submissions: KycSubmission[] }) {
  return (
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
            submissions.map((submission) => (
              <tr key={submission.id} className="border-b border-border/60 align-top">
                <td className="px-4 py-4 font-medium text-foreground">{submission.full_name}</td>
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
                      <Button size="sm">Approve</Button>
                    </form>
                    <form action={updateKycStatusAction}>
                      <input type="hidden" name="submissionId" value={submission.id} />
                      <input type="hidden" name="sellerId" value={submission.seller_id} />
                      <input type="hidden" name="status" value="rejected" />
                      <Button size="sm" variant="secondary">
                        Reject
                      </Button>
                    </form>
                    <details>
                      <summary className="cursor-pointer rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground">
                        View
                      </summary>
                      <div className="mt-3 w-64 rounded-2xl border border-border bg-white p-4 text-sm text-muted-foreground shadow-lg">
                        <p>
                          <span className="font-semibold text-foreground">Document Type:</span>{" "}
                          {submission.document_type}
                        </p>
                        <p className="mt-2">
                          <span className="font-semibold text-foreground">Document Number:</span>{" "}
                          {submission.document_number}
                        </p>
                      </div>
                    </details>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
