import { Info } from "lucide-react";

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
          <Info className="h-5 w-5" />
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
        </div>
      </div>
    </div>
  );
}
