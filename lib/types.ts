// ---------------------------------------------------------------------------
// Legacy types (kept for backward compatibility with existing pages/components)
// ---------------------------------------------------------------------------

export type Severity = "Rendah" | "Sedang" | "Tinggi" | "Kritis";

/** @deprecated superseded by PublicStatus / InternalWorkflowState, kept for legacy pages */
export type CaseStatus =
  | "Baru"
  | "Verifikasi"
  | "Diproses"
  | "Menunggu Klarifikasi"
  | "Resolusi Diajukan"
  | "Resolusi Disetujui"
  | "Selesai"
  | "Ditolak";

/** Whether a ticket was filed as a formal complaint or a general critique/suggestion. */
export type ComplaintType = "Pengaduan" | "Kritik dan Saran";

export type OwnerType = "Pelapor" | "Platform" | "Bursa" | "Kliring" | "Bappebti";

/** @deprecated superseded by the institution/responsibility structure below */
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
  /** Whether this event is visible to the public reporter. Internal-only events are never shown on public portals. */
  visibility?: "public" | "internal";
}

export interface ClarificationMessage {
  from: string;
  role: string;
  datetime: string;
  message: string;
  /** Distinguishes an informational note from a formal clarification request requiring a reply. */
  kind?: "info" | "formal-request" | "reply" | "resolution";
  dueDate?: string;
  requiresAttachment?: boolean;
}

// ---------------------------------------------------------------------------
// Richer regulator-grade data model (Section 4 of the product spec)
// All fields below are additive/optional so existing mock cases and pages
// keep working unchanged; new screens read these fields with safe fallbacks
// via the helpers in lib/workflow-config.ts and lib/format.ts.
// ---------------------------------------------------------------------------

/** Public-facing status shown to reporters (Bahasa Indonesia, plain language). */
export type PublicStatus =
  | "Draft"
  | "Pengaduan Diterima"
  | "Sedang Diperiksa"
  | "Menunggu Data dari Anda"
  | "Diteruskan ke Pihak Terkait"
  | "Sedang Diinvestigasi"
  | "Dalam Review Bappebti"
  | "Solusi Diajukan"
  | "Solusi Sedang Dilaksanakan"
  | "Selesai"
  | "Ditutup Secara Administratif"
  | "Dialihkan ke Instansi Lain"
  | "Di Luar Kewenangan";

/** Internal workflow state driving routing, SLA clocks and permitted transitions. */
export type InternalWorkflowState =
  | "DRAFT"
  | "INTAKE_SUBMITTED"
  | "IDENTITY_VERIFICATION"
  | "JURISDICTION_REVIEW"
  | "COMPLETENESS_REVIEW"
  | "WAITING_REPORTER_INFORMATION"
  | "ROUTING_REVIEW"
  | "ASSIGNED_TO_PLATFORM"
  | "ASSIGNED_TO_BURSA"
  | "ASSIGNED_TO_CLEARING"
  | "MEMBER_ACKNOWLEDGED"
  | "MEMBER_INVESTIGATION"
  | "WAITING_MEMBER_INFORMATION"
  | "WAITING_SUPPORTING_INSTITUTION"
  | "BAPPEBTI_OPERATIONAL_REVIEW"
  | "BAPPEBTI_SUPERVISOR_REVIEW"
  | "ENFORCEMENT_REVIEW"
  | "PROPOSED_RESOLUTION"
  | "WAITING_REPORTER_DECISION"
  | "RESOLUTION_IMPLEMENTATION"
  | "IMPLEMENTATION_VERIFICATION"
  | "CLOSED_RESOLVED"
  | "CLOSED_ADMINISTRATIVE"
  | "REFERRED_EXTERNAL"
  | "OUTSIDE_JURISDICTION"
  | "WITHDRAWN_BY_REPORTER"
  | "REOPENED";

export type ReporterType =
  | "Perorangan"
  | "Badan Hukum"
  | "Kuasa/Perwakilan"
  | "Kuasa Hukum"
  | "Ahli Waris/Keluarga";

export type EscalationLevel = 0 | 1 | 2 | 3 | 4;

export interface InstitutionStructure {
  /** Always Bappebti in this platform — the regulator ultimately accountable for the case. */
  regulatoryOwner: string;
  /** The member institution primarily responsible for resolving the complaint. */
  leadInstitution: string;
  /** Whoever must act right now: could be the lead institution, a supporting institution, Bappebti, or the reporter. */
  currentActionOwner: OwnerType;
  /** Named case officer assigned within the current action owner. */
  caseOfficer?: string;
  /** Other institutions supporting investigation without owning the action. */
  supportingInstitutions?: string[];
  bursa?: string;
  clearing?: string;
  supervisoryUnit?: string;
  /** Who has final authority to approve/close the case. */
  decisionAuthority: string;
  escalationLevel: EscalationLevel;
  escalationReason?: string;
}

