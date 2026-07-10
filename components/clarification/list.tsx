"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClarificationRequest } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  ClarificationViewer,
  describeClarificationRelation,
  formatClarificationRemaining,
  getClarificationActionButtonLabel,
  getClarificationActionLabel,
  getLastResponseSummary,
  getViewerRelation,
} from "@/lib/clarification-workflow";
import { ClarificationStatusBadge, ClarificationDirectionBadge } from "./badges";
import { EmptyState } from "@/components/shared/empty-state";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

function sortForViewer(clarifications: ClarificationRequest[], viewer: ClarificationViewer): ClarificationRequest[] {
  return [...clarifications].sort((a, b) => {
    const aActor = getViewerRelation(a, viewer) === "actor" ? 0 : 1;
    const bActor = getViewerRelation(b, viewer) === "actor" ? 0 : 1;
    if (aActor !== bActor) return aActor - bActor;
    return a.dueAt.localeCompare(b.dueAt);
  });
}

export function ClarificationList({
  clarifications,
  viewer,
  basePath,
  emptyDescription,
}: {
  clarifications: ClarificationRequest[];
  viewer: ClarificationViewer;
  basePath: string;
  emptyDescription?: string;
}) {
  const sorted = sortForViewer(clarifications, viewer);

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Tidak ada klarifikasi yang sesuai"
        description={emptyDescription ?? "Tidak ada permintaan klarifikasi yang cocok dengan filter saat ini."}
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[13%]">Tiket</TableHead>
              <TableHead className="w-[22%]">Subjek Klarifikasi</TableHead>
              <TableHead className="w-[18%]">Permintaan Dari / Menunggu Jawaban Dari</TableHead>
              <TableHead className="w-[13%]">Tanggal Permintaan</TableHead>
              <TableHead className="w-[13%]">Batas Waktu</TableHead>
              <TableHead className="w-[12%]">Status</TableHead>
              <TableHead className="w-[9%]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((c) => (
              <ClarificationListRow key={c.id} clarification={c} viewer={viewer} basePath={basePath} />
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-3 md:hidden">
        {sorted.map((c) => (
          <ClarificationMobileCard key={c.id} clarification={c} viewer={viewer} basePath={basePath} />
        ))}
      </div>
    </>
  );
}

export function ClarificationListRow({
  clarification,
  viewer,
  basePath,
}: {
  clarification: ClarificationRequest;
  viewer: ClarificationViewer;
  basePath: string;
}) {
  const router = useRouter();
  const href = `${basePath}/${clarification.id}`;
  const relation = getViewerRelation(clarification, viewer);
  const lastResponse = getLastResponseSummary(clarification);

  return (
    <TableRow
      className={cn("cursor-pointer", relation === "actor" && "border-l-2 border-l-amber")}
      onClick={() => router.push(href)}
    >
      <TableCell className="whitespace-nowrap">
        <Link href={href} className="font-medium text-navy hover:underline" onClick={(e) => e.stopPropagation()}>
          {clarification.caseTicket}
        </Link>
        <p className="text-[11px] text-muted">{clarification.id}</p>
      </TableCell>
      <TableCell className="max-w-[260px]">
        <p className="truncate font-medium" title={clarification.subject}>
          {clarification.subject}
        </p>
        <div className="mt-1">
          <ClarificationDirectionBadge direction={clarification.requestDirection} />
        </div>
      </TableCell>
      <TableCell className="text-xs text-foreground/80">{describeClarificationRelation(clarification)}</TableCell>
      <TableCell className="whitespace-nowrap text-muted text-xs">{clarification.createdAt}</TableCell>
      <TableCell className="whitespace-nowrap text-xs">
        <p className="font-medium text-foreground">{clarification.dueAt}</p>
        <p className="text-muted">{formatClarificationRemaining(clarification)}</p>
      </TableCell>
      <TableCell>
        <ClarificationStatusBadge status={clarification.status} />
        <p className="text-[11px] text-muted mt-1">{getClarificationActionLabel(clarification, viewer)}</p>
        {lastResponse && (
          <p className="text-[11px] text-muted mt-0.5 max-w-[200px] truncate" title={lastResponse.text}>
            {lastResponse.text.slice(0, 100)}
            {lastResponse.text.length > 100 ? "…" : ""} · {lastResponse.responder}
          </p>
        )}
      </TableCell>
      <TableCell>
        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); router.push(href); }}>
          {getClarificationActionButtonLabel(clarification, viewer)}
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function ClarificationMobileCard({
  clarification,
  viewer,
  basePath,
}: {
  clarification: ClarificationRequest;
  viewer: ClarificationViewer;
  basePath: string;
}) {
  const relation = getViewerRelation(clarification, viewer);
  return (
    <Link
      href={`${basePath}/${clarification.id}`}
      className={cn(
        "block rounded-lg border bg-card p-3 hover:bg-muted-bg/40 transition-colors",
        relation === "actor" ? "border-l-2 border-l-amber border-border" : "border-border"
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-sm font-semibold text-navy">{clarification.caseTicket}</span>
        <ClarificationStatusBadge status={clarification.status} />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">{clarification.subject}</p>
      <p className="text-xs text-foreground/80 mb-2">{describeClarificationRelation(clarification)}</p>
      <div className="flex items-center justify-between text-[11px] text-muted">
        <span>{clarification.dueAt}</span>
        <span>{formatClarificationRemaining(clarification)}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] font-medium text-amber">{getClarificationActionLabel(clarification, viewer)}</span>
        <Button size="sm" variant="outline">
          {getClarificationActionButtonLabel(clarification, viewer)}
        </Button>
      </div>
    </Link>
  );
}
