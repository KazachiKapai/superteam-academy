"use client";

import { useCallback, useEffect, useState } from "react";
import type { IdentitySnapshot } from "@/lib/identity/types";
import { fetchIdentitySnapshot } from "@/lib/services/identity-read-service";
import { useWalletAuth } from "@/components/providers/wallet-auth-provider";

/** Dispatch this event from anywhere to trigger a navbar XP refresh. */
export const IDENTITY_REFRESH_EVENT = "identity:refresh";

export function refreshIdentitySnapshot() {
  window.dispatchEvent(new Event(IDENTITY_REFRESH_EVENT));
}

export function useIdentitySnapshot() {
  const { isAuthenticated } = useWalletAuth();
  const [snapshot, setSnapshot] = useState<IdentitySnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    const next = await fetchIdentitySnapshot();
    setSnapshot(next);
  }, [isAuthenticated]);

  // Listen for refresh events from other components (e.g. lesson completion)
  useEffect(() => {
    const handler = () => void refresh();
    window.addEventListener(IDENTITY_REFRESH_EVENT, handler);
    return () => window.removeEventListener(IDENTITY_REFRESH_EVENT, handler);
  }, [refresh]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSnapshot(null);
      setIsLoading(false);
      return;
    }

    let mounted = true;
    void (async () => {
      setIsLoading(true);
      const next = await fetchIdentitySnapshot();
      if (!mounted) return;
      setSnapshot(next);
      setIsLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  return { snapshot, isLoading, refresh };
}
