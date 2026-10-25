"use client";

// Syncs a single piece of UI state (e.g. a list page's search filter) with
// a URL query param, so the state round-trips through navigation: a link
// built from the current pathname+query (see components/shared/back-link.tsx's
// `from` param) can restore it on the way back, instead of losing it to a
// fresh component mount the way plain useState would.
//
// Must be used inside a component wrapped in <Suspense> (useSearchParams
// requirement for static export) — see the pengaduan list pages for the
// established split pattern.

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function useQueryParamState(key: string): [string, (next: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get(key) ?? "";

  const setValue = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set(key, next);
      else params.delete(key);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [key, pathname, router, searchParams]
  );

  return [value, setValue];
}

/** The current pathname+query, URL-encoded for use as a `from` link param. */
export function useCurrentPathWithQuery(): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
