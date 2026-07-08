import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";
import type { AnalyticsDatum, AnalyticsMetric, AnalyticsTrendDatum } from "@/types";

const chartColors = ["#0057ff", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function AnalyticsMetricGrid({ metrics }: { metrics: AnalyticsMetric[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const content = (
          <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_22px_70px_-42px_rgba(0,87,255,0.45)]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="mt-3 break-words font-heading text-3xl font-semibold tracking-tight text-foreground">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.helper}</p>
                </div>
                {metric.href ? (
                  <span className="rounded-2xl bg-primary-soft p-2 text-primary">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );

        return metric.href ? (
          <Link key={metric.label} href={metric.href} className="block h-full">
            {content}
          </Link>
        ) : (
          <div key={metric.label}>{content}</div>
        );
      })}
    </div>
  );
}

export function TrendChart({
  title,
  description,
  data,
  valueLabel = "Value",
  secondaryLabel,
  secondaryValueKind = "currency"
}: {
  title: string;
  description: string;
  data: AnalyticsTrendDatum[];
  valueLabel?: string;
  secondaryLabel?: string;
  secondaryValueKind?: "count" | "currency";
}) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const points = data
    .map((item, index) => {
      const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
      const y = 100 - (item.value / maxValue) * 78 - 10;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="overflow-hidden rounded-[28px] border border-border/70 bg-surface p-4">
          <svg viewBox="0 0 100 100" className="h-56 w-full" role="img" aria-label={title}>
            <defs>
              <linearGradient id={`${title.replace(/\s+/g, "-")}-line`} x1="0" x2="1">
                <stop offset="0%" stopColor="#0057ff" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            {[20, 40, 60, 80].map((line) => (
              <line
                key={line}
                x1="0"
                x2="100"
                y1={line}
                y2={line}
                stroke="rgba(148,163,184,0.35)"
                strokeWidth="0.4"
              />
            ))}
            <polyline
              fill="none"
              points={points}
              stroke={`url(#${title.replace(/\s+/g, "-")}-line)`}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
            />
            {data.map((item, index) => {
              const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
              const y = 100 - (item.value / maxValue) * 78 - 10;

              return (
                <circle
                  key={`${item.label}-${index}`}
                  cx={x}
                  cy={y}
                  r="2.2"
                  fill="#fff"
                  stroke="#0057ff"
                  strokeWidth="1.2"
                />
              );
            })}
          </svg>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {data.map((item) => (
            <div key={item.label} className="rounded-2xl bg-surface px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 font-heading text-xl font-semibold text-foreground">
                {formatCompactCurrency(item.value)}
              </p>
              {secondaryLabel && typeof item.secondaryValue === "number" ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {secondaryLabel}:{" "}
                  {secondaryValueKind === "currency"
                    ? formatCompactCurrency(item.secondaryValue)
                    : item.secondaryValue}
                </p>
              ) : null}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{valueLabel}</p>
      </CardContent>
    </Card>
  );
}

export function BarListChart({
  title,
  description,
  data,
  valueKind = "count"
}: {
  title: string;
  description: string;
  data: AnalyticsDatum[];
  valueKind?: "count" | "currency" | "decimal";
}) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <EmptyAnalyticsState />
        ) : (
          data.map((item, index) => (
            <div key={`${item.label}-${index}`} className="space-y-2">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-foreground">{item.label}</span>
                <span className="text-muted-foreground">{formatChartValue(item.value, valueKind)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 6 : 0)}%`,
                    backgroundColor: chartColors[index % chartColors.length]
                  }}
                />
              </div>
              {item.helper ? <p className="text-xs text-muted-foreground">{item.helper}</p> : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function DonutChartCard({
  title,
  description,
  data
}: {
  title: string;
  description: string;
  data: AnalyticsDatum[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let offset = 25;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
        <div className="relative mx-auto h-44 w-44">
          <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#edf2f7" strokeWidth="6" />
            {total > 0
              ? data.map((item, index) => {
                  const length = (item.value / total) * 100;
                  const circle = (
                    <circle
                      key={item.label}
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke={chartColors[index % chartColors.length]}
                      strokeWidth="6"
                      strokeDasharray={`${length} ${100 - length}`}
                      strokeDashoffset={offset}
                    />
                  );
                  offset -= length;
                  return circle;
                })
              : null}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="font-heading text-3xl font-semibold text-foreground">{total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
        <div className="space-y-3">
          {data.length === 0 ? (
            <EmptyAnalyticsState />
          ) : (
            data.map((item, index) => (
              <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl bg-surface px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <span className="truncate text-sm font-medium text-foreground">{item.label}</span>
                </div>
                <span className="text-sm text-muted-foreground">{item.value}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsTable({
  title,
  description,
  headers,
  rows
}: {
  title: string;
  description: string;
  headers: string[];
  rows: Array<Array<React.ReactNode>>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyAnalyticsState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="border-b border-border/70 px-4 py-3 font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-border/60 last:border-0">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-4 align-top text-foreground">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SignalList({
  title,
  description,
  signals
}: {
  title: string;
  description: string;
  signals: Array<{ title: string; detail: string; href: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {signals.map((signal) => (
          <Link
            key={signal.title}
            href={signal.href}
            className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-surface px-4 py-3 transition hover:border-primary/25 hover:bg-primary-soft/60"
          >
            <span>
              <span className="block text-sm font-semibold text-foreground">{signal.title}</span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">{signal.detail}</span>
            </span>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function EmptyAnalyticsState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
      No data available yet.
    </div>
  );
}

function formatChartValue(value: number, valueKind: "count" | "currency" | "decimal") {
  if (valueKind === "currency") {
    return formatCurrency(value);
  }

  if (valueKind === "decimal") {
    return value.toFixed(1);
  }

  return String(value);
}
