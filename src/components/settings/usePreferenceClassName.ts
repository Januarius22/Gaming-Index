"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ProfileSettings } from "@/types";

export function usePreferenceClassName(settings: ProfileSettings) {
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    if (settings.theme_preference !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => setSystemDark(mediaQuery.matches);

    syncTheme();
    mediaQuery.addEventListener("change", syncTheme);

    return () => {
      mediaQuery.removeEventListener("change", syncTheme);
    };
  }, [settings.theme_preference]);

  const darkModeEnabled =
    settings.theme_preference === "dark" ||
    (settings.theme_preference === "system" && systemDark);

  return cn(
    darkModeEnabled && "gi-theme-dark",
    `gi-font-${settings.font_size_preference}`
  );
}
