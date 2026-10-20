"use client";

// Manajemen Ekosistem registrations (Bab III item 9). Same localStorage +
// event-bus pattern — ECOSYSTEM_ENTITIES in lib/mock-data.ts stays
// read-only seed data; new registrations and approval decisions are
// layered on top.

import * as React from "react";
import { EcosystemEntity } from "../types";
import { subscribe, emitChange, getVersion } from "./event-bus";

const ADDED_KEY = "bappebti-demo-added-ecosystem";
const DECISIONS_KEY = "bappebti-demo-ecosystem-decisions";

interface Decision {
  status: "Disetujui" | "Ditolak";
  decidedBy: string;
  decidedAt: string;
  rejectionReason?: string;
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

export function addEcosystemEntity(entity: EcosystemEntity) {
  writeJSON(ADDED_KEY, [...readJSON<EcosystemEntity[]>(ADDED_KEY, []), entity]);
}

export function decideEcosystemEntity(id: string, status: "Disetujui" | "Ditolak", decidedBy: string, rejectionReason?: string) {
  const decisions = readJSON<DecisionMap>(DECISIONS_KEY, {});
  decisions[id] = {
    status,
    decidedBy,
    decidedAt: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    rejectionReason,
  };
  writeJSON(DECISIONS_KEY, decisions);
}

export function useEcosystemEntities(seed: EcosystemEntity[]): EcosystemEntity[] {
  const version = React.useSyncExternalStore(subscribe, getVersion, getVersion);
  return React.useMemo(() => {
    const added = readJSON<EcosystemEntity[]>(ADDED_KEY, []);
    const decisions = readJSON<DecisionMap>(DECISIONS_KEY, {});
    return [...seed, ...added].map((e) => {
      const d = decisions[e.id];
      return d ? { ...e, status: d.status, decidedBy: d.decidedBy, decidedAt: d.decidedAt, rejectionReason: d.rejectionReason ?? e.rejectionReason } : e;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  }, [seed, version]);
}
