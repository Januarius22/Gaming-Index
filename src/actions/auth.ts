"use server";

import { redirect } from "next/navigation";
import {
  ensureDemoAdminSession,
  getDashboardRoute,
  signOutServerSession
} from "@/lib/auth";
import {
  getDemoProfileByEmail,
  getDemoProfileByUsername,
  setDemoSession,
  upsertDemoProfile
} from "@/lib/demoStore";
import { hasSupabaseEnv } from "@/lib/supabaseClient";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { evaluatePasswordStrength, getNigeriaTimestamp } from "@/lib/utils";
import type { LoginActionState, RegisterActionState } from "@/types";

export async function registerAccountAction(
  _prevState: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!fullName || !username || !email || !password || !confirmPassword) {
    return {
      status: "error",
      message: "Please complete all registration fields."
    };
  }

  if (!evaluatePasswordStrength(password).valid) {
    return {
      status: "error",
      message:
        "Use at least 8 characters with uppercase, lowercase, number, and symbol."
    };
  }

  if (password !== confirmPassword) {
    return {
      status: "error",
      message: "Passwords do not match."
    };
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username,
          role: "user",
          seller_enabled: false,
          kyc_status: "not_started"
        }
      }
    });

    if (error) {
      return {
        status: "error",
        message: error.message
      };
    }

    redirect("/account/welcome");
  }

  const usernameExists = await getDemoProfileByUsername(username);
  const emailExists = await getDemoProfileByEmail(email);

  if (usernameExists || emailExists) {
    return {
      status: "error",
      message: "An account with that username or email already exists."
    };
  }

  const profile = {
    id: crypto.randomUUID(),
    full_name: fullName,
    username,
    email,
    role: "user" as const,
    seller_enabled: false,
    kyc_status: "not_started" as const,
    is_banned: false,
    banned_at: null,
    banned_reason: "",
    banned_by: null,
    created_at: getNigeriaTimestamp()
  };

  await upsertDemoProfile(profile);
  await setDemoSession(profile.id);
  redirect("/account/welcome");
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      status: "error",
      message: "Email and password are required."
    };
  }

  if (hasSupabaseEnv) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase!.auth.signInWithPassword({ email, password });

    if (error) {
      return {
        status: "error",
        message: error.message
      };
    }

    const {
      data: { user }
    } = await supabase!.auth.getUser();

    const { data: profile } = await supabase!
      .from("profiles")
      .select("*")
      .eq("id", user?.id ?? "")
      .maybeSingle();

    if (profile?.is_banned && profile.role !== "admin") {
      redirect("/account-suspended");
    }

    if (profile?.role === "admin") {
      redirect("/admin/dashboard");
    }

    redirect("/account/dashboard");
  }

  if (email === "admin@gamingindex.dev") {
    const adminProfile = await ensureDemoAdminSession();
    redirect(getDashboardRoute(adminProfile.role));
  }

  const profile = await getDemoProfileByEmail(email);

  if (!profile) {
    return {
      status: "error",
      message: "No demo account matches that email. Register first or use admin@gamingindex.dev."
    };
  }

  if (profile.is_banned && profile.role !== "admin") {
    await setDemoSession(profile.id);
    redirect("/account-suspended");
  }

  await setDemoSession(profile.id);
  redirect(getDashboardRoute(profile.role));
}

export async function logoutAction() {
  await signOutServerSession();
  redirect("/auth/login");
}
