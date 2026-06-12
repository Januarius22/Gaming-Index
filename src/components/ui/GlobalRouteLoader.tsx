"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AppLoader from "@/components/ui/AppLoader";

const MIN_LOADER_DURATION_MS = 5000;

export default function GlobalRouteLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);

    const timeout = window.setTimeout(() => {
      setVisible(false);
    }, MIN_LOADER_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white">
      <AppLoader />
    </div>
  );
}
