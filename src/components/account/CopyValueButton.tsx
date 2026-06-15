"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import Button from "@/components/ui/Button";

export default function CopyValueButton({
  value,
  label = "Copy"
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyValue = async () => {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="gap-2 rounded-2xl"
      onClick={copyValue}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : label}
    </Button>
  );
}
