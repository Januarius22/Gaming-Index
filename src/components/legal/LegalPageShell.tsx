import Link from "next/link";

export default function LegalPageShell({
  eyebrow,
  title,
  summary,
  lastUpdated,
  children
}: Readonly<{
  eyebrow: string;
  title: string;
  summary: string;
  lastUpdated: string;
  children: React.ReactNode;
}>) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(0,87,255,0.12),transparent_58%)]" />
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <div className="relative rounded-[34px] border border-border/75 bg-white/92 p-8 shadow-[0_30px_80px_-45px_rgba(6,43,99,0.42)] backdrop-blur-xl sm:p-10">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-primary/12 bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-primary">
              {eyebrow}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                {summary}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="rounded-full border border-border/80 bg-surface px-3 py-1">
                Last updated {lastUpdated}
              </span>
              <Link
                href="/privacy-policy"
                className="rounded-full border border-border/80 px-3 py-1 transition hover:border-primary/25 hover:bg-primary-soft hover:text-primary"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="rounded-full border border-border/80 px-3 py-1 transition hover:border-primary/25 hover:bg-primary-soft hover:text-primary"
              >
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">{children}</div>
      </div>
    </div>
  );
}
