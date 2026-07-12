"use client";

// Member-level (not case-scoped) supervisory action log used by the
// Bursa/Kliring "Platform Monitoring" and "Supervisory Actions" pages.
// Follows the same localStorage + shared event-bus pattern as the case
// override store so actions logged from one page are immediately visible
// on the other.

import * as React from "react";
import { subscribe, emitChange, getVersion } from "./event-bus";

const STORAGE_KEY = "bappebti-demo-supervisory-actions";

export type SupervisoryActionStatus = "Selesai" | "Menunggu Respon" | "Berjalan";

export interface SupervisoryActionEntry {
  date: string;
  platform: string;
  action: string;
  ticket: string;
  due: string;
  status: SupervisoryActionStatus;
}

function readEntries(): SupervisoryActionEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SupervisoryActionEntry[]) : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: SupervisoryActionEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore persistence failures in the prototype
  }
  emitChange();
}

export function addSupervisoryAction(entry: SupervisoryActionEntry) {
  writeEntries([entry, ...readEntries()]);
}

/** Merges logged entries on top of a page's seed rows, newest first. */
export function useSupervisoryActions(seed: SupervisoryActionEntry[]): SupervisoryActionEntry[] {
  const version = React.useSyncExternalStore(subscribe, getVersion, getVersion);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  return React.useMemo(() => [...readEntries(), ...seed], [seed, version]);
}
