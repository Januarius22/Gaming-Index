"use client";

import { useState, type ReactNode } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import SubmitButton from "@/components/auth/SubmitButton";
import Button, { type ButtonProps } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

export default function LogoutConfirmButton({
  children = "Logout",
  className,
  iconClassName,
  labelClassName,
  title,
  variant = "ghost",
  size = "md"
}: {
  children?: ReactNode;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  title?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        title={title}
        className={className}
        onClick={() => setOpen(true)}
      >
        <LogOut className={cn("h-4 w-4 shrink-0", iconClassName)} />
        <span className={labelClassName}>{children}</span>
      </Button>

      <Modal
        open={open}
        title="Log out?"
        description="You will need to sign in again to access your workspace."
        panelClassName="max-w-md"
        onClose={() => setOpen(false)}
      >
        <div className="space-y-5">
          <div className="rounded-3xl border border-border bg-surface p-4 text-sm leading-6 text-muted-foreground">
            Make sure you have saved any work before leaving this session.
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Stay logged in
            </Button>
            <form action={logoutAction}>
              <SubmitButton pendingLabel="Logging out..." variant="danger" className="w-full sm:w-auto">
                Yes, log out
              </SubmitButton>
            </form>
          </div>
        </div>
      </Modal>
    </>
  );
}
