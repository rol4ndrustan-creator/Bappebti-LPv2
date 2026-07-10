"use client";

// Prototype interaction layer for the clarification module. Follows the same
// pattern as store.ts: seed data (CLARIFICATIONS) is read-only, every action
// is recorded as a localStorage-backed override/addition and merged on read,
// and every store shares the same event bus so the UI stays in sync.

import * as React from "react";
import { ClarificationAttachment, ClarificationHistoryEvent, ClarificationRequest, ClarificationStatus } from "../types";
import { nowDateTimeID } from "../format";
import { subscribe, emitChange, getVersion } from "./event-bus";
import { addTimelineEvent } from "./store";
import { CLARIFICATIONS } from "../mock-data";

const STORAGE_KEY = "bappebti-demo-clarification-overrides";
const NEW_STORAGE_KEY = "bappebti-demo-new-clarifications";

interface ClarificationOverride {
  responseDraft?: string;
  formalResponse?: ClarificationRequest["formalResponse"];
  status?: ClarificationStatus;
  dueAt?: string;
  originalDueAt?: string;
  respondedAt?: string;
  completedAt?: string;
  reviewerComments?: string;
  revisionReason?: string;
  requiredCorrections?: string;
  historyAdditions: ClarificationHistoryEvent[];
  responseAttachmentAdditions: ClarificationAttachment[];
  viewedByActors: string[];
}

type OverrideMap = Record<string, ClarificationOverride>;

function emptyOverride(): ClarificationOverride {
  return { historyAdditions: [], responseAttachmentAdditions: [], viewedByActors: [] };
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

function mutate(id: string, fn: (o: ClarificationOverride) => void) {
  const map = readOverrides();
  const current = map[id] ?? emptyOverride();
  fn(current);
  map[id] = current;
  writeOverrides(map);
}

function readNewClarifications(): ClarificationRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NEW_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ClarificationRequest[]) : [];
  } catch {
    return [];
  }
}

function writeNewClarifications(list: ClarificationRequest[]) {
  try {
    window.localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
  emitChange();
}

export function resetClarificationData() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(NEW_STORAGE_KEY);
  } catch {
    // ignore
  }
  emitChange();
}

function historyEvent(partial: Omit<ClarificationHistoryEvent, "id" | "timestamp">): ClarificationHistoryEvent {
  return { ...partial, id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, timestamp: nowDateTimeID() };
}

/** Base seed data plus any clarifications created during this demo session. */
export function getAllClarifications(): ClarificationRequest[] {
  return [...CLARIFICATIONS, ...readNewClarifications()];
}

export function getMergedClarification(id: string): ClarificationRequest | undefined {
  const base = getAllClarifications().find((c) => c.id === id);
  if (!base) return undefined;
  const o = readOverrides()[id];
  if (!o) return base;
  return {
    ...base,
    responseDraft: o.responseDraft ?? base.responseDraft,
    formalResponse: o.formalResponse ?? base.formalResponse,
    status: o.status ?? base.status,
    dueAt: o.dueAt ?? base.dueAt,
    originalDueAt: o.originalDueAt ?? base.originalDueAt,
    respondedAt: o.respondedAt ?? base.respondedAt,
    completedAt: o.completedAt ?? base.completedAt,
    reviewerComments: o.reviewerComments ?? base.reviewerComments,
    revisionReason: o.revisionReason ?? base.revisionReason,
    requiredCorrections: o.requiredCorrections ?? base.requiredCorrections,
    history: [...base.history, ...o.historyAdditions],
    responseAttachments: [...base.responseAttachments, ...o.responseAttachmentAdditions],
  };
}

export function getMergedClarificationsForCase(ticket: string): ClarificationRequest[] {
  return getAllClarifications()
    .filter((c) => c.caseTicket === ticket)
    .map((c) => getMergedClarification(c.id))
    .filter((c): c is ClarificationRequest => !!c);
}

export function saveClarificationDraft(id: string, draft: string) {
  mutate(id, (o) => {
    o.responseDraft = draft;
  });
}

