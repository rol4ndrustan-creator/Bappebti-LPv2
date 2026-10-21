"use client";

// Setup Routing Mapping — maps each registered platform to the institution
// handling it for every other active "Ecosystem Aktif" category. Same
// localStorage + event-bus pattern as the rest of the prototype:
// ROUTING_MAPPINGS in lib/mock-data.ts stays read-only seed data, applied
// edits (only ever written once a Routing change request is approved) live
// here.

import * as React from "react";
import { RoutingMapping } from "../types";
import { subscribe, emitChange, getVersion } from "./event-bus";

const EDITS_KEY = "bappebti-demo-routing-mapping-edits";

type EditMap = Record<string, { mappings: Record<string, string>; updatedAt: string; updatedBy: string }>;

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

export function updateRoutingMapping(platformId: string, mappings: Record<string, string>, updatedBy: string) {
  const edits = readJSON<EditMap>(EDITS_KEY, {});
  const updatedAt = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  edits[platformId] = { mappings, updatedAt, updatedBy };
  writeJSON(EDITS_KEY, edits);
}

export function useRoutingMappings(seed: RoutingMapping[]): RoutingMapping[] {
  const version = React.useSyncExternalStore(subscribe, getVersion, getVersion);
  return React.useMemo(() => {
    const edits = readJSON<EditMap>(EDITS_KEY, {});
    return seed.map((row) => {
      const edit = edits[row.platformId];
      if (!edit) return row;
      return { ...row, mappings: { ...row.mappings, ...edit.mappings }, updatedAt: edit.updatedAt, updatedBy: edit.updatedBy };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  }, [seed, version]);
}
