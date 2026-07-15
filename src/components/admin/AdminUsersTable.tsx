"use client";

import { useEffect, useState, useTransition } from "react";
import { Ban, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { banUserInlineAction, restoreDeactivatedUserInlineAction, unbanUserInlineAction } from "@/actions/admin";
import FormMessage from "@/components/auth/FormMessage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types";

export default function AdminUsersTable({
  users,
  returnTo
}: {
  users: Profile[];
  returnTo: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [visibleUsers, setVisibleUsers] = useState(users);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [mode, setMode] = useState<"ban" | "unban">("ban");
  const [banReason, setBanReason] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);

  useEffect(() => {
    setVisibleUsers(users);
  }, [users]);

  const openBanModal = (user: Profile) => {
    setSelectedUser(user);
    setMode("ban");
    setBanReason("");
  };

  const openUnbanModal = (user: Profile) => {
    setSelectedUser(user);
    setMode("unban");
    setBanReason("");
  };

  const closeModal = () => {
    setSelectedUser(null);
    setBanReason("");
  };

  const submitUserAction = (formData: FormData, actionMode: "ban" | "unban") => {
    const userId = String(formData.get("userId") ?? "");
    const submittedBanReason = String(formData.get("banReason") ?? "");
    setPendingUserId(userId);
    setFeedback(null);

    startTransition(() => {
      void (async () => {
        const result =
          actionMode === "ban"
            ? await banUserInlineAction(formData)
            : await unbanUserInlineAction(formData);

        if (result.status === "success" && result.userId) {
          setVisibleUsers((currentUsers) =>
            currentUsers.map((user) =>
              user.id === result.userId
                ? {
                    ...user,
                    is_banned: actionMode === "ban",
                    banned_reason: actionMode === "ban" ? submittedBanReason : "",
                    banned_at: actionMode === "ban" ? new Date().toISOString() : null,
                    banned_by: actionMode === "ban" ? user.banned_by : null
                  }
                : user
            )
          );
          closeModal();
          router.refresh();
        }

        setFeedback({
          message: result.message,
          tone: result.status === "success" ? "success" : "error"
        });
        setPendingUserId(null);
      })();
    });
  };

  const restoreDeactivatedUser = (user: Profile) => {
    const formData = new FormData();
    formData.set("userId", user.id);
    setPendingUserId(user.id);
    setFeedback(null);

    startTransition(() => {
      void (async () => {
        const result = await restoreDeactivatedUserInlineAction(formData);

        if (result.status === "success" && result.userId) {
          setVisibleUsers((currentUsers) =>
            currentUsers.map((currentUser) =>
              currentUser.id === result.userId
                ? {
                    ...currentUser,
                    is_deactivated: false,
                    deactivated_at: null,
                    deactivation_reason: ""
                  }
                : currentUser
            )
          );
          router.refresh();
        }

        setFeedback({
          message: result.message,
          tone: result.status === "success" ? "success" : "error"
        });
        setPendingUserId(null);
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
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Username</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Created Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No users yet.
                </td>
              </tr>
            ) : (
              visibleUsers.map((user) => (
                <tr key={user.id} className="border-b border-border/60 align-top">
                  <td className="px-4 py-4 font-medium text-foreground">{user.full_name}</td>
                  <td className="px-4 py-4">@{user.username}</td>
                  <td className="px-4 py-4">{user.email}</td>
                  <td className="px-4 py-4 capitalize">{user.role}</td>
                  <td className="px-4 py-4">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.is_deactivated ? (
                        <Badge variant="warning">Deactivated</Badge>
                      ) : user.is_banned ? (
                        <Badge variant="danger">Banned</Badge>
                      ) : (
                        <Badge variant={user.seller_enabled ? "info" : "neutral"}>
                          {user.seller_enabled ? "Seller enabled" : "Buyer account"}
                        </Badge>
                      )}
                    </div>
                    {user.is_deactivated && user.deactivation_reason ? (
                      <p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">
                        {user.deactivation_reason}
                      </p>
                    ) : user.is_banned && user.banned_reason ? (
                      <p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">
                        {user.banned_reason}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    {user.role === "admin" ? (
                      <span className="text-xs font-semibold text-muted-foreground">
                        Protected
                      </span>
                    ) : user.is_deactivated ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="gap-2"
                        disabled={pendingUserId === user.id}
                        onClick={() => restoreDeactivatedUser(user)}
                      >
                        <RotateCcw className="h-4 w-4" />
                        {pendingUserId === user.id ? "Restoring..." : "Restore"}
                      </Button>
                    ) : user.is_banned ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="gap-2"
                        onClick={() => openUnbanModal(user)}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Unban
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        className="gap-2"
                        onClick={() => openBanModal(user)}
                      >
                        <Ban className="h-4 w-4" />
                        Ban
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(selectedUser)}
        title={mode === "ban" ? "Ban user?" : "Unban user?"}
        description={
          selectedUser
            ? `${selectedUser.full_name} (@${selectedUser.username})`
            : undefined
        }
        panelClassName="max-w-lg"
        onClose={closeModal}
      >
        {selectedUser ? (
          mode === "ban" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitUserAction(new FormData(event.currentTarget), "ban");
              }}
              className="space-y-5"
            >
              <input type="hidden" name="userId" value={selectedUser.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <div className="rounded-3xl border border-rose-100 bg-rose-50 p-4 text-sm leading-6 text-[#9f1239]">
                This user will still be able to sign in, but app features and seller listings will
                be locked until an admin unbans them.
              </div>
              <div>
                <label
                  htmlFor={`ban-reason-${selectedUser.id}`}
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Ban reason
                </label>
                <textarea
                  id={`ban-reason-${selectedUser.id}`}
                  name="banReason"
                  value={banReason}
                  onChange={(event) => setBanReason(event.target.value)}
                  placeholder="Explain why this user is being suspended."
                  required
                  className="min-h-32 w-full rounded-3xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring"
                />
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" disabled={pendingUserId === selectedUser.id} onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" variant="danger" disabled={pendingUserId === selectedUser.id}>
                  {pendingUserId === selectedUser.id ? "Banning..." : "Ban User"}
                </Button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submitUserAction(new FormData(event.currentTarget), "unban");
              }}
              className="space-y-5"
            >
              <input type="hidden" name="userId" value={selectedUser.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <div className="rounded-3xl border border-border bg-surface p-4 text-sm leading-6 text-muted-foreground">
                This will restore access to app features. Approved unsold listings from this seller
                will be visible again.
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" disabled={pendingUserId === selectedUser.id} onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pendingUserId === selectedUser.id}>
                  {pendingUserId === selectedUser.id ? "Unbanning..." : "Unban User"}
                </Button>
              </div>
            </form>
          )
        ) : null}
      </Modal>
    </>
  );
}
