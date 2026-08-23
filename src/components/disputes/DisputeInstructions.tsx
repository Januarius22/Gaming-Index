import { Info, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";

export default function DisputeInstructions({
  sellerVisible = false,
  locked = false
}: {
  sellerVisible?: boolean;
  locked?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-primary/10 bg-primary-soft/50 p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
          {locked ? (
            <LockKeyhole className="h-5 w-5" />
          ) : sellerVisible ? (
            <UserRound className="h-5 w-5" />
          ) : (
            <Info className="h-5 w-5" />
          )}
        </div>
        <div>
          <p className="font-semibold text-foreground">Case guidance</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {locked
              ? "Gaming Index has locked the discussion while the final review is completed."
              : sellerVisible
                ? "This is a moderated case thread. Keep responses clear and attach evidence where needed."
                : "Gaming Index reviews buyer evidence first. The seller is only invited if admin needs a response."}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 text-xs font-semibold text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Evidence is kept on record
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 text-xs font-semibold text-muted-foreground">
              <LockKeyhole className="h-4 w-4 text-primary" />
              Admin can lock the case
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
