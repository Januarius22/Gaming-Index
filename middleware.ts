import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type SetAllCookies } from "@supabase/ssr";
import {
  isRecoverableAuthSessionError,
  isSupabaseAuthCookieName
} from "@/lib/supabaseAuth";

function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  request.cookies
    .getAll()
    .filter(({ name }) => isSupabaseAuthCookieName(name))
    .forEach(({ name }) => {
      request.cookies.delete(name);
      response.cookies.delete(name);
    });
}

export async function middleware(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Parameters<SetAllCookies>[0]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  try {
    await supabase.auth.getUser();
  } catch (error) {
    if (isRecoverableAuthSessionError(error)) {
      clearSupabaseAuthCookies(request, response);
      return response;
    }

    throw error;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
