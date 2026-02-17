"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { type Locale, locales, defaultLocale } from "./config";

export function useLocale(): Locale {
  if (typeof document === "undefined") return defaultLocale;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("locale="));
  const value = match?.split("=")[1] as Locale | undefined;
  return value && locales.includes(value) ? value : defaultLocale;
}

export function useSetLocale() {
  const router = useRouter();
  return useCallback(
    (locale: Locale) => {
      document.cookie = `locale=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
      router.refresh();
    },
    [router],
  );
}
