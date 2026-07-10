"use client";

import { ClarificationDetailView } from "@/components/clarification/detail-view";

export default function ClarificationDetailClient({ clarificationId }: { clarificationId: string }) {
  return (
    <ClarificationDetailView
      clarificationId={clarificationId}
      listHref="/ekosistem/kliring/klarifikasi"
      caseHrefBase="/bappebti/kasus"
    />
  );
}
