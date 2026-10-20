"use client";

// Manajemen Ekosistem registrations. Same localStorage + event-bus
// pattern — ECOSYSTEM_ENTITIES in lib/mock-data.ts stays read-only seed
// data. New entities (drafts, submitted registrations) are added here;
// edits (including approval decisions) are layered on top as patches.
// The actual approval queue lives in ecosystem-change-store.ts, which
// calls the functions below once a decision is made.

import * as React from "react";
import { EcosystemEntity } from "../types";
import { subscribe, emitChange, getVersion } from "./event-bus";

const ADDED_KEY = "bappebti-demo-added-ecosystem";
const EDITS_KEY = "bappebti-demo-ecosystem-edits";

type EditMap = Record<string, Partial<EcosystemEntity>>;

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

export function addEcosystemEntity(entity: EcosystemEntity) {
  writeJSON(ADDED_KEY, [...readJSON<EcosystemEntity[]>(ADDED_KEY, []), entity]);
}

export function updateEcosystemEntity(id: string, patch: Partial<EcosystemEntity>) {
  const edits = readJSON<EditMap>(EDITS_KEY, {});
  edits[id] = { ...edits[id], ...patch };
  writeJSON(EDITS_KEY, edits);
}

export function setEcosystemEntityPendingEdit(id: string, pending: boolean) {
  updateEcosystemEntity(id, { hasPendingEdit: pending });
}

export function useEcosystemEntities(seed: EcosystemEntity[]): EcosystemEntity[] {
  const version = React.useSyncExternalStore(subscribe, getVersion, getVersion);
  return React.useMemo(() => {
    const added = readJSON<EcosystemEntity[]>(ADDED_KEY, []);
    const edits = readJSON<EditMap>(EDITS_KEY, {});
    return [...seed, ...added].map((e) => (edits[e.id] ? { ...e, ...edits[e.id] } : e));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  }, [seed, version]);
}
