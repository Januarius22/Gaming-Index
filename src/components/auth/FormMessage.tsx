export default function FormMessage({
  message,
  tone = "error"
}: {
  message?: string;
  tone?: "error" | "success";
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={
        tone === "success"
          ? "rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          : "rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      }
    >
      {message}
    </div>
  );
}
