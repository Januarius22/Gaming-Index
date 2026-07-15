"use client";

import { useEffect, useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { restoreDeletedUserInlineAction } from "@/actions/admin";
import FormMessage from "@/components/auth/FormMessage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { formatDate, titleCase } from "@/lib/utils";
import type { DeletedAccount } from "@/types";

export default function AdminDeletedAccountsTable({
  accounts
}: {
  accounts: DeletedAccount[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [visibleAccounts, setVisibleAccounts] = useState(accounts);
  const [selectedAccount, setSelectedAccount] = useState<DeletedAccount | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  useEffect(() => {
    setVisibleAccounts(accounts);
  }, [accounts]);

  const submitRestore = (formData: FormData) => {
    const profileId = String(formData.get("profileId") ?? "");
    setPendingId(profileId);
    setFeedback(null);

    startTransition(() => {
      void (async () => {
        const result = await restoreDeletedUserInlineAction(formData);

        if (result.status === "success" && result.userId) {
          setVisibleAccounts((current) => current.filter((account) => account.profile_id !== result.userId));
          setSelectedAccount(null);
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
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Deleted</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleAccounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No deleted accounts.
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
                    <Badge variant={account.seller_enabled ? "info" : "neutral"}>
                      {account.seller_enabled ? "Seller" : titleCase(account.role)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-foreground">{formatDate(account.deleted_at)}</p>
                    {account.banned_at ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Suspended {formatDate(account.banned_at)}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <p className="max-w-sm text-sm leading-6 text-foreground">
                      {account.deleted_reason || "No archive reason provided."}
                    </p>
                    {account.banned_reason ? (
                      <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">
                        Suspension: {account.banned_reason}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="gap-2"
                      onClick={() => setSelectedAccount(account)}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
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
        title="Restore account?"
        description={selectedAccount ? `${selectedAccount.full_name} (@${selectedAccount.username})` : undefined}
        panelClassName="max-w-lg"
        onClose={() => setSelectedAccount(null)}
      >
        {selectedAccount ? (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              submitRestore(new FormData(event.currentTarget));
            }}
          >
            <input type="hidden" name="profileId" value={selectedAccount.profile_id} />
            <div className="rounded-3xl border border-border bg-surface p-4 text-sm leading-6 text-muted-foreground">
              This restores the account record to Suspended Accounts. Use Unban separately if access should be restored.
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setSelectedAccount(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pendingId === selectedAccount.profile_id}>
                {pendingId === selectedAccount.profile_id ? "Restoring..." : "Restore account"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </>
  );
}
