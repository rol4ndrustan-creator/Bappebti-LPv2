"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * The Detail Pengaduan page's "Kembali" button. Prefers the `from` query
 * param — the exact listing URL (path + its own query, e.g. an active
 * search filter) the viewer actually came from, set by each portal's
 * Manajemen Pengaduan list when it links into a ticket — falling back to
 * the viewer group's default listing route when `from` is absent (direct
 * link, bookmark, etc). This is what keeps the list's filter/search state
 * intact across the round trip instead of losing it to a fresh mount.
 */
function BackLinkInner({ fallbackHref, label }: { fallbackHref: string; label: string }) {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const href = from && from.startsWith("/") ? from : fallbackHref;
  return (
    <Link href={href}>
      <Button variant="secondary" size="sm">
        {label}
      </Button>
    </Link>
  );
}

export function BackLink({ fallbackHref, label = "Kembali ke Daftar" }: { fallbackHref: string; label?: string }) {
  return (
    <Suspense
      fallback={
        <Link href={fallbackHref}>
          <Button variant="secondary" size="sm">
            {label}
          </Button>
        </Link>
      }
    >
      <BackLinkInner fallbackHref={fallbackHref} label={label} />
    </Suspense>
  );
}
