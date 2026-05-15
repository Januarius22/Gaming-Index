import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import { hasSupabaseEnv } from "@/lib/supabaseClient";

export async function getSupabaseServerClient() {
  if (!hasSupabaseEnv) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server components may read session state without being allowed to mutate cookies.
          }
        }
      }
    }
  );
}
