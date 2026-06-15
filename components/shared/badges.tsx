import { Badge, badgeVariants } from "@/components/ui/badge";
import { CaseStatus, OwnerType, Responsibility, Severity, SlaStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

export function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, BadgeVariant> = {
    Rendah: "green",
    Sedang: "amber",
    Tinggi: "amber",
    Kritis: "red",
  };
  return <Badge variant={map[severity]}>{severity.toUpperCase()}</Badge>;
}

export function StatusBadge({ status }: { status: CaseStatus }) {
  const map: Record<CaseStatus, BadgeVariant> = {
    Baru: "navy",
    Verifikasi: "navy",
    Diproses: "amber",
    "Menunggu Klarifikasi": "amber",
    "Resolusi Diajukan": "green",
    Selesai: "green",
    Ditolak: "red",
  };
  return <Badge variant={map[status]}>{status.toUpperCase()}</Badge>;
}

export function OwnerBadge({ owner }: { owner: OwnerType }) {
  const map: Record<OwnerType, BadgeVariant> = {
    Pelapor: "outline",
    Platform: "navy",
    Bursa: "navy",
    Kliring: "navy",
    Bappebti: "default",
  };
  const label: Record<OwnerType, string> = {
    Pelapor: "Public User",
    Platform: "Platform / Pialang",
    Bursa: "Bursa",
    Kliring: "Kliring",
    Bappebti: "Bappebti Regulator",
  };
  return <Badge variant={map[owner]}>{label[owner]}</Badge>;
}

export function ResponsibilityBadge({ responsibility }: { responsibility: Responsibility }) {
  const map: Record<Responsibility, BadgeVariant> = {
    "BAPPEBTI OWNED": "red",
    "MEMBER ASSIGNED": "navy",
    "WAITING PUBLIC": "amber",
  };
  return <Badge variant={map[responsibility]}>{responsibility}</Badge>;
}

export function SlaBadge({ sla }: { sla: SlaStatus }) {
  const map: Record<SlaStatus, BadgeVariant> = {
    Aman: "green",
    "Mendekati SLA": "amber",
    "Lewat SLA": "red",
  };
  return <Badge variant={map[sla]}>{sla.toUpperCase()}</Badge>;
}

export function FeedbackTypeBadge({ type }: { type: "Kritik" | "Masukan" }) {
  return <Badge variant={type === "Kritik" ? "red" : "amber"}>{type.toUpperCase()}</Badge>;
}

export function TrendBadge({ trend }: { trend?: "naik" | "turun" | "stabil" }) {
  if (!trend) return null;
  const map: Record<"naik" | "turun" | "stabil", BadgeVariant> = { naik: "red", turun: "green", stabil: "muted" };
  const label = { naik: "Naik", turun: "Turun", stabil: "Stabil" };
  return <Badge variant={map[trend]}>{label[trend]}</Badge>;
}

export function RiskBadge({ risk }: { risk: "Rendah" | "Sedang" | "Tinggi" }) {
  const map: Record<"Rendah" | "Sedang" | "Tinggi", BadgeVariant> = { Rendah: "green", Sedang: "amber", Tinggi: "red" };
  return <Badge variant={map[risk]}>{risk.toUpperCase()}</Badge>;
}

export function cellMuted(text?: string) {
  return <span className={cn("text-muted")}>{text || "-"}</span>;
}
