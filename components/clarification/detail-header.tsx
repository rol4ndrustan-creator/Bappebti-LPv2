"use client";

import Link from "next/link";
import { ClarificationRequest } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ClarificationStatusBadge, ClarificationPriorityBadge, ClarificationDirectionBadge } from "./badges";
import { formatClarificationRemaining } from "@/lib/clarification-workflow";
import { ArrowLeft, ExternalLink, Printer } from "lucide-react";

export function ClarificationDetailHeader({
  clarification,
  listHref,
  caseHref,
}: {
  clarification: ClarificationRequest;
  listHref: string;
  caseHref: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <Link href={listHref} className="inline-flex items-center gap-1 text-xs text-navy hover:underline">
          <ArrowLeft className="size-3.5" /> Kembali ke Daftar Klarifikasi
        </Link>
        <div className="flex items-center gap-2">
          <Link href={caseHref}>
            <Button variant="secondary" size="sm">
              <ExternalLink className="size-3.5" /> Buka Kasus Terkait
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer className="size-3.5" /> Cetak Ringkasan
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <h1 className="text-lg font-semibold text-navy">{clarification.id}</h1>
        <ClarificationStatusBadge status={clarification.status} />
        <ClarificationPriorityBadge priority={clarification.priority} />
        <ClarificationDirectionBadge direction={clarification.requestDirection} />
      </div>
      <p className="text-sm text-foreground font-medium">{clarification.subject}</p>
      <p className="text-xs text-muted mt-0.5">
        Kasus: <Link href={caseHref} className="text-navy hover:underline">{clarification.caseTicket}</Link> ·
        Diminta {clarification.createdAt} · {formatClarificationRemaining(clarification)}
      </p>
    </div>
  );
}