export type SlaClockType =
  | "Pengakuan Awal"
  | "Review Yurisdiksi"
  | "Review Kelengkapan"
  | "Pengakuan Anggota"
  | "Respons Substantif Anggota"
  | "Respons Institusi Pendukung"
  | "Review Bappebti"
  | "Klarifikasi Pelapor"
  | "Implementasi Resolusi"
  | "Usia Kasus Keseluruhan";

export type SlaClockStatus = "Aman" | "Perlu Perhatian" | "Mendekati Batas Waktu" | "Lewat Batas Waktu" | "Dijeda" | "Selesai";

export interface SlaClock {
  type: SlaClockType;
  startTime: string;
  deadline: string;
  status: SlaClockStatus;
  responsibleParty: OwnerType;
  paused?: boolean;
  pauseReason?: string;
  pauseStart?: string;
  resumeDate?: string;
  breachDate?: string;
  escalationLevel?: EscalationLevel;
}

export type ResolutionType =
  | "Pengembalian Dana"
  | "Koreksi Saldo"
  | "Pemulihan Akun"
  | "Penjelasan Transaksi"
  | "Penutupan Akun"
  | "Klarifikasi Tertulis"
  | "Perbaikan Layanan"
  | "Lainnya";

export type ReporterResolutionDecision =
  | "Menerima Sepenuhnya"
  | "Menerima Sebagian"
  | "Masalah Belum Selesai"
  | "Membutuhkan Penjelasan"
  | "Belum Dilaksanakan"
  | "Bukti Bertentangan"
  | "Meminta Review Bappebti";

export interface ResolutionRecord {
  proposal: string;
  resolutionType: ResolutionType;
  proposedBy: string;
  proposedDate: string;
  monetaryAdjustment?: number;
  nonMonetaryAction?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  implementationDeadline?: string;
  implementationEvidence?: string[];
  reporterDecision?: ReporterResolutionDecision;
  reporterDisagreementReason?: string;
  bappebtiDecision?: "Disetujui" | "Dikembalikan untuk Revisi" | "Ditolak" | "Menunggu Review";
  verifiedImplementationDate?: string;
  /** Display-formatted deadline (48 jam sejak diajukan) by which the reporter must respond before the resolution is auto-accepted. */
  responseDeadline?: string;
  /** Whether reporterDecision was given by the reporter themselves, or auto-applied after responseDeadline passed with no response. Omitted/undefined is treated as "Manual". */
  decisionMethod?: "Manual" | "Otomatis";
}

export type InternalNoteClassification = "Operasional" | "Supervisi" | "Legal" | "Penegakan";

export interface InternalNote {
  author: string;
  role: string;
  institution: string;
  timestamp: string;
  classification: InternalNoteClassification;
  text: string;
  /** Internal notes are never shown to the public or member portals. */
  visibility: "internal";
}

export interface ReporterProfile {
  reporterType?: ReporterType;
  verifiedEmail?: string;
  verifiedPhone?: string;
  province?: string;
  city?: string;
  vulnerableConsumer?: boolean;
  preferredChannel?: "Email" | "WhatsApp" | "SMS" | "Aplikasi";
  consentStatus?: "Diberikan" | "Belum Diberikan";
}

export interface ComplaintCase {
  // --- legacy fields (unchanged, still consumed by existing pages) ---
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
  /** Pengaduan (formal complaint) vs Kritik dan Saran (general critique/suggestion). Defaults to "Pengaduan" when omitted. */
  complaintType?: ComplaintType;

  // --- richer regulator-grade model (all optional, additive) ---
  parentIncidentId?: string;
  duplicateOfCase?: string;
  submittedAt?: string;
  closedAt?: string;
  reopenedAt?: string;

  reporter?: ReporterProfile;
  publicStatus?: PublicStatus;
  workflowState?: InternalWorkflowState;
  institution?: InstitutionStructure;
  slaClocks?: SlaClock[];
  resolution?: ResolutionRecord;
  internalNotes?: InternalNote[];

  financialExposure?: number;
  suspectedFraud?: boolean;
  activeSecurityRisk?: boolean;
  illegalEntitySuspected?: boolean;
  massIncident?: boolean;
  priorComplaintToEntity?: boolean;
  priorComplaintDate?: string;
  entityResponse?: string;
  closureReason?: string;
  reopenEligible?: boolean;
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
  reopenedRate?: number;
  disagreementRate?: number;
  complaintsPer10k?: number;
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
  /** Identity of whoever submitted the feedback, so staff can see what else this person has raised. */
  reporterName: string;
  reporterEmail?: string;
  reporterPhone?: string;
  read?: boolean;
  flagged?: boolean;
  flagReason?: string;
  needsFollowUp?: boolean;
  followUpStatus?: "Proses" | "Selesai";
  followUpNote?: string;
}

