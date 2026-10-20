"use client";

// User Management CRUD (Bab III item 6). Same localStorage + event-bus
// pattern as the other stores — ADMIN_USERS in lib/mock-data.ts stays
// read-only seed data; additions, edits, and deletions are layered on top
// and persist across reloads.

import * as React from "react";
import { AdminUser } from "../types";
import { subscribe, emitChange, getVersion } from "./event-bus";

const ADDED_KEY = "bappebti-demo-added-users";
const EDITS_KEY = "bappebti-demo-user-edits";
const DELETED_KEY = "bappebti-demo-deleted-users";

type EditMap = Record<string, Partial<AdminUser>>;

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

export function addUser(user: AdminUser) {
  writeJSON(ADDED_KEY, [...readJSON<AdminUser[]>(ADDED_KEY, []), user]);
}

export function editUser(email: string, patch: Partial<AdminUser>) {
  const edits = readJSON<EditMap>(EDITS_KEY, {});
  edits[email] = { ...edits[email], ...patch };
  writeJSON(EDITS_KEY, edits);
}

export function deleteUser(email: string) {
  writeJSON(DELETED_KEY, [...readJSON<string[]>(DELETED_KEY, []), email]);
}

export function useAdminUsers(seed: AdminUser[]): AdminUser[] {
  const version = React.useSyncExternalStore(subscribe, getVersion, getVersion);
  return React.useMemo(() => {
    const added = readJSON<AdminUser[]>(ADDED_KEY, []);
    const edits = readJSON<EditMap>(EDITS_KEY, {});
    const deleted = new Set(readJSON<string[]>(DELETED_KEY, []));
    return [...seed, ...added]
      .filter((u) => !deleted.has(u.email))
      .map((u) => (edits[u.email] ? { ...u, ...edits[u.email] } : u));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  }, [seed, version]);
}
