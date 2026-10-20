"use client";

// Approval decisions for the "Approval User & Role" workspace (Bab III
// item 7). Same localStorage + event-bus pattern — APPROVAL_REQUESTS in
// lib/mock-data.ts stays read-only seed data, decisions are layered on
// top as overrides keyed by request id, plus any newly-raised requests.

import * as React from "react";
import { ApprovalRequest } from "../types";
import { subscribe, emitChange, getVersion } from "./event-bus";

const ADDED_KEY = "bappebti-demo-added-approvals";
const DECISIONS_KEY = "bappebti-demo-approval-decisions";

interface Decision {
  status: "Disetujui" | "Ditolak";
  decidedBy: string;
  decidedAt: string;
  reason?: string;
}

type DecisionMap = Record<string, Decision>;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore persistence failures in the prototype
  }
  emitChange();
}

export function addApprovalRequest(request: ApprovalRequest) {
  writeJSON(ADDED_KEY, [...readJSON<ApprovalRequest[]>(ADDED_KEY, []), request]);
}

export function decideApproval(id: string, status: "Disetujui" | "Ditolak", decidedBy: string, reason?: string) {
  const decisions = readJSON<DecisionMap>(DECISIONS_KEY, {});
  decisions[id] = { status, decidedBy, decidedAt: new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }), reason };
  writeJSON(DECISIONS_KEY, decisions);
}

export function useApprovalRequests(seed: ApprovalRequest[]): ApprovalRequest[] {
  const version = React.useSyncExternalStore(subscribe, getVersion, getVersion);
  return React.useMemo(() => {
    const added = readJSON<ApprovalRequest[]>(ADDED_KEY, []);
    const decisions = readJSON<DecisionMap>(DECISIONS_KEY, {});
    return [...seed, ...added].map((r) => {
      const d = decisions[r.id];
      return d ? { ...r, status: d.status, decidedBy: d.decidedBy, decidedAt: d.decidedAt, reason: d.reason ?? r.reason } : r;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  }, [seed, version]);
}
