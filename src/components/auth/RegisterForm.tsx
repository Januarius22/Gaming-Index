"use client";

import { useActionState, useState } from "react";
import { registerAccountAction } from "@/actions/auth";
import FormMessage from "@/components/auth/FormMessage";
import SubmitButton from "@/components/auth/SubmitButton";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { cn, evaluatePasswordStrength } from "@/lib/utils";

const initialState = {
  status: "idle",
  message: ""
} as const;

export default function RegisterForm() {
  const [state, formAction] = useActionState(registerAccountAction, initialState);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordStrength = evaluatePasswordStrength(password);
  const passwordTouched = password.length > 0;
  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;
  const canSubmit =
    password.length > 0 && passwordStrength.valid && confirmPassword.length > 0 && passwordsMatch;

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-semibold text-foreground">
            Full Name
          </label>
          <Input id="fullName" name="fullName" placeholder="John Doe" />
        </div>

        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-semibold text-foreground">
            Username
          </label>
          <Input id="username" name="username" placeholder="shadowfrag" />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-foreground">
            Email
          </label>
          <Input id="email" name="email" type="email" placeholder="john@example.com" />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-foreground">
            Password
          </label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Create password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <div className="space-y-2 rounded-2xl bg-surface/80 px-4 py-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-muted-foreground">Password strength</span>
              <span className={cn("transition", passwordStrength.colorClassName)}>
                {passwordTouched ? passwordStrength.label : "Not set"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((bar) => {
                const active = passwordTouched && passwordStrength.score >= bar + 2;

                return (
                  <span
                    key={bar}
                    className={cn(
                      "h-2 rounded-full bg-border/80 transition",
                      active &&
                        (passwordStrength.score >= 5
                          ? "bg-emerald-500"
                          : passwordStrength.score === 4
                            ? "bg-sky-500"
                            : passwordStrength.score >= 2
                              ? "bg-amber-500"
                              : "bg-rose-500")
                    )}
                  />
                );
              })}
            </div>
            <p
              className={cn(
                "text-xs leading-5",
                passwordTouched && !passwordStrength.valid
                  ? "text-rose-600"
                  : "text-muted-foreground"
              )}
            >
              Use 8+ characters with uppercase, lowercase, number, and symbol.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
            Confirm Password
          </label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          {!passwordsMatch ? (
            <p className="text-sm text-rose-600">Passwords do not match yet.</p>
          ) : null}
        </div>
      </div>

      <FormMessage message={state.message} />

      <SubmitButton className="w-full" pendingLabel="Creating account..." disabled={!canSubmit}>
        Create Account
      </SubmitButton>
    </form>
  );
}