export interface AdminUser {
  name: string;
  email: string;
  role: string;
  organization: string;
  status: "Aktif" | "Menunggu Persetujuan" | "Nonaktif";
  lastLogin: string;
}

// ---------------------------------------------------------------------------
// Bab III — unified administration (role builder, approvals, ecosystem
// registration, and app configuration).
// ---------------------------------------------------------------------------

export type ApprovalRequestType =
  | "Pendaftaran Akun Baru"
  | "Perubahan Email"
  | "Reset Password"
  | "Perubahan Role"
  | "Penonaktifan Akun";

export interface ApprovalRequest {
  id: string;
  requestType: ApprovalRequestType;
  targetUserName: string;
  targetUserEmail: string;
  requestedBy: string;
  requestedAt: string;
  /** What specifically is changing, e.g. "Email lama -> email baru". */
  description: string;
  status: "Menunggu" | "Disetujui" | "Ditolak";
  decidedBy?: string;
  decidedAt?: string;
  reason?: string;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description?: string;
  /** Keys referencing MenuTreeItem.key in lib/menu-tree.ts — at least one required. */
  menuKeys: string[];
  createdAt: string;
  /** Built-in seed roles (used across the rest of the prototype) are not deletable. */
  builtIn?: boolean;
}

/** @deprecated kept only for the pre-wizard seed shape; entities now carry a free-text `category` referencing EcosystemCategoryConfig plus a fixed `ecosystemType`. */
export type EcosystemCategory = "Platform/Pialang" | "Bursa" | "Kliring" | "Asosiasi";

// Ecosystem Type is fixed (only these two values ever exist); Ecosystem
// Category is a manageable list configured in Konfigurasi > Category
// Ecosystem, each category attached to one of these two types.
export type EcosystemType = "Ecosystem Aktif" | "Ecosystem Pengawas";

export interface EcosystemCategoryConfig {
  id: string;
  type: EcosystemType;
  /** Short label, e.g. "Bursa" — shown throughout the UI as the category name. */
  shortDescription: string;
  longDescription: string;
  active: boolean;
  createdAt: string;
}

export type EcosystemAccessRole = "Admin Ecosystem" | "Petugas Pengaduan" | "Penyetuju" | "Pemantau";

export interface EcosystemExecutive {
  id: string;
  name: string;
  position: string;
  responsibilityArea: string;
  officialEmail: string;
  phone?: string;
  startDate: string;
  endDate?: string;
  appointmentDocument?: string;
}

export interface EcosystemPic {
  id: string;
  name: string;
  position: string;
  unit: string;
  email: string;
  phone: string;
  accessRole: EcosystemAccessRole;
  isPrimary: boolean;
  appointmentLetter?: string;
}

export type EcosystemRegistrationStatus = "Draft" | "Menunggu Verifikasi" | "Perlu Perbaikan" | "Disetujui" | "Ditolak";

export interface EcosystemEntity {
  id: string;
  name: string;
  /** References an EcosystemCategoryConfig.shortDescription. */
  category: string;
  ecosystemType: EcosystemType;
  description?: string;
  shortName?: string;
  logo?: string;
  license?: string;
  npwp?: string;
  aktaPendirian?: string;
  aktaPerubahan?: string;
  pengesahanAhu?: string;
  izinUsaha?: string;
  address?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  officePhone?: string;
  officialEmail?: string;
  website?: string;
  bursa?: string;
  kliring?: string;
  executives?: EcosystemExecutive[];
  pics?: EcosystemPic[];
  nibDocument?: string;
  npwpDocument?: string;
  aktaPendirianDocument?: string;
  aktaPerubahanDocument?: string;
  izinUsahaDocument?: string;
  strukturOrganisasiDocument?: string;
  supportingDocuments?: { name: string; file: string }[];
  submitterName?: string;
  submitterPosition?: string;
  status: EcosystemRegistrationStatus;
  hasPendingEdit?: boolean;
  /** Operational on/off switch, independent of the registration status lifecycle. */
  disabled?: boolean;
  establishedAt?: string;
  registeredAt: string;
  decidedBy?: string;
  decidedAt?: string;
  rejectionReason?: string;
}

export type EcosystemChangeType = "Pendaftaran Baru" | "Perubahan Data";

export interface EcosystemChangeRequest {
  id: string;
  entityId: string;
  changeType: EcosystemChangeType;
  entityName: string;
  before?: Partial<EcosystemEntity>;
  after: EcosystemEntity;
  requestedBy: string;
  requestedAt: string;
  status: "Menunggu" | "Disetujui" | "Ditolak";
  decidedBy?: string;
  decidedAt?: string;
  reason?: string;
}

