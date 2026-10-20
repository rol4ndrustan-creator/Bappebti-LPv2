"use client";

// Konfigurasi > Category Ecosystem. Same localStorage + event-bus pattern
// — ECOSYSTEM_CATEGORY_CONFIG in lib/mock-data.ts stays read-only seed
// data. Mutations here are only ever called from the config-approval
// dispatcher once a change has been approved — the UI itself always goes
// through requestConfigChange.

import * as React from "react";
import { EcosystemCategoryConfig } from "../types";
import { subscribe, emitChange, getVersion } from "./event-bus";

const ADDED_KEY = "bappebti-demo-added-ecosystem-categories";
const EDITS_KEY = "bappebti-demo-ecosystem-category-edits";

type EditMap = Record<string, Partial<EcosystemCategoryConfig>>;

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

export function addEcosystemCategory(category: EcosystemCategoryConfig) {
  writeJSON(ADDED_KEY, [...readJSON<EcosystemCategoryConfig[]>(ADDED_KEY, []), category]);
}

export function setEcosystemCategoryActive(id: string, active: boolean) {
  const edits = readJSON<EditMap>(EDITS_KEY, {});
  edits[id] = { ...edits[id], active };
  writeJSON(EDITS_KEY, edits);
}

export function useEcosystemCategoryConfig(seed: EcosystemCategoryConfig[]): EcosystemCategoryConfig[] {
  const version = React.useSyncExternalStore(subscribe, getVersion, getVersion);
  return React.useMemo(() => {
    const added = readJSON<EcosystemCategoryConfig[]>(ADDED_KEY, []);
    const edits = readJSON<EditMap>(EDITS_KEY, {});
    return [...seed, ...added].map((c) => (edits[c.id] ? { ...c, ...edits[c.id] } : c));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  }, [seed, version]);
}