export function submitClarificationResponse(
  id: string,
  formalResponse: NonNullable<ClarificationRequest["formalResponse"]>,
  actor: string,
  role: string,
  institution: string
) {
  const cl = getMergedClarification(id);
  mutate(id, (o) => {
    o.formalResponse = formalResponse;
    o.status = "RESPONDED";
    o.respondedAt = nowDateTimeID();
    o.responseDraft = undefined;
    o.historyAdditions.push(
      historyEvent({
        actor,
        role,
        institution,
        action: "Respons formal dikirim",
        note: formalResponse.summary,
        visibility: "member",
        beforeState: cl?.status,
        afterState: "RESPONDED",
      })
    );
  });
  if (cl) {
    addTimelineEvent(cl.caseTicket, {
      actor,
      role,
      action: `Respons klarifikasi ${id} dikirim`,
      note: formalResponse.summary,
      status: "info",
      visibility: "internal",
    });
  }
}

export function completeClarification(id: string, actor: string, role: string, note?: string) {
  const cl = getMergedClarification(id);
  mutate(id, (o) => {
    o.status = "COMPLETED";
    o.completedAt = nowDateTimeID();
    o.historyAdditions.push(
      historyEvent({
        actor,
        role,
        institution: cl?.requestedBy.institutionName ?? "-",
        action: "Klarifikasi diselesaikan",
        note,
        visibility: "member",
        beforeState: cl?.status,
        afterState: "COMPLETED",
      })
    );
  });
  if (cl) {
    addTimelineEvent(cl.caseTicket, {
      actor,
      role,
      action: `Klarifikasi ${id} diselesaikan`,
      note: note ?? "Respons klarifikasi diterima dan dinyatakan selesai.",
      status: "success",
      visibility: "internal",
    });
  }
}

export function requestClarificationRevision(
  id: string,
  reason: string,
  requiredCorrections: string,
  newDueAt: string,
  actor: string,
  role: string
) {
  const cl = getMergedClarification(id);
  mutate(id, (o) => {
    o.status = "REVISION_REQUESTED";
    o.reviewerComments = reason;
    o.revisionReason = reason;
    o.requiredCorrections = requiredCorrections;
    o.dueAt = newDueAt;
    o.historyAdditions.push(
      historyEvent({
        actor,
        role,
        institution: cl?.requestedBy.institutionName ?? "-",
        action: "Perbaikan respons diminta",
        note: requiredCorrections,
        reason,
        visibility: "member",
        beforeState: cl?.status,
        afterState: "REVISION_REQUESTED",
      })
    );
  });
  if (cl) {
    addTimelineEvent(cl.caseTicket, {
      actor,
      role,
      action: `Perbaikan respons klarifikasi ${id} diminta`,
      note: reason,
      status: "warning",
      visibility: "internal",
    });
  }
}

export function requestAdditionalInformation(id: string, followUpQuestion: string, actor: string, role: string) {
  const cl = getMergedClarification(id);
  const wasOpenForAnswer = cl?.status === "RESPONDED" || cl?.status === "UNDER_REVIEW" || cl?.status === "PARTIALLY_RESPONDED";
  mutate(id, (o) => {
    if (wasOpenForAnswer) o.status = "WAITING_RESPONSE";
    o.historyAdditions.push(
      historyEvent({
        actor,
        role,
        institution: cl?.requestedBy.institutionName ?? "-",
        action: "Informasi tambahan diminta",
        note: followUpQuestion,
        visibility: "member",
        beforeState: cl?.status,
        afterState: wasOpenForAnswer ? "WAITING_RESPONSE" : cl?.status,
      })
    );
  });
}

export function markClarificationPartiallyComplete(id: string, note: string, actor: string, role: string) {
  const cl = getMergedClarification(id);
  mutate(id, (o) => {
    o.status = "PARTIALLY_RESPONDED";
    o.historyAdditions.push(
      historyEvent({
        actor,
        role,
        institution: cl?.requestedBy.institutionName ?? "-",
        action: "Ditandai sebagian lengkap",
        note,
        visibility: "member",
        beforeState: cl?.status,
        afterState: "PARTIALLY_RESPONDED",
      })
    );
  });
}

export function extendClarificationDeadline(
  id: string,
  newDueAt: string,
  reason: string,
  actor: string,
  role: string
) {
  const cl = getMergedClarification(id);
  mutate(id, (o) => {
    if (!cl?.originalDueAt && !o.originalDueAt) o.originalDueAt = cl?.dueAt;
    o.dueAt = newDueAt;
    o.historyAdditions.push(
      historyEvent({
        actor,
        role,
        institution: cl?.requestedBy.institutionName ?? "-",
        action: "Batas waktu diperpanjang",
        note: `Batas waktu baru: ${newDueAt}`,
        reason,
        visibility: "member",
      })
    );
  });
}

