"use client";

import { useState } from "react";
import { Ban, RotateCcw } from "lucide-react";
import { banUserAction, unbanUserAction } from "@/actions/admin";
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
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [mode, setMode] = useState<"ban" | "unban">("ban");
  const [banReason, setBanReason] = useState("");

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

  return (
    <>
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
              users.map((user) => (
                <tr key={user.id} className="border-b border-border/60 align-top">
                  <td className="px-4 py-4 font-medium text-foreground">{user.full_name}</td>
                  <td className="px-4 py-4">@{user.username}</td>
                  <td className="px-4 py-4">{user.email}</td>
                  <td className="px-4 py-4 capitalize">{user.role}</td>
                  <td className="px-4 py-4">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.is_banned ? (
                        <Badge variant="danger">Banned</Badge>
                      ) : (
                        <Badge variant={user.seller_enabled ? "info" : "neutral"}>
                          {user.seller_enabled ? "Seller enabled" : "Buyer account"}
                        </Badge>
                      )}
                    </div>
                    {user.is_banned && user.banned_reason ? (
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
            <form action={banUserAction} className="space-y-5">
              <input type="hidden" name="userId" value={selectedUser.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <div className="rounded-3xl border border-rose-100 bg-rose-50 p-4 text-sm leading-6 text-muted-foreground">
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
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" variant="danger">
                  Ban User
                </Button>
              </div>
            </form>
          ) : (
            <form action={unbanUserAction} className="space-y-5">
              <input type="hidden" name="userId" value={selectedUser.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <div className="rounded-3xl border border-border bg-surface p-4 text-sm leading-6 text-muted-foreground">
                This will restore access to app features. Approved unsold listings from this seller
                will be visible again.
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit">Unban User</Button>
              </div>
            </form>
          )
        ) : null}
      </Modal>
    </>
  );
}
