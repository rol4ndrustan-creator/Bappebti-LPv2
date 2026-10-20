"use client";

// Kategori Pengaduan CRUD (Bab III item 10). Same localStorage + event-bus
// pattern — CATEGORY_CONFIG in lib/mock-data.ts stays read-only seed data.

import * as React from "react";
import { ComplaintCategoryConfig } from "../types";
import { subscribe, emitChange, getVersion } from "./event-bus";

const ADDED_KEY = "bappebti-demo-added-categories";
const EDITS_KEY = "bappebti-demo-category-edits";

type EditMap = Record<string, Partial<ComplaintCategoryConfig>>;

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

export function addCategory(category: ComplaintCategoryConfig) {
  writeJSON(ADDED_KEY, [...readJSON<ComplaintCategoryConfig[]>(ADDED_KEY, []), category]);
}

export function setCategoryActive(id: string, active: boolean) {
  const edits = readJSON<EditMap>(EDITS_KEY, {});
  edits[id] = { ...edits[id], active };
  writeJSON(EDITS_KEY, edits);
}

export function useCategoryConfig(seed: ComplaintCategoryConfig[]): ComplaintCategoryConfig[] {
  const version = React.useSyncExternalStore(subscribe, getVersion, getVersion);
  return React.useMemo(() => {
    const added = readJSON<ComplaintCategoryConfig[]>(ADDED_KEY, []);
    const edits = readJSON<EditMap>(EDITS_KEY, {});
    return [...seed, ...added].map((c) => (edits[c.id] ? { ...c, ...edits[c.id] } : c));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  }, [seed, version]);
}
