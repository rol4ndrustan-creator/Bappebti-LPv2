import { OwnerType } from "./types";
import { SlaClockStatus } from "./types";

export function formatCurrencyIDR(value?: number): string {
  if (value === undefined || value === null) return "-";
  return "Rp" + value.toLocaleString("id-ID");
}

export function formatDateID(value?: string | Date): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

export function formatDateTimeID(value?: string | Date): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function nowDateTimeID(): string {
  return formatDateTimeID(new Date());
}

export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} menit`;
  if (hours < 24) return `${Math.round(hours)} jam`;
  const days = Math.floor(hours / 24);
  const remHours = Math.round(hours % 24);
  return remHours > 0 ? `${days} hari ${remHours} jam` : `${days} hari`;
}

export function getSlaTone(status: SlaClockStatus): "green" | "amber" | "red" | "navy" | "muted" {
  switch (status) {
    case "Aman":
      return "green";
    case "Perlu Perhatian":
      return "amber";
    case "Mendekati Batas Waktu":
      return "amber";
    case "Lewat Batas Waktu":
      return "red";
    case "Dijeda":
      return "muted";
    case "Selesai":
      return "navy";
    default:
      return "muted";
  }
}

export function getPriorityTone(severity: "Rendah" | "Sedang" | "Tinggi" | "Kritis"): "green" | "amber" | "red" {
  if (severity === "Rendah") return "green";
  if (severity === "Kritis") return "red";
  return "amber";
}

const OWNER_LABEL: Record<OwnerType, string> = {
  Pelapor: "Anda (Pelapor)",
  Platform: "Pelaku usaha (platform)",
  Bursa: "Bursa",
  Kliring: "Lembaga kliring",
  Bappebti: "Bappebti",
};

export function getActionOwnerLabel(owner: OwnerType): string {
  return OWNER_LABEL[owner];
}
