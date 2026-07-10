// Central role and permission configuration (Section 5 of the product spec).
// This is a prototype-grade permission model: it shapes what the UI shows
// and which mock actions are available. It is NOT a real authorization
// boundary — there is no backend enforcing these rules.

export type Role =
  // Public
  | "PUBLIC_REPORTER"
  | "PUBLIC_REPRESENTATIVE"
  // Member institutions
  | "PLATFORM_CASE_OFFICER"
  | "PLATFORM_SUPERVISOR"
  | "BURSA_CASE_OFFICER"
  | "BURSA_SUPERVISOR"
  | "CLEARING_CASE_OFFICER"
  | "CLEARING_SUPERVISOR"
  // Bappebti
  | "BAPPEBTI_INTAKE_OFFICER"
  | "BAPPEBTI_CASE_OFFICER"
  | "BAPPEBTI_SUPERVISOR"
  | "BAPPEBTI_ENFORCEMENT"
  | "BAPPEBTI_EXECUTIVE"
  // Administration
  | "SYSTEM_ADMIN"
  | "AUDITOR_READ_ONLY";

export type Ability =
  | "view_complaint"
  | "view_reporter_identity"
  | "view_sensitive_evidence"
  | "assign_case"
  | "request_clarification"
  | "submit_member_response"
  | "propose_resolution"
  | "approve_resolution"
  | "close_case"
  | "reopen_case"
  | "escalate_case"
  | "change_sla"
  | "export_data"
  | "manage_users"
  | "view_audit_log"
  | "view_internal_notes"
  | "create_incident"
  | "merge_duplicate_cases";

export const ROLE_GROUP: Record<Role, "Publik" | "Platform" | "Ekosistem" | "Bappebti" | "Administrasi"> = {
  PUBLIC_REPORTER: "Publik",
  PUBLIC_REPRESENTATIVE: "Publik",
  PLATFORM_CASE_OFFICER: "Platform",
  PLATFORM_SUPERVISOR: "Platform",
  BURSA_CASE_OFFICER: "Ekosistem",
  BURSA_SUPERVISOR: "Ekosistem",
  CLEARING_CASE_OFFICER: "Ekosistem",
  CLEARING_SUPERVISOR: "Ekosistem",
  BAPPEBTI_INTAKE_OFFICER: "Bappebti",
  BAPPEBTI_CASE_OFFICER: "Bappebti",
  BAPPEBTI_SUPERVISOR: "Bappebti",
  BAPPEBTI_ENFORCEMENT: "Bappebti",
  BAPPEBTI_EXECUTIVE: "Bappebti",
  SYSTEM_ADMIN: "Administrasi",
  AUDITOR_READ_ONLY: "Administrasi",
};

export const ROLE_LABEL: Record<Role, string> = {
  PUBLIC_REPORTER: "Pelapor Publik",
  PUBLIC_REPRESENTATIVE: "Perwakilan/Kuasa Pelapor",
  PLATFORM_CASE_OFFICER: "Petugas Kasus Platform",
  PLATFORM_SUPERVISOR: "Supervisor Platform",
  BURSA_CASE_OFFICER: "Petugas Kasus Bursa",
  BURSA_SUPERVISOR: "Supervisor Bursa",
  CLEARING_CASE_OFFICER: "Petugas Kasus Kliring",
  CLEARING_SUPERVISOR: "Supervisor Kliring",
  BAPPEBTI_INTAKE_OFFICER: "Petugas Intake Bappebti",
  BAPPEBTI_CASE_OFFICER: "Petugas Kasus Bappebti",
  BAPPEBTI_SUPERVISOR: "Supervisor Bappebti",
  BAPPEBTI_ENFORCEMENT: "Unit Penegakan Bappebti",
  BAPPEBTI_EXECUTIVE: "Eksekutif Bappebti",
  SYSTEM_ADMIN: "Administrator Sistem",
  AUDITOR_READ_ONLY: "Auditor (Baca Saja)",
};

const ALL_BAPPEBTI: Role[] = [
  "BAPPEBTI_INTAKE_OFFICER",
  "BAPPEBTI_CASE_OFFICER",
  "BAPPEBTI_SUPERVISOR",
  "BAPPEBTI_ENFORCEMENT",
  "BAPPEBTI_EXECUTIVE",
];
const ALL_MEMBERS: Role[] = [
  "PLATFORM_CASE_OFFICER",
  "PLATFORM_SUPERVISOR",
  "BURSA_CASE_OFFICER",
  "BURSA_SUPERVISOR",
  "CLEARING_CASE_OFFICER",
  "CLEARING_SUPERVISOR",
];
const ALL_PUBLIC: Role[] = ["PUBLIC_REPORTER", "PUBLIC_REPRESENTATIVE"];

