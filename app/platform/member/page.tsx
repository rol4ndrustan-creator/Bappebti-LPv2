"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ECOSYSTEM_ENTITIES, PLATFORM_ECOSYSTEM_MEMBERSHIPS } from "@/lib/mock-data";
import { usePlatformEcosystemMemberships } from "@/lib/mock-service/ecosystem-member-store";
import { useDemoSession } from "@/lib/demo-session";
import { PlatformMembershipEcosystemType, PlatformMembershipStatus } from "@/lib/types";

const TYPE_VARIANT: Record<PlatformMembershipEcosystemType, "navy" | "amber" | "green"> = {
  Bursa: "navy",
  Kliring: "amber",
  Custody: "green",
};

const STATUS_VARIANT: Record<PlatformMembershipStatus, "green" | "amber" | "muted"> = {
  Aktif: "green",
  Suspended: "amber",
  "Non-Aktif": "muted",
};

export default function PlatformMemberPage() {
  const { user } = useDemoSession();
  const allMemberships = usePlatformEcosystemMemberships(PLATFORM_ECOSYSTEM_MEMBERSHIPS);
  const memberships = useMemo(
    () => allMemberships.filter((m) => m.platformName === user.institution),
    [allMemberships, user.institution]
  );
  const contactByEntityId = useMemo(() => new Map(ECOSYSTEM_ENTITIES.map((e) => [e.id, e.officialEmail])), []);

  return (
    <div>
      <PageHeader
        title="Manajemen Member"
        description={`Daftar entitas infrastruktur pasar (Bursa, Kliring, Custody) tempat ${user.institution} terdaftar sebagai anggota resmi.`}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipe Ekosistem</TableHead>
            <TableHead>Nama Lembaga</TableHead>
            <TableHead>Kode Keanggotaan</TableHead>
            <TableHead>Tanggal Terdaftar</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Kontak Operasional</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {memberships.map((m) => (
            <TableRow key={m.id}>
              <TableCell>
                <Badge variant={TYPE_VARIANT[m.ecosystemType]}>{m.ecosystemType}</Badge>
              </TableCell>
              <TableCell className="max-w-[220px] truncate">{m.ecosystemEntityName}</TableCell>
              <TableCell className="font-medium text-navy whitespace-nowrap">{m.id}</TableCell>
              <TableCell className="text-muted whitespace-nowrap">{m.registeredAt}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[m.status]}>{m.status}</Badge>
              </TableCell>
              <TableCell className="text-muted whitespace-nowrap">{contactByEntityId.get(m.ecosystemEntityId) || "-"}</TableCell>
            </TableRow>
          ))}
          {memberships.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted py-6">
                Belum terdaftar sebagai anggota di lembaga ekosistem manapun.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
