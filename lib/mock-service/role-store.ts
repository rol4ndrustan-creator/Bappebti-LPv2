"use client";

// Role definitions created via the "Setup Role Access" builder (Bab III
// item 8). Same localStorage + event-bus pattern as the other stores —
// ROLE_DEFINITIONS in lib/mock-data.ts stays read-only seed data.

import * as React from "react";
import { RoleDefinition } from "../types";
import { subscribe, emitChange, getVersion } from "./event-bus";

const ADDED_KEY = "bappebti-demo-added-roles";
const DELETED_KEY = "bappebti-demo-deleted-roles";

function readAdded(): RoleDefinition[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ADDED_KEY);
    return raw ? (JSON.parse(raw) as RoleDefinition[]) : [];
  } catch {
    return [];
  }
}

function writeAdded(roles: RoleDefinition[]) {
  try {
    window.localStorage.setItem(ADDED_KEY, JSON.stringify(roles));
  } catch {
    // ignore persistence failures in the prototype
  }
  emitChange();
}

function readDeleted(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DELETED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeDeleted(ids: string[]) {
  try {
    window.localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
  } catch {
    // ignore persistence failures in the prototype
  }
  emitChange();
}

export function addRole(role: RoleDefinition) {
  writeAdded([...readAdded(), role]);
}

export function deleteRole(id: string) {
  writeDeleted([...readDeleted(), id]);
}

export function useRoles(seed: RoleDefinition[]): RoleDefinition[] {
  const version = React.useSyncExternalStore(subscribe, getVersion, getVersion);
  return React.useMemo(() => {
    const deleted = new Set(readDeleted());
    return [...seed, ...readAdded()].filter((r) => !deleted.has(r.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  }, [seed, version]);
}
