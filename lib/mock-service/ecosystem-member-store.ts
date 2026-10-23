"use client";

// Management Member (List Revisi 3) — Bappebti's CRUD over the Ekosistem
// Active (infrastruktur pasar: Bursa/Kliring/Custody) and Ekosistem
// Pengawas (pelaku usaha di bawah asosiasi) membership directories. Same
// localStorage + event-bus pattern as the other mock-service stores —
// EKOSISTEM_ACTIVE_MEMBERS / EKOSISTEM_PENGAWAS_MEMBERS in lib/mock-data.ts
// stay read-only seed data; additions, edits and removals are layered on
// top. Both the Bappebti CRUD screen and the two portals' read-only "Data
// Member" pages read from the same merged list.

import * as React from "react";
import { EcosystemActiveMember, EcosystemPengawasMember } from "../types";
import { subscribe, emitChange, getVersion } from "./event-bus";

const ACTIVE_ADDED_KEY = "bappebti-demo-added-active-members";
const ACTIVE_EDITS_KEY = "bappebti-demo-active-member-edits";
const ACTIVE_DELETED_KEY = "bappebti-demo-deleted-active-members";

const PENGAWAS_ADDED_KEY = "bappebti-demo-added-pengawas-members";
const PENGAWAS_EDITS_KEY = "bappebti-demo-pengawas-member-edits";
const PENGAWAS_DELETED_KEY = "bappebti-demo-deleted-pengawas-members";

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

// --- Ekosistem Active members -----------------------------------------

export function addActiveMember(member: EcosystemActiveMember) {
  writeJSON(ACTIVE_ADDED_KEY, [...readJSON<EcosystemActiveMember[]>(ACTIVE_ADDED_KEY, []), member]);
}

export function updateActiveMember(id: string, patch: Partial<EcosystemActiveMember>) {
  const edits = readJSON<Record<string, Partial<EcosystemActiveMember>>>(ACTIVE_EDITS_KEY, {});
  edits[id] = { ...edits[id], ...patch };
  writeJSON(ACTIVE_EDITS_KEY, edits);
}

export function deleteActiveMember(id: string) {
  const deleted = new Set(readJSON<string[]>(ACTIVE_DELETED_KEY, []));
  deleted.add(id);
  writeJSON(ACTIVE_DELETED_KEY, Array.from(deleted));
}

export function useEcosystemActiveMembers(seed: EcosystemActiveMember[]): EcosystemActiveMember[] {
  const version = React.useSyncExternalStore(subscribe, getVersion, getVersion);
  return React.useMemo(() => {
    const added = readJSON<EcosystemActiveMember[]>(ACTIVE_ADDED_KEY, []);
    const edits = readJSON<Record<string, Partial<EcosystemActiveMember>>>(ACTIVE_EDITS_KEY, {});
    const deleted = new Set(readJSON<string[]>(ACTIVE_DELETED_KEY, []));
    return [...seed, ...added]
      .filter((m) => !deleted.has(m.id))
      .map((m) => (edits[m.id] ? { ...m, ...edits[m.id] } : m));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  }, [seed, version]);
}

// --- Ekosistem Pengawas members ----------------------------------------

export function addPengawasMember(member: EcosystemPengawasMember) {
  writeJSON(PENGAWAS_ADDED_KEY, [...readJSON<EcosystemPengawasMember[]>(PENGAWAS_ADDED_KEY, []), member]);
}

export function updatePengawasMember(id: string, patch: Partial<EcosystemPengawasMember>) {
  const edits = readJSON<Record<string, Partial<EcosystemPengawasMember>>>(PENGAWAS_EDITS_KEY, {});
  edits[id] = { ...edits[id], ...patch };
  writeJSON(PENGAWAS_EDITS_KEY, edits);
}

export function deletePengawasMember(id: string) {
  const deleted = new Set(readJSON<string[]>(PENGAWAS_DELETED_KEY, []));
  deleted.add(id);
  writeJSON(PENGAWAS_DELETED_KEY, Array.from(deleted));
}

export function useEcosystemPengawasMembers(seed: EcosystemPengawasMember[]): EcosystemPengawasMember[] {
  const version = React.useSyncExternalStore(subscribe, getVersion, getVersion);
  return React.useMemo(() => {
    const added = readJSON<EcosystemPengawasMember[]>(PENGAWAS_ADDED_KEY, []);
    const edits = readJSON<Record<string, Partial<EcosystemPengawasMember>>>(PENGAWAS_EDITS_KEY, {});
    const deleted = new Set(readJSON<string[]>(PENGAWAS_DELETED_KEY, []));
    return [...seed, ...added]
      .filter((m) => !deleted.has(m.id))
      .map((m) => (edits[m.id] ? { ...m, ...edits[m.id] } : m));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  }, [seed, version]);
}
