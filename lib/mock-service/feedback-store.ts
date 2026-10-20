"use client";

// Kritik & Saran workflow state (Bab III, item 2). Follows the same
// localStorage + shared event-bus pattern as the other mock-service
// stores — FEEDBACK_LIST in lib/mock-data.ts stays read-only seed data,
// every read/flag/follow-up/PIC change is layered on top as an override
// keyed by feedback id.

import * as React from "react";
import { FeedbackItem } from "../types";
import { subscribe, emitChange, getVersion } from "./event-bus";

const STORAGE_KEY = "bappebti-demo-feedback-overrides";

interface FeedbackOverride {
  read?: boolean;
  flagged?: boolean;
  flagReason?: string;
  needsFollowUp?: boolean;
  followUpStatus?: "Proses" | "Selesai";
  followUpNote?: string;
  pic?: string;
  status?: FeedbackItem["status"];
}

type OverrideMap = Record<string, FeedbackOverride>;

function readOverrides(): OverrideMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OverrideMap) : {};
  } catch {
    return {};
  }
}

function writeOverrides(map: OverrideMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore persistence failures in the prototype
  }
  emitChange();
}

function mutate(id: string, fn: (o: FeedbackOverride) => void) {
  const map = readOverrides();
  const current = map[id] ?? {};
  fn(current);
  map[id] = current;
  writeOverrides(map);
}

export function getMergedFeedback(base: FeedbackItem): FeedbackItem {
  const o = readOverrides()[base.id];
  if (!o) return base;
  return { ...base, ...o };
}

export function markFeedbackRead(id: string) {
  mutate(id, (o) => {
    o.read = true;
  });
}

export function setFeedbackFlag(id: string, flagged: boolean, reason?: string) {
  mutate(id, (o) => {
    o.flagged = flagged;
    o.flagReason = flagged ? reason : undefined;
  });
}

export function setFeedbackFollowUp(id: string, needsFollowUp: boolean) {
  mutate(id, (o) => {
    o.needsFollowUp = needsFollowUp;
    o.followUpStatus = needsFollowUp ? "Proses" : undefined;
  });
}

export function setFollowUpStatus(id: string, status: "Proses" | "Selesai", note?: string) {
  mutate(id, (o) => {
    o.followUpStatus = status;
    if (note) o.followUpNote = note;
  });
}

export function setFeedbackPic(id: string, pic: string, status?: FeedbackItem["status"]) {
  mutate(id, (o) => {
    o.pic = pic;
    if (status) o.status = status;
  });
}

export function setFeedbackStatus(id: string, status: FeedbackItem["status"]) {
  mutate(id, (o) => {
    o.status = status;
  });
}

export function useFeedbackList(seed: FeedbackItem[]): FeedbackItem[] {
  const version = React.useSyncExternalStore(subscribe, getVersion, getVersion);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- version isn't read in the body, it only forces recomputation when the store changes
  return React.useMemo(() => seed.map((f) => getMergedFeedback(f)), [seed, version]);
}