export function markClarificationViewed(id: string, actor: string, role: string, institution: string) {
  const map = readOverrides();
  const current = map[id] ?? emptyOverride();
  if (current.viewedByActors.includes(actor)) return;
  current.viewedByActors.push(actor);
  current.historyAdditions.push(
    historyEvent({ actor, role, institution, action: "Klarifikasi dilihat", visibility: "internal" })
  );
  map[id] = current;
  writeOverrides(map);
}

export interface CreateClarificationInput {
  caseTicket: string;
  requestDirection: ClarificationRequest["requestDirection"];
  requestedBy: ClarificationRequest["requestedBy"];
  requestedFrom: ClarificationRequest["requestedFrom"];
  subject: string;
  question: string;
  reason: string;
  requestedFields?: string[];
  requestedEvidenceTypes?: string[];
  priority: ClarificationRequest["priority"];
  dueAt: string;
  visibility: ClarificationRequest["visibility"];
  internalNote?: string;
}

export function createClarification(input: CreateClarificationInput): string {
  const existingForCase = getAllClarifications().filter((c) => c.caseTicket === input.caseTicket);
  const ticketDigits = input.caseTicket.replace(/\D/g, "").slice(-6);
  const nextSeq = String(existingForCase.length + 1).padStart(2, "0");
  const id = `CLR-2026-${ticketDigits}-${nextSeq}`;
  const now = nowDateTimeID();
  const requesterActor = input.requestedBy.userName ?? input.requestedBy.roleLabel;

  const newClarification: ClarificationRequest = {
    id,
    caseTicket: input.caseTicket,
    requestDirection: input.requestDirection,
    requestedBy: input.requestedBy,
    requestedFrom: input.requestedFrom,
    subject: input.subject,
    question: input.question,
    reason: input.reason,
    requestedFields: input.requestedFields,
    requestedEvidenceTypes: input.requestedEvidenceTypes,
    priority: input.priority,
    createdAt: now,
    dueAt: input.dueAt,
    status: "WAITING_RESPONSE",
    attachments: [],
    responseAttachments: [],
    internalNote: input.internalNote,
    history: [
      historyEvent({
        actor: requesterActor,
        role: input.requestedBy.roleLabel,
        institution: input.requestedBy.institutionName,
        action: "Klarifikasi dibuat dan dikirim",
        visibility: "member",
        afterState: "SENT",
      }),
      historyEvent({
        actor: "Sistem",
        role: "Sistem",
        institution: "-",
        action: "Menunggu respons",
        visibility: "member",
        beforeState: "SENT",
        afterState: "WAITING_RESPONSE",
      }),
    ],
    visibility: input.visibility,
  };

  writeNewClarifications([...readNewClarifications(), newClarification]);

  addTimelineEvent(input.caseTicket, {
    actor: requesterActor,
    role: input.requestedBy.roleLabel,
    action: `Klarifikasi baru diajukan kepada ${input.requestedFrom.institutionName}`,
    note: input.subject,
    status: "info",
    visibility: input.visibility.publicReporter ? "public" : "internal",
  });

  return id;
}

// useSyncExternalStore requires getSnapshot to return a stable reference
// between actual changes. getMergedClarification/getAllClarifications build
// new objects/arrays on every call, so every hook below subscribes to the
// (primitive, value-comparable) version counter and recomputes the derived
// data in useMemo instead of inside getSnapshot — otherwise React re-renders
// forever chasing a snapshot that "changes" identity every render.

function useStoreVersion(): number {
  return React.useSyncExternalStore(subscribe, getVersion, getVersion);
}

export function useClarification(id: string): ClarificationRequest | undefined {
  const version = useStoreVersion();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  return React.useMemo(() => getMergedClarification(id), [id, version]);
}

export function useClarificationsForCase(ticket: string): ClarificationRequest[] {
  const version = useStoreVersion();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  return React.useMemo(() => getMergedClarificationsForCase(ticket), [ticket, version]);
}

export function useAllClarifications(): ClarificationRequest[] {
  const version = useStoreVersion();
  return React.useMemo(
    () =>
      getAllClarifications()
        .map((c) => getMergedClarification(c.id))
        .filter((c): c is ClarificationRequest => !!c),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
    [version]
  );
}
