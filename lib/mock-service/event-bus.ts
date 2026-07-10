"use client";

// Shared change-notification bus for the mock-service layer. Every
// localStorage-backed store (cases, clarifications) emits through this same
// bus so any component subscribed via useSyncExternalStore re-renders
// regardless of which store produced the mutation.

const listeners = new Set<() => void>();
let version = 0;

export function emitChange() {
  version++;
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * A primitive counter is safe to return directly from useSyncExternalStore
 * (numbers compare by value). Derived arrays/objects must NOT be recomputed
 * inside getSnapshot itself — recompute them in a useMemo keyed on this
 * version instead, or every render creates a new reference and React loops.
 */
export function getVersion(): number {
  return version;
}
