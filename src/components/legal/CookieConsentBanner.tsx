"use client";

import Link from "next/link";
import { Cookie } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

const CONSENT_COOKIE_NAME = "gaming_index_cookie_consent";
const CONSENT_DURATION_SECONDS = 60 * 60 * 24 * 180;

function readConsentCookie() {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE_NAME}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : null;
}

function writeConsentCookie(value: string) {
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(value)}; Max-Age=${CONSENT_DURATION_SECONDS}; Path=/; SameSite=Lax`;
}

export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVisible(!readConsentCookie());
  }, []);

  function handleConsent() {
    writeConsentCookie("accepted");
    setVisible(false);
  }

  if (!mounted || !visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[30px] border border-white/40 bg-slate-950/94 p-5 text-white shadow-[0_30px_70px_-35px_rgba(2,10,24,0.85)] backdrop-blur-2xl sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100">
              <Cookie className="h-3.5 w-3.5" />
              Cookie Notice
            </div>
            <div className="space-y-2">
              <h2 className="font-heading text-xl font-semibold text-white sm:text-2xl">
                We use cookies to keep Gaming Index secure and working.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-200 sm:text-[15px]">
                We use cookies to keep sign-in, saved listings, cart activity, seller flows, and
                session security running. Read our{" "}
                <Link href="/privacy-policy" className="font-semibold text-white underline underline-offset-4">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className="font-semibold text-white underline underline-offset-4">
                  Terms &amp; Conditions
                </Link>{" "}
                before continuing.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="min-w-40" onClick={handleConsent}>
              Accept Cookies
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
