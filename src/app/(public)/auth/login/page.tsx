import LoginForm from "@/components/auth/LoginForm";
import { redirectIfAuthenticated } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/supabaseClient";

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return <LoginForm showDemoHint={!hasSupabaseEnv} />;
}
