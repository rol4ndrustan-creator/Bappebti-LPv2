"use client";

// Approval Routing queue. Every routing mapping change (new or edited) is
// staged here first; approving applies the staged `after` mapping to the
// live routing-store, rejecting leaves the live mapping untouched.
// `before`/`after` hold the same shape as RoutingMapping.mappings — category
// shortDescription -> mapped EcosystemEntity.id (display names are resolved
// in the UI from the current entity list).

import * as React from "react";
import { RoutingChangeRequest } from "../types";
import { subscribe, emitChange, getVersion } from "./event-bus";
import { updateRoutingMapping } from "./routing-store";
import { nowDateTimeID } from "../format";

const ADDED_KEY = "bappebti-demo-added-routing-changes";
const DECISIONS_KEY = "bappebti-demo-routing-change-decisions";

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

export function requestRoutingChange(input: Omit<RoutingChangeRequest, "id" | "status" | "requestedAt">): RoutingChangeRequest {
  const request: RoutingChangeRequest = {
    ...input,
    id: `RTR-${Date.now().toString(36).toUpperCase()}`,
    requestedAt: nowDateTimeID(),
    status: "Menunggu",
  };
  writeJSON(ADDED_KEY, [...readJSON<RoutingChangeRequest[]>(ADDED_KEY, []), request]);
  return request;
}

export function decideRoutingChange(req: RoutingChangeRequest, status: "Disetujui" | "Ditolak", decidedBy: string, reason?: string) {
  if (status === "Disetujui") {
    updateRoutingMapping(req.platformId, req.after, decidedBy);
  }

  const decisions = readJSON<DecisionMap>(DECISIONS_KEY, {});
  decisions[req.id] = { status, decidedBy, decidedAt: nowDateTimeID(), reason };
  writeJSON(DECISIONS_KEY, decisions);
}

export function useRoutingChangeRequests(seed: RoutingChangeRequest[]): RoutingChangeRequest[] {
  const version = React.useSyncExternalStore(subscribe, getVersion, getVersion);
  return React.useMemo(() => {
    const added = readJSON<RoutingChangeRequest[]>(ADDED_KEY, []);
    const decisions = readJSON<DecisionMap>(DECISIONS_KEY, {});
    return [...seed, ...added].map((r) => {
      const d = decisions[r.id];
      return d ? { ...r, status: d.status, decidedBy: d.decidedBy, decidedAt: d.decidedAt, reason: d.reason ?? r.reason } : r;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  }, [seed, version]);
}