export const PERMISSIONS: Record<Ability, Role[]> = {
  view_complaint: [...ALL_PUBLIC, ...ALL_MEMBERS, ...ALL_BAPPEBTI, "SYSTEM_ADMIN", "AUDITOR_READ_ONLY"],
  view_reporter_identity: [...ALL_BAPPEBTI, "SYSTEM_ADMIN"],
  view_sensitive_evidence: [...ALL_BAPPEBTI, "SYSTEM_ADMIN"],
  assign_case: ["BAPPEBTI_INTAKE_OFFICER", "BAPPEBTI_CASE_OFFICER", "BAPPEBTI_SUPERVISOR", "BAPPEBTI_EXECUTIVE", "PLATFORM_SUPERVISOR", "BURSA_SUPERVISOR", "CLEARING_SUPERVISOR"],
  request_clarification: [...ALL_MEMBERS, ...ALL_BAPPEBTI],
  submit_member_response: ALL_MEMBERS,
  propose_resolution: ["PLATFORM_CASE_OFFICER", "PLATFORM_SUPERVISOR", "BURSA_CASE_OFFICER", "BURSA_SUPERVISOR", "CLEARING_CASE_OFFICER", "CLEARING_SUPERVISOR"],
  approve_resolution: ["BAPPEBTI_CASE_OFFICER", "BAPPEBTI_SUPERVISOR", "BAPPEBTI_EXECUTIVE"],
  close_case: ["BAPPEBTI_CASE_OFFICER", "BAPPEBTI_SUPERVISOR", "BAPPEBTI_EXECUTIVE"],
  reopen_case: ["BAPPEBTI_SUPERVISOR", "BAPPEBTI_EXECUTIVE"],
  escalate_case: [...ALL_MEMBERS, "BAPPEBTI_CASE_OFFICER", "BAPPEBTI_SUPERVISOR"],
  change_sla: ["BAPPEBTI_SUPERVISOR", "BAPPEBTI_EXECUTIVE"],
  export_data: [...ALL_BAPPEBTI, "SYSTEM_ADMIN", "AUDITOR_READ_ONLY"],
  manage_users: ["SYSTEM_ADMIN"],
  view_audit_log: [...ALL_BAPPEBTI, "SYSTEM_ADMIN", "AUDITOR_READ_ONLY"],
  view_internal_notes: [...ALL_BAPPEBTI, "SYSTEM_ADMIN", "AUDITOR_READ_ONLY"],
  create_incident: ["BAPPEBTI_CASE_OFFICER", "BAPPEBTI_SUPERVISOR", "BAPPEBTI_ENFORCEMENT", "BAPPEBTI_EXECUTIVE"],
  merge_duplicate_cases: ["BAPPEBTI_CASE_OFFICER", "BAPPEBTI_SUPERVISOR", "BAPPEBTI_EXECUTIVE"],
};

export function can(role: Role, ability: Ability): boolean {
  return PERMISSIONS[ability].includes(role);
}

export interface DemoUser {
  id: string;
  name: string;
  role: Role;
  institution: string;
  portalHref: string;
}

// Demo personas used by the "Mode Demonstrasi" role switcher (Section 5).
export const DEMO_USERS: DemoUser[] = [
  { id: "andra", name: "Andra Wicaksono", role: "PUBLIC_REPORTER", institution: "Pelapor Publik", portalHref: "/publik/dashboard" },
  { id: "rina", name: "Rina Kusuma", role: "PLATFORM_CASE_OFFICER", institution: "PT Bursa Digital Nusantara", portalHref: "/platform" },
  { id: "indra", name: "Indra Kusnadi", role: "PLATFORM_CASE_OFFICER", institution: "PT Indodax Nasional Indonesia", portalHref: "/platform" },
  { id: "yoga", name: "Yoga Pratama", role: "PLATFORM_CASE_OFFICER", institution: "PT Crypto Indonesia Berkat", portalHref: "/platform" },
  { id: "ahmad", name: "Ahmad Pratama", role: "BURSA_CASE_OFFICER", institution: "Bursa Berjangka Jakarta", portalHref: "/ekosistem/bursa" },
  { id: "sari", name: "Sari Wulandari", role: "CLEARING_CASE_OFFICER", institution: "Kliring Berjangka Indonesia", portalHref: "/ekosistem/kliring" },
  { id: "dewi", name: "Dewi Anjani", role: "BAPPEBTI_CASE_OFFICER", institution: "Bappebti", portalHref: "/bappebti" },
  { id: "bambang", name: "Bambang Setiawan", role: "BAPPEBTI_SUPERVISOR", institution: "Bappebti", portalHref: "/bappebti" },
  { id: "ratna", name: "Ratna Maharani", role: "BAPPEBTI_EXECUTIVE", institution: "Bappebti", portalHref: "/bappebti" },
  { id: "admin", name: "System Administrator", role: "SYSTEM_ADMIN", institution: "Bappebti", portalHref: "/admin" },
];

export const DEFAULT_DEMO_USER_ID = DEMO_USERS[0].id;
