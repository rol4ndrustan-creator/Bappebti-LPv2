"use client";

// Approval Ekosistem queue. Every new registration and every edit to an
// existing entity is staged here; approving a "Pendaftaran Baru" marks
// the (already-created, status "Menunggu Verifikasi") entity Disetujui,
// approving a "Perubahan Data" applies the staged after-values on top of
// the live entity. Rejecting a new registration marks it Ditolak;
// rejecting an edit just clears the pending-edit flag without touching
// the entity's live data.

import * as React from "react";
import { EcosystemCategoryConfig, EcosystemChangeRequest, EcosystemEntity } from "../types";
import { subscribe, emitChange, getVersion } from "./event-bus";
import { updateEcosystemEntity, setEcosystemEntityPendingEdit } from "./ecosystem-store";
import { addEcosystemCategory, updateEcosystemCategory } from "./ecosystem-category-store";
import { nowDateTimeID } from "../format";

const ADDED_KEY = "bappebti-demo-added-ecosystem-changes";
const DECISIONS_KEY = "bappebti-demo-ecosystem-change-decisions";

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

export function requestEcosystemChange(input: Omit<EcosystemChangeRequest, "id" | "status" | "requestedAt">): EcosystemChangeRequest {
  const request: EcosystemChangeRequest = {
    ...input,
    id: `ECR-${Date.now().toString(36).toUpperCase()}`,
    requestedAt: nowDateTimeID(),
    status: "Menunggu",
  };
  writeJSON(ADDED_KEY, [...readJSON<EcosystemChangeRequest[]>(ADDED_KEY, []), request]);
  if (request.changeType === "Perubahan Data") {
    setEcosystemEntityPendingEdit(request.entityId, true);
  }
  return request;
}

export function decideEcosystemChange(req: EcosystemChangeRequest, status: "Disetujui" | "Ditolak", decidedBy: string, reason?: string) {
  const decidedAt = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  if (req.targetType === "Kategori Ekosistem") {
    if (status === "Disetujui") {
      if (req.changeType === "Tambah Kategori") {
        addEcosystemCategory(req.after as EcosystemCategoryConfig);
      } else if (req.changeType === "Nonaktifkan Kategori" || req.changeType === "Aktifkan Kategori") {
        updateEcosystemCategory(req.entityId, { active: req.changeType === "Aktifkan Kategori" });
      }
    }
    // Rejecting a category request is a no-op: nothing was applied yet for
    // "Tambah Kategori", and a disable/enable request simply never takes effect.
  } else if (status === "Disetujui") {
    if (req.changeType === "Pendaftaran Baru") {
      updateEcosystemEntity(req.entityId, { status: "Disetujui", decidedBy, decidedAt });
    } else {
      updateEcosystemEntity(req.entityId, { ...(req.after as EcosystemEntity), status: "Disetujui", hasPendingEdit: false, decidedBy, decidedAt });
    }
  } else {
    if (req.changeType === "Pendaftaran Baru") {
      updateEcosystemEntity(req.entityId, { status: "Ditolak", decidedBy, decidedAt, rejectionReason: reason });
    } else {
      setEcosystemEntityPendingEdit(req.entityId, false);
    }
  }

  const decisions = readJSON<DecisionMap>(DECISIONS_KEY, {});
  decisions[req.id] = { status, decidedBy, decidedAt: nowDateTimeID(), reason };
  writeJSON(DECISIONS_KEY, decisions);
}

export function useEcosystemChangeRequests(seed: EcosystemChangeRequest[]): EcosystemChangeRequest[] {
  const version = React.useSyncExternalStore(subscribe, getVersion, getVersion);
  return React.useMemo(() => {
    const added = readJSON<EcosystemChangeRequest[]>(ADDED_KEY, []);
    const decisions = readJSON<DecisionMap>(DECISIONS_KEY, {});
    return [...seed, ...added].map((r) => {
      const d = decisions[r.id];
      return d ? { ...r, status: d.status, decidedBy: d.decidedBy, decidedAt: d.decidedAt, reason: d.reason ?? r.reason } : r;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  }, [seed, version]);
}
