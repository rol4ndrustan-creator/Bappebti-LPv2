"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useInternalAuth } from "@/lib/internal-auth";

/** Gates an internal staff portal (Bappebti, Platform, Ekosistem, Asosiasi, Admin) behind a real typed login at /masuk. */
export function RequireInternalAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, ready } = useInternalAuth();

  React.useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/masuk");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) return null;

  return <>{children}</>;
}
