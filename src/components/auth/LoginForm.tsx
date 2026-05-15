"use client";

import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";

const initialState = {
  status: "idle",
  message: ""
} as const;

export default function LoginForm({ showDemoHint }: { showDemoHint: boolean }) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-foreground">
          Email
        </label>
        <Input id="email" name="email" type="email" placeholder="you@example.com" />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-foreground">
          Password
        </label>
        <PasswordInput id="password" name="password" placeholder="Your password" />
      </div>

      <FormMessage message={state.message} />

      {showDemoHint ? (
        <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
          Demo admin login: <span className="font-semibold text-foreground">admin@gamingindex.dev</span>
        </div>
      ) : null}

      <SubmitButton className="w-full" pendingLabel="Signing in...">
        Login
      </SubmitButton>
    </form>
  );
}
