import Badge from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import { submitAccountFeedbackAction } from "@/actions/feedback";
import { requireAccountProfile } from "@/lib/auth";
import { getProfileFeedback } from "@/lib/data";
import { formatDate } from "@/lib/utils";

const statusVariant = {
  new: "warning",
  reviewed: "info",
  planned: "success",
  closed: "neutral"
} as const;

function labelize(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function AccountFeedbackPage() {
  const profile = await requireAccountProfile();
  const feedback = await getProfileFeedback(profile.id);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(300px,0.45fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Share feedback</CardTitle>
          <CardDescription>Tell us what should be improved.</CardDescription>
        </CardHeader>
        <CardContent>
          <FeedbackForm action={submitAccountFeedbackAction} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your feedback</CardTitle>
          <CardDescription>Recent submissions from this account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {feedback.length === 0 ? (
            <p className="rounded-[22px] bg-surface p-5 text-sm text-muted-foreground">
              No feedback submitted yet.
            </p>
          ) : (
            feedback.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-[22px] bg-surface p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusVariant[item.status]}>{labelize(item.status)}</Badge>
                  <Badge variant="neutral">{labelize(item.category)}</Badge>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {item.message}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
