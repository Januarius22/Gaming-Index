import { Info } from "lucide-react";

export default function DisputeInstructions() {
  return (
    <div className="rounded-3xl border border-primary/10 bg-primary-soft/50 p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
          <Info className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Case guidance</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Share a clear summary of the account concern. Add up to four screenshots and one short
            screen recording if it helps admin review the case.
          </p>
        </div>
      </div>
    </div>
  );
}