export type ConfigType = "Kategori Pengaduan" | "Manajemen SLA" | "Kategori Ekosistem";
export type ConfigChangeAction = "Tambah" | "Nonaktifkan" | "Aktifkan" | "Ubah";

export interface ConfigChangeRequest {
  id: string;
  configType: ConfigType;
  action: ConfigChangeAction;
  itemLabel: string;
  beforeValue?: string;
  afterValue: string;
  /** JSON-encoded payload needed to apply the change once approved. */
  payload: string;
  requestedBy: string;
  requestedAt: string;
  status: "Menunggu" | "Disetujui" | "Ditolak";
  decidedBy?: string;
  decidedAt?: string;
  reason?: string;
}

export interface ComplaintCategoryConfig {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface SlaConfigEntry {
  id: string;
  hours: number;
  effectiveFrom: string;
  changedBy: string;
  note?: string;
}

export interface AuditLogEntry {
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  object: string;
  before: string;
  after: string;
  reason?: string;
  visibility?: "public" | "internal";
}

export interface NotificationItem {
  time: string;
  ticket: string;
  type: string;
  message: string;
  status: "Belum Dibaca" | "Dibaca";
  priority?: "Membutuhkan Tindakan" | "Penting" | "Informasional";
}

export interface IncidentRecord {
  id: string;
  title: string;
  description: string;
  leadInstitution: string;
  affectedEntities: string[];
  relatedCaseCount: number;
  estimatedConsumersAffected: number;
  estimatedFinancialExposure: number;
  rootCause?: string;
  severity: Severity;
  status: "Aktif" | "Cluster Muncul" | "Selesai";
  commandOwner: string;
  publicCommunicationStatus: "Belum Ada" | "Disiapkan" | "Dipublikasikan";
  correctiveActions?: string;
  preventiveActions?: string;
  startDate: string;
  resolutionDate?: string;
  relatedCases: string[];
}

// ---------------------------------------------------------------------------
// Clarification module — a clarification is a distinct business object with
// its own ID (a case can contain multiple clarifications), separate from the
// generic ComplaintCase.clarifications message array used by older pages.
// ---------------------------------------------------------------------------

export type ClarificationStatus =
  | "DRAFT"
  | "SENT"
  | "WAITING_RESPONSE"
  | "PARTIALLY_RESPONDED"
  | "RESPONDED"
  | "UNDER_REVIEW"
  | "REVISION_REQUESTED"
  | "COMPLETED"
  | "OVERDUE"
  | "CANCELLED";

export type ClarificationPartyType = "REPORTER" | "PLATFORM" | "BURSA" | "CLEARING" | "BAPPEBTI";

export type ClarificationPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ClarificationParty {
  partyType: ClarificationPartyType;
  institutionId?: string;
  institutionName: string;
  userId?: string;
  userName?: string;
  roleLabel: string;
}

export interface ClarificationAttachment {
  id: string;
  filename: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  sizeLabel?: string;
}

export type ClarificationEventVisibility = "public" | "member" | "internal";

export interface ClarificationHistoryEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  institution: string;
  action: string;
  note?: string;
  visibility: ClarificationEventVisibility;
  beforeState?: ClarificationStatus;
  afterState?: ClarificationStatus;
  reason?: string;
}

export interface RequestedInformationItem {
  label: string;
  status: "Belum Diberikan" | "Sudah Diberikan" | "Perlu Diperbaiki" | "Diterima";
}

export interface ClarificationRequest {
  id: string;
  caseTicket: string;
  requestDirection: "INCOMING" | "OUTGOING";
  requestedBy: ClarificationParty;
  requestedFrom: ClarificationParty;
  subject: string;
  question: string;
  reason: string;
  requestedInformation?: RequestedInformationItem[];
  requestedEvidenceTypes?: string[];
  requestedFields?: string[];
  priority: ClarificationPriority;
  createdAt: string;
  dueAt: string;
  originalDueAt?: string;
  respondedAt?: string;
  completedAt?: string;
  breachedAt?: string;
  status: ClarificationStatus;
  responseDraft?: string;
  formalResponse?: {
    summary: string;
    detailedExplanation: string;
    referencedTransaction?: string;
    factsConfirmed?: string;
    factsNotConfirmed?: string;
    respondingOfficer: string;
    supervisorApproval?: string;
    submittedAt: string;
  };
  reviewerComments?: string;
  revisionReason?: string;
  requiredCorrections?: string;
  attachments: ClarificationAttachment[];
  responseAttachments: ClarificationAttachment[];
  history: ClarificationHistoryEvent[];
  internalNote?: string;
  visibility: {
    publicReporter: boolean;
    platform: boolean;
    bursa: boolean;
    clearing: boolean;
    bappebti: boolean;
  };
}
