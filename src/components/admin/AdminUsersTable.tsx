"use client";

import { useEffect, useState, useTransition } from "react";
import { Ban, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  banUserInlineAction,
  restoreDeactivatedUserInlineAction,
  unbanUserInlineAction,
  updateAccountStatusInlineAction
} from "@/actions/admin";
import FormMessage from "@/components/auth/FormMessage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { editableAccountStatuses, getEffectiveAccountStatus } from "@/lib/accountStatus";
import { formatDate } from "@/lib/utils";
import type { AccountStatus, Profile } from "@/types";

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
  const [statusUser, setStatusUser] = useState<Profile | null>(null);
  const [mode, setMode] = useState<"ban" | "unban">("ban");
  const [banReason, setBanReason] = useState("");
  const [accountStatus, setAccountStatus] = useState<AccountStatus>("active");
  const [accountStatusReason, setAccountStatusReason] = useState("");
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

  const openStatusModal = (user: Profile) => {
    const effectiveStatus = getEffectiveAccountStatus(user);
    setStatusUser(user);
    setAccountStatus(
      effectiveStatus.status === "under_review" || effectiveStatus.status === "limited"
        ? effectiveStatus.status
        : "active"
    );
    setAccountStatusReason(effectiveStatus.reason);
  };

  const closeStatusModal = () => {
    setStatusUser(null);
    setAccountStatus("active");
    setAccountStatusReason("");
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
                    banned_by: actionMode === "ban" ? user.banned_by : null,
                    account_status: actionMode === "ban" ? "suspended" : "active",
                    account_status_reason: actionMode === "ban" ? submittedBanReason : ""
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

  const submitStatusAction = (formData: FormData) => {
    const userId = String(formData.get("userId") ?? "");
    setPendingUserId(userId);
    setFeedback(null);

    startTransition(() => {
      void (async () => {
        const result = await updateAccountStatusInlineAction(formData);

        if (result.status === "success" && result.userId) {
          setVisibleUsers((currentUsers) =>
            currentUsers.map((user) =>
              user.id === result.userId
                ? {
                    ...user,
                    account_status: result.accountStatus,
                    account_status_reason: result.accountStatusReason
                  }
                : user
            )
          );
          closeStatusModal();
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
                    deactivation_reason: "",
                    account_status: "active",
                    account_status_reason: ""
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
                <UserRow
                  key={user.id}
                  user={user}
                  pending={pendingUserId === user.id}
                  openBanModal={openBanModal}
                  openUnbanModal={openUnbanModal}
                  openStatusModal={openStatusModal}
                  restoreDeactivatedUser={restoreDeactivatedUser}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(statusUser)}
        title="Update account status"
        description={
          statusUser
            ? `${statusUser.full_name} (@${statusUser.username})`
            : undefined
        }
        panelClassName="max-w-lg"
        onClose={closeStatusModal}
      >
        {statusUser ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitStatusAction(new FormData(event.currentTarget));
            }}
            className="space-y-5"
          >
            <input type="hidden" name="userId" value={statusUser.id} />
            <div className="rounded-3xl border border-border bg-surface p-4 text-sm leading-6 text-muted-foreground">
              Use this for soft account states. Suspensions, deletion, and deactivation still use
              their dedicated actions.
            </div>
            <label className="space-y-2 text-sm font-semibold text-foreground">
              <span>Account status</span>
              <Select
                name="accountStatus"
                value={accountStatus}
                onChange={(event) => setAccountStatus(event.target.value as AccountStatus)}
              >
                {editableAccountStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="space-y-2 text-sm font-semibold text-foreground">
              <span>Reason</span>
              <textarea
                name="accountStatusReason"
                value={accountStatusReason}
                onChange={(event) => setAccountStatusReason(event.target.value)}
                placeholder="Brief internal reason shown where relevant."
                className="min-h-28 w-full rounded-3xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring"
              />
            </label>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" disabled={pendingUserId === statusUser.id} onClick={closeStatusModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={pendingUserId === statusUser.id}>
                {pendingUserId === statusUser.id ? "Saving..." : "Save Status"}
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>

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

function UserRow({
  user,
  pending,
  openBanModal,
  openUnbanModal,
  openStatusModal,
  restoreDeactivatedUser
}: {
  user: Profile;
  pending: boolean;
  openBanModal: (user: Profile) => void;
  openUnbanModal: (user: Profile) => void;
  openStatusModal: (user: Profile) => void;
  restoreDeactivatedUser: (user: Profile) => void;
}) {
  const accountStatus = getEffectiveAccountStatus(user);

  return (
    <tr className="border-b border-border/60 align-top">
      <td className="px-4 py-4 font-medium text-foreground">{user.full_name}</td>
      <td className="px-4 py-4">@{user.username}</td>
      <td className="px-4 py-4">{user.email}</td>
      <td className="px-4 py-4 capitalize">{user.role}</td>
      <td className="px-4 py-4">{formatDate(user.created_at)}</td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={accountStatus.variant}>{accountStatus.label}</Badge>
          <Badge variant={user.seller_enabled ? "info" : "neutral"}>
            {user.seller_enabled ? "Seller enabled" : "Buyer account"}
          </Badge>
        </div>
        {accountStatus.reason ? (
          <p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">
            {accountStatus.reason}
          </p>
        ) : null}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-2">
          {user.role === "admin" ? (
            <span className="text-xs font-semibold text-muted-foreground">Protected</span>
          ) : user.is_deactivated ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="gap-2"
              disabled={pending}
              onClick={() => restoreDeactivatedUser(user)}
            >
              <RotateCcw className="h-4 w-4" />
              {pending ? "Restoring..." : "Restore"}
            </Button>
          ) : user.is_banned ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="gap-2"
              disabled={pending}
              onClick={() => openUnbanModal(user)}
            >
              <RotateCcw className="h-4 w-4" />
              Unban
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="gap-2"
                disabled={pending}
                onClick={() => openStatusModal(user)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Status
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                className="gap-2"
                disabled={pending}
                onClick={() => openBanModal(user)}
              >
                <Ban className="h-4 w-4" />
                Ban
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
