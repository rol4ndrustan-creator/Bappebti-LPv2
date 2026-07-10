"use client";

// Prototype interaction layer (Section 24 of the product spec).
//
// The mock CASES/NOTIFICATIONS arrays in lib/mock-data.ts are treated as
// read-only seed data. Every simulated user action is recorded here as an
// "override" keyed by ticket and persisted to localStorage, then merged
// on top of the seed data when a case is read. This keeps interactions
// real across a page reload without needing a backend, and gives us a
// single place ("Reset Demo Data") to wipe all simulated state.

import * as React from "react";
import {
  ClarificationMessage,
  ComplaintCase,
  InternalNote,
  InternalWorkflowState,
  PublicStatus,
  ReporterResolutionDecision,
  TimelineEvent,
} from "../types";
import { nowDateTimeID } from "../format";

const STORAGE_KEY = "bappebti-demo-overrides";
const NOTIF_STORAGE_KEY = "bappebti-demo-notifications-read";

interface CaseOverride {
  timelineAdditions: TimelineEvent[];
  clarificationAdditions: ClarificationMessage[];
  internalNoteAdditions: InternalNote[];
  workflowStateOverride?: InternalWorkflowState;
  publicStatusOverride?: PublicStatus;
  resolutionDecision?: ReporterResolutionDecision;
  resolutionDisagreementReason?: string;
  closed?: boolean;
}

type OverrideMap = Record<string, CaseOverride>;

function emptyOverride(): CaseOverride {
  return { timelineAdditions: [], clarificationAdditions: [], internalNoteAdditions: [] };
}

function readOverrides(): OverrideMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OverrideMap) : {};
  } catch {
    return {};
  }
}

function writeOverrides(map: OverrideMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore persistence failures in the prototype
  }
  emitChange();
}

const listeners = new Set<() => void>();
function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function mutate(ticket: string, fn: (o: CaseOverride) => void) {
  const map = readOverrides();
  const current = map[ticket] ?? emptyOverride();
  fn(current);
  map[ticket] = current;
  writeOverrides(map);
}

export function getMergedCase(base: ComplaintCase | undefined): ComplaintCase | undefined {
  if (!base) return undefined;
  const o = readOverrides()[base.ticket];
  if (!o) return base;
  return {
    ...base,
    timeline: [...base.timeline, ...o.timelineAdditions],
    clarifications: [...base.clarifications, ...o.clarificationAdditions],
    internalNotes: [...(base.internalNotes ?? []), ...o.internalNoteAdditions],
    workflowState: o.workflowStateOverride ?? base.workflowState,
    publicStatus: o.publicStatusOverride ?? base.publicStatus,
    status: o.closed ? "Selesai" : base.status,
    resolution: base.resolution
      ? {
          ...base.resolution,
          reporterDecision: o.resolutionDecision ?? base.resolution.reporterDecision,
          reporterDisagreementReason: o.resolutionDisagreementReason ?? base.resolution.reporterDisagreementReason,
        }
      : base.resolution,
  };
}

export function addClarificationReply(ticket: string, from: string, role: string, message: string) {
  mutate(ticket, (o) => {
    o.clarificationAdditions.push({
      from,
      role,
      datetime: nowDateTimeID(),
      message,
      kind: "reply",
    });
    o.timelineAdditions.push({
      datetime: nowDateTimeID(),
      actor: from,
      role,
      action: "Jawaban klarifikasi dikirim",
      note: message,
      status: "info",
      visibility: "public",
    });
  });
}

export function addInternalNote(ticket: string, note: Omit<InternalNote, "timestamp" | "visibility">) {
  mutate(ticket, (o) => {
    o.internalNoteAdditions.push({ ...note, timestamp: nowDateTimeID(), visibility: "internal" });
  });
}

export function addTimelineEvent(
  ticket: string,
  event: Omit<TimelineEvent, "datetime">
) {
  mutate(ticket, (o) => {
    o.timelineAdditions.push({ ...event, datetime: nowDateTimeID() });
  });
}

export function setWorkflowState(
  ticket: string,
  state: InternalWorkflowState,
  publicStatus: PublicStatus,
  auditEvent: Omit<TimelineEvent, "datetime">
) {
  mutate(ticket, (o) => {
    o.workflowStateOverride = state;
    o.publicStatusOverride = publicStatus;
    o.timelineAdditions.push({ ...auditEvent, datetime: nowDateTimeID() });
  });
}

export function respondToResolution(ticket: string, decision: ReporterResolutionDecision, reason?: string) {
  mutate(ticket, (o) => {
    o.resolutionDecision = decision;
    o.resolutionDisagreementReason = reason;
    o.timelineAdditions.push({
      datetime: nowDateTimeID(),
      actor: "Pelapor",
      role: "Pelapor",
      action: `Keputusan pelapor: ${decision}`,
      note: reason ?? "Pelapor memberikan tanggapan atas solusi yang diajukan.",
      status: decision === "Menerima Sepenuhnya" ? "success" : "warning",
      visibility: "public",
    });
  });
}

export function closeCase(ticket: string, reason: string, actor = "Bappebti") {
  mutate(ticket, (o) => {
    o.closed = true;
    o.timelineAdditions.push({
      datetime: nowDateTimeID(),
      actor,
      role: "Bappebti",
      action: "Kasus ditutup",
      note: reason,
      status: "success",
      visibility: "public",
    });
  });
}

export function reopenCase(ticket: string, reason: string, actor = "Bappebti") {
  mutate(ticket, (o) => {
    o.closed = false;
    o.timelineAdditions.push({
      datetime: nowDateTimeID(),
      actor,
      role: "Bappebti",
      action: "Kasus dibuka kembali",
      note: reason,
      status: "warning",
      visibility: "public",
    });
  });
}

export function resetDemoData() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(NOTIF_STORAGE_KEY);
  } catch {
    // ignore
  }
  emitChange();
}

export function useCaseData(base: ComplaintCase | undefined): ComplaintCase | undefined {
  const getSnapshot = React.useCallback(() => getMergedCase(base), [base]);
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// --- Notifications read state ---

function readNotifRead(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NOTIF_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function markNotificationRead(key: string) {
  const read = new Set(readNotifRead());
  read.add(key);
  try {
    window.localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(Array.from(read)));
  } catch {
    // ignore
  }
  emitChange();
}

export function useNotificationReadState(): { isRead: (key: string) => boolean; markRead: (key: string) => void } {
  const snapshot = React.useSyncExternalStore(
    subscribe,
    () => readNotifRead().join(","),
    () => ""
  );
  const readSet = React.useMemo(() => new Set(snapshot ? snapshot.split(",") : []), [snapshot]);
  return {
    isRead: (key: string) => readSet.has(key),
    markRead: markNotificationRead,
  };
}
