"use client";

import { useEffect, useState } from "react";
import type { IdentitySnapshot } from "@/lib/identity/types";
import { fetchIdentitySnapshot } from "@/lib/services/identity-read-service";
import { useWalletAuth } from "@/components/providers/wallet-auth-provider";

export function useIdentitySnapshot() {
  const { isAuthenticated } = useWalletAuth();
  const [snapshot, setSnapshot] = useState<IdentitySnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return { snapshot, isLoading };
}
