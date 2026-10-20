"use client";

// SLA Management (Bab III item 10) — a single global response-time SLA in
// hours. Every change appends a new history entry rather than overwriting
// anything, so the full change log is always auditable. Same localStorage
// + event-bus pattern — SLA_HISTORY in lib/mock-data.ts stays read-only
// seed data, new entries are layered on top.

import * as React from "react";
import { SlaConfigEntry } from "../types";
import { subscribe, emitChange, getVersion } from "./event-bus";

const ADDED_KEY = "bappebti-demo-added-sla-history";

function readAdded(): SlaConfigEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ADDED_KEY);
    return raw ? (JSON.parse(raw) as SlaConfigEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAdded(entries: SlaConfigEntry[]) {
  try {
    window.localStorage.setItem(ADDED_KEY, JSON.stringify(entries));
  } catch {
    // ignore persistence failures in the prototype
  }
  emitChange();
}

export function addSlaEntry(entry: SlaConfigEntry) {
  writeAdded([...readAdded(), entry]);
}

/** Full history, newest first — the first item is the currently active SLA. */
export function useSlaHistory(seed: SlaConfigEntry[]): SlaConfigEntry[] {
  const version = React.useSyncExternalStore(subscribe, getVersion, getVersion);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  return React.useMemo(() => [...seed, ...readAdded()].slice().reverse(), [seed, version]);
}
