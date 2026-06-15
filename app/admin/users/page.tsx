"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ADMIN_USERS } from "@/lib/mock-data";
import { AdminUser } from "@/lib/types";
import { useToast } from "@/components/shared/toast-provider";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const ROLE_OPTIONS = [
  "Public User",
  "Platform / Pialang",
  "Bursa",
  "Kliring",
  "Bappebti Regulator",
  "Asosiasi",
  "Admin",
];

function statusVariant(status: AdminUser["status"]): BadgeVariant {
  switch (status) {
    case "Aktif":
      return "green";
    case "Menunggu Persetujuan":
      return "amber";
    case "Nonaktif":
      return "muted";
  }
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>(ADMIN_USERS);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [roleSelection, setRoleSelection] = useState<string>("");
  const { showToast } = useToast();

  function approveUser(email: string) {
    setUsers((prev) =>
      prev.map((u) => (u.email === email ? { ...u, status: "Aktif" } : u))
    );
    showToast("Pengguna telah disetujui dan diaktifkan");
  }

  function disableUser(email: string) {
    setUsers((prev) =>
      prev.map((u) => (u.email === email ? { ...u, status: "Nonaktif" } : u))
    );
    showToast("Pengguna telah dinonaktifkan");
  }

  function resetPassword(email: string) {
    showToast(`Tautan reset password telah dikirim ke ${email}`);
  }

  function startChangeRole(email: string, currentRole: string) {
    setEditingEmail(email);
    setRoleSelection(currentRole);
  }

  function saveRole(email: string) {
    setUsers((prev) =>
      prev.map((u) => (u.email === email ? { ...u, role: roleSelection } : u))
    );
    setEditingEmail(null);
    showToast("Role pengguna berhasil diperbarui");
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Kelola akun pengguna sistem: persetujuan, status aktif, role, dan reset password."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.email}>
              <TableCell className="font-medium">{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                {editingEmail === u.email ? (
                  <div className="flex items-center gap-1.5">
                    <Select
                      value={roleSelection}
                      onChange={(e) => setRoleSelection(e.target.value)}
                      className="h-8 text-xs w-44"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </Select>
                    <Button size="sm" onClick={() => saveRole(u.email)}>Simpan</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingEmail(null)}>Batal</Button>
                  </div>
                ) : (
                  u.role
                )}
              </TableCell>
              <TableCell>{u.organization}</TableCell>
              <TableCell><Badge variant={statusVariant(u.status)}>{u.status.toUpperCase()}</Badge></TableCell>
              <TableCell className="whitespace-nowrap">{u.lastLogin}</TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="success"
                    disabled={u.status !== "Menunggu Persetujuan"}
                    onClick={() => approveUser(u.email)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={u.status !== "Aktif"}
                    onClick={() => disableUser(u.email)}
                  >
                    Disable
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => resetPassword(u.email)}>
                    Reset Password
                  </Button>
                  {editingEmail !== u.email && (
                    <Button size="sm" variant="outline" onClick={() => startChangeRole(u.email, u.role)}>
                      Change Role
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
