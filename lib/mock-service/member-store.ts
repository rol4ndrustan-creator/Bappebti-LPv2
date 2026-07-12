"use client";

// Members added via the Admin "Tambah Anggota" flow. Follows the same
// localStorage + shared event-bus pattern as the other mock-service
// stores — MEMBERS in lib/mock-data.ts stays read-only seed data, newly
// registered members are layered on top and persist across reloads.

import * as React from "react";
import { Member } from "../types";
import { subscribe, emitChange, getVersion } from "./event-bus";

const STORAGE_KEY = "bappebti-demo-added-members";

function readAdded(): Member[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Member[]) : [];
  } catch {
    return [];
  }
}

function writeAdded(members: Member[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch {
    // ignore persistence failures in the prototype
  }
  emitChange();
}

export function addMember(member: Member) {
  writeAdded([...readAdded(), member]);
}

/** Merges newly registered members on top of the seeded MEMBERS list. */
export function useMembers(seed: Member[]): Member[] {
  const version = React.useSyncExternalStore(subscribe, getVersion, getVersion);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  return React.useMemo(() => [...seed, ...readAdded()], [seed, version]);
}
