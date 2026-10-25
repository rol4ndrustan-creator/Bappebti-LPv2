// Shared "which Bursa/Kliring/Custody institution" picklist used by every
// cascading entity-delegation dropdown across the app (Tugas Internal's
// delegation cascade, Catatan Internal's sasaran-entitas cascade, and
// Platform's Manajemen Tugas cascade) — one canonical source instead of
// each form re-filtering ECOSYSTEM_ENTITIES itself.

import { ECOSYSTEM_ENTITIES } from "./mock-data";

export type LembagaType = "Bursa" | "Kliring" | "Custody";

export const ECOSYSTEM_LEMBAGA = ECOSYSTEM_ENTITIES.filter(
  (e) => e.ecosystemType === "Ecosystem Aktif" && (e.category === "Bursa" || e.category === "Kliring" || e.category === "Custody")
).map((e) => ({ id: e.id, name: e.name, type: e.category as LembagaType }));

export function lembagaOptionsFor(type: string): string[] {
  return ECOSYSTEM_LEMBAGA.filter((e) => e.type === type).map((e) => e.name);
}

/** Short acronym for a lembaga's full legal name, e.g. "Kliring Berjangka Indonesia" -> "KBI" — used by entity badges/chips that need to stay compact. */
export function abbreviateLembaga(name: string): string {
  const words = name.replace(/^PT\s+/i, "").split(/\s+/).filter(Boolean);
  const letters = words.map((w) => w[0]).join("").toUpperCase();
  return letters.length > 1 ? letters.slice(0, 4) : name.slice(0, 6);
}
