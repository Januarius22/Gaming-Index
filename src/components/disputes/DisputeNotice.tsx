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

  return null;
}
