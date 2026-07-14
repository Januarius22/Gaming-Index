import { updateCurrencyRateAction } from "@/actions/admin";
import SubmitButton from "@/components/auth/SubmitButton";
import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { getCurrencyRates } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function AdminCurrenciesPage({
  searchParams
}: {
  searchParams?: Promise<{ notice?: string; error?: string }>;
}) {
  const [{ notice, error }, rates] = await Promise.all([
    searchParams ?? Promise.resolve({} as { notice?: string; error?: string }),
    getCurrencyRates({ includeDisabled: true })
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Currency Rates</CardTitle>
          <CardDescription>
            Gaming Index stores financial values in NGN. These rates only control display
            conversion across the site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notice ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                notice === "rate-saved" || notice === "demo-rate"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {notice === "rate-saved"
                ? "Currency rate saved."
                : notice === "demo-rate"
                  ? "Demo mode keeps rates in code. Connect Supabase to save admin rates."
                  : error || "Currency rate could not be saved."}
            </div>
          ) : null}

          <div className="grid gap-4">
            {rates.map((rate) => (
              <form
                key={rate.code}
                action={updateCurrencyRateAction}
                className="grid gap-4 rounded-[24px] border border-border bg-surface p-4 lg:grid-cols-[0.7fr_1.3fr_0.7fr_1fr_auto_auto]"
              >
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Code
                  </span>
                  <Input name="code" value={rate.code} readOnly />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Name
                  </span>
                  <Input name="name" defaultValue={rate.name} required />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Symbol
                  </span>
                  <Input name="symbol" defaultValue={rate.symbol} required />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    1 {rate.code} in NGN
                  </span>
                  <Input
                    name="ngnRate"
                    type="number"
                    min="0.000001"
                    step="0.000001"
                    defaultValue={rate.ngn_rate}
                    readOnly={rate.code === "NGN"}
                    required
                  />
                </label>
                <label className="flex items-center gap-3 self-end rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-foreground">
                  <input
                    name="enabled"
                    type="checkbox"
                    defaultChecked={rate.enabled}
                    disabled={rate.code === "NGN"}
                    className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                  />
                  Enabled
                </label>
                <div className="flex flex-col justify-end gap-2">
                  <Badge variant={rate.enabled ? "success" : "neutral"}>
                    {rate.enabled ? "Active" : "Off"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{formatDate(rate.updated_at)}</p>
                  <SubmitButton size="sm" pendingLabel="Saving...">
                    Save
                  </SubmitButton>
                </div>
              </form>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
