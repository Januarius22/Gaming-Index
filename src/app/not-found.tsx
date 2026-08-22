import Link from "next/link";
import { ArrowLeft, Gamepad2, Search } from "lucide-react";
import BrandLogo from "@/components/branding/BrandLogo";

export default function NotFound() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#eaf2ff_0,#f8fbff_34%,#ffffff_70%)] text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 top-28 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute -left-28 bottom-12 h-80 w-80 rounded-full bg-sky-100/80 blur-3xl" />
        <div className="absolute bottom-24 right-16 h-40 w-40 rounded-full bg-amber-100/60 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl rounded-[32px] border border-blue-100 bg-white/92 p-6 text-center shadow-[0_28px_90px_rgba(0,47,125,0.14)] backdrop-blur sm:p-10 lg:p-12">
          <div className="mx-auto mb-8 flex justify-center">
            <BrandLogo
              showTagline={false}
              markClassName="h-12 w-12"
              className="justify-center"
            />
          </div>

          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-[32px] border border-blue-100 bg-blue-50 shadow-inner">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm">
              <Gamepad2 className="h-10 w-10 text-primary" strokeWidth={2.2} />
              <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-black text-amber-700">
                !
              </span>
            </div>
          </div>

          <p className="font-heading text-7xl font-black leading-none text-primary sm:text-8xl">
            404
          </p>
          <h1 className="mt-5 font-heading text-3xl font-bold text-foreground sm:text-5xl">
            Page not found
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            This page may have moved or is no longer available.
          </p>

          <div className="mx-auto mt-9 grid max-w-lg gap-3 sm:grid-cols-2">
            <Link
              href="/"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 text-base font-semibold text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to home
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-base font-semibold text-white shadow-[0_18px_36px_rgba(0,87,255,0.24)] transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Search className="h-5 w-5" />
              Browse marketplace
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
