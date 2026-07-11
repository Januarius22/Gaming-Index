import FormMessage from "@/components/auth/FormMessage";

export default function DisputeNotice({
  notice,
  message
}: {
  notice?: string;
  message?: string;
}) {
  if (notice === "message-sent") {
    return <FormMessage message="Message sent." tone="success" />;
  }

  if (notice === "message-error") {
    return <FormMessage message={message || "Message could not be sent."} tone="error" />;
  }

  if (notice === "order-not-eligible") {
    return <FormMessage message="This order is no longer eligible for dispute review." tone="error" />;
  }

  if (notice === "case-details-required") {
    return <FormMessage message="Select a reason and add a clear description." tone="error" />;
  }

  if (notice === "screenshot-required") {
    return <FormMessage message="At least one screenshot is required to open a dispute." tone="error" />;
  }

  if (notice === "invalid-evidence") {
    return <FormMessage message="Upload up to four screenshots and one short video within the file limits." tone="error" />;
  }

  if (notice === "case-open-failed") {
    return <FormMessage message={message || "Case could not be opened."} tone="error" />;
  }

  return null;
}
