"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { gtagScriptUrl, gtagInitScript } from "@/lib/analytics/gtag";

type AnalyticsProviderProps = {
  children: ReactNode;
};

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const initialized = useRef(false);

  // Defer heavy analytics SDKs until after page is interactive
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = () => {
      import("@/lib/analytics/posthog").then((m) => m.getPostHogClient());
      import("@/lib/analytics/sentry").then((m) => m.initSentry());
    };

    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(init, { timeout: 3000 });
    } else {
      setTimeout(init, 2000);
    }
  }, []);

  useEffect(() => {
    if (pathname) {
      import("@/lib/analytics").then((m) =>
        m.analytics.trackPageView(pathname),
      );
    }
  }, [pathname]);

  const scriptUrl = gtagScriptUrl();
  const initScript = gtagInitScript();

  return (
    <>
      {scriptUrl && <Script src={scriptUrl} strategy="lazyOnload" />}
      {initScript && (
        <Script
          id="gtag-init"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{ __html: initScript }}
        />
      )}
      {children}
    </>
  );
}
