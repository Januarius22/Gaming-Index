"use client";

import { useEffect, useState, useTransition } from "react";
import { Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { archiveUserInlineAction } from "@/actions/admin";
import FormMessage from "@/components/auth/FormMessage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { formatDate, titleCase } from "@/lib/utils";
import type { AdminSuspendedAccount } from "@/types";

export default function AdminSuspendedAccountsTable({
  accounts
}: {
  accounts: AdminSuspendedAccount[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [visibleAccounts, setVisibleAccounts] = useState(accounts);
  const [selectedAccount, setSelectedAccount] = useState<AdminSuspendedAccount | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  useEffect(() => {
    setVisibleAccounts(accounts);
  }, [accounts]);

  const submitArchive = (formData: FormData) => {
    const userId = String(formData.get("userId") ?? "");
    setPendingId(userId);
    setFeedback(null);

    startTransition(() => {
      void (async () => {
        const result = await archiveUserInlineAction(formData);

        if (result.status === "success" && result.userId) {
          setVisibleAccounts((current) => current.filter((account) => account.id !== result.userId));
          setSelectedAccount(null);
          setDeleteReason("");
          router.refresh();
        }

        setFeedback({
          message: result.message,
          tone: result.status === "success" ? "success" : "error"
        });
        setPendingId(null);
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
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Suspension</th>
              <th className="px-4 py-3 font-medium">Appeal</th>
              <th className="px-4 py-3 font-medium">Deadline</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleAccounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No suspended accounts.
                </td>
              </tr>
            ) : (
              visibleAccounts.map((account) => (
                <tr key={account.id} className="border-b border-border/60 align-top">
                  <td className="px-4 py-4">
                    <div className="font-medium text-foreground">{account.full_name}</div>
                    <div className="text-xs text-muted-foreground">
                      @{account.username} - {account.email}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="danger">Suspended</Badge>
                    <p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">
                      {account.banned_reason || "No reason provided."}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {account.banned_at ? formatDate(account.banned_at) : "Date unavailable"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={account.appeal_status === "none" ? "neutral" : account.appeal_status === "pending" ? "warning" : account.appeal_status === "approved" ? "success" : "danger"}>
                      {account.appeal_status === "none" ? "No appeal" : titleCase(account.appeal_status ?? "none")}
                    </Badge>
                    {account.appeal_created_at ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Submitted {formatDate(account.appeal_created_at)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-foreground">
                      {account.appeal_deadline_at ? formatDate(account.appeal_deadline_at) : "Unavailable"}
                    </p>
                    <Badge variant={account.deletion_eligible ? "danger" : "info"}>
                      {account.deletion_eligible ? "Eligible for deletion" : "Appeal window active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      className="gap-2"
                      onClick={() => setSelectedAccount(account)}
                    >
                      <Archive className="h-4 w-4" />
                      Delete account
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(selectedAccount)}
        title="Delete suspended account?"
        description={selectedAccount ? `${selectedAccount.full_name} (@${selectedAccount.username})` : undefined}
        panelClassName="max-w-lg"
        onClose={() => setSelectedAccount(null)}
      >
        {selectedAccount ? (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              submitArchive(new FormData(event.currentTarget));
            }}
          >
            <input type="hidden" name="userId" value={selectedAccount.id} />
            <div className="rounded-3xl border border-rose-100 bg-rose-50 p-4 text-sm leading-6 text-muted-foreground">
              The account will be archived into Deleted Accounts. Orders, disputes, and wallet records remain available for audit.
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-foreground">Archive reason</span>
              <textarea
                name="deleteReason"
                value={deleteReason}
                onChange={(event) => setDeleteReason(event.target.value)}
                required
                className="min-h-28 w-full rounded-3xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring"
                placeholder="Explain why this suspended account is being archived."
              />
            </label>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setSelectedAccount(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" disabled={pendingId === selectedAccount.id}>
                {pendingId === selectedAccount.id ? "Deleting..." : "Delete account"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
