export type Severity = "Rendah" | "Sedang" | "Tinggi" | "Kritis";

export type CaseStatus =
  | "Baru"
  | "Verifikasi"
  | "Diproses"
  | "Menunggu Klarifikasi"
  | "Resolusi Diajukan"
  | "Selesai"
  | "Ditolak";

export type OwnerType = "Pelapor" | "Platform" | "Bursa" | "Kliring" | "Bappebti";

export type Responsibility = "BAPPEBTI OWNED" | "MEMBER ASSIGNED" | "WAITING PUBLIC";

export type SlaStatus = "Aman" | "Mendekati SLA" | "Lewat SLA";

export type TimelineStatus = "success" | "info" | "warning" | "danger";

export interface TimelineEvent {
  datetime: string;
  actor: string;
  role: string;
  action: string;
  note: string;
  status: TimelineStatus;
}

export interface ClarificationMessage {
  from: string;
  role: string;
  datetime: string;
  message: string;
}

export interface ComplaintCase {
  ticket: string;
  title: string;
  platform: string;
  bursaEntity: string;
  kliringEntity: string;
  category: string;
  subcategory: string;
  severity: Severity;
  status: CaseStatus;
  currentOwner: OwnerType;
  responsibility: Responsibility;
  slaStatus: SlaStatus;
  slaDeadline: string;
  createdAt: string;
  updatedAt: string;
  amount?: number;
  transactionRef?: string;
  platformUserId?: string;
  chronology: string;
  expectedResolution: string;
  evidences: string[];
  timeline: TimelineEvent[];
  clarifications: ClarificationMessage[];
  reporterName: string;
  reporterCity?: string;
  escalationReason?: string;
  reconciliationIssue?: string;
  resolutionProposal?: string;
  relatedCases?: string[];
}

export interface Member {
  name: string;
  type: string;
  license: string;
  status: string;
  bursa: string;
  kliring: string;
  totalCases: number;
  handled: number;
  unhandled: number;
  slaBreach: number;
  critical: number;
  avgResolution: string;
  slaPercent: number;
  risk: "Rendah" | "Sedang" | "Tinggi";
  category?: string;
  trend?: "naik" | "turun" | "stabil";
}

export interface FeedbackItem {
  id: string;
  type: "Kritik" | "Masukan";
  topic: string;
  message: string;
  source: string;
  pic: string;
  status: "Belum Ditugaskan" | "Ditinjau" | "Selesai" | "Dikonversi";
  createdAt: string;
}

export interface AdminUser {
  name: string;
  email: string;
  role: string;
  organization: string;
  status: "Aktif" | "Menunggu Persetujuan" | "Nonaktif";
  lastLogin: string;
}

export interface AuditLogEntry {
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  object: string;
  before: string;
  after: string;
}

export interface NotificationItem {
  time: string;
  ticket: string;
  type: string;
  message: string;
  status: "Belum Dibaca" | "Dibaca";
}
