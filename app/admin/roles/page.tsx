import { PageHeader } from "@/components/shared/page-header";
import { Check, Minus } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const COLUMNS = [
  "Situs Publik",
  "Portal Bappebti",
  "Portal Anggota (Platform)",
  "Portal Anggota (Bursa)",
  "Portal Anggota (Kliring)",
  "Asosiasi",
  "Konsol Admin",
  "Kelola Kasus",
  "Lihat Laporan Agregat",
];

const ROLES: { role: string; access: boolean[] }[] = [
  { role: "Public User", access: [true, false, false, false, false, false, false, false, false] },
  { role: "Platform / Pialang", access: [false, false, true, false, false, false, false, true, false] },
  { role: "Bursa", access: [false, false, false, true, false, false, false, true, true] },
  { role: "Kliring", access: [false, false, false, false, true, false, false, true, true] },
  { role: "Bappebti Regulator", access: [false, true, false, false, false, false, false, true, true] },
  { role: "Asosiasi", access: [false, false, false, false, false, true, false, false, true] },
  { role: "Admin", access: [false, false, false, false, false, false, true, false, true] },
];

export default function RoleAccessPage() {
  return (
    <div>
      <PageHeader
        title="Role & Access"
        description="Matriks role-based access control (RBAC) yang menjelaskan hak akses setiap peran terhadap portal dan fungsi utama sistem. Pengaturan ini memastikan setiap pihak hanya dapat mengakses data dan fungsi yang relevan dengan tanggung jawabnya."
      />

      <p className="text-xs text-muted mb-3 max-w-3xl">
        Setiap pengguna sistem terikat pada satu role tertentu. Role menentukan portal yang dapat
        diakses, kemampuan untuk mengelola kasus pengaduan, serta hak untuk melihat laporan agregat
        lintas anggota. Matriks di bawah ini bersifat informatif dan mencerminkan konfigurasi akses
        standar pada sistem.
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            {COLUMNS.map((c) => (
              <TableHead key={c} className="text-center">{c}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROLES.map((r) => (
            <TableRow key={r.role}>
              <TableCell className="font-medium text-navy whitespace-nowrap">{r.role}</TableCell>
              {r.access.map((has, i) => (
                <TableCell key={i} className="text-center">
                  {has ? (
                    <Check className="size-4 text-green inline-block" />
                  ) : (
                    <Minus className="size-4 text-muted inline-block" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-3 flex items-center gap-4 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <Check className="size-4 text-green" /> Memiliki akses
        </div>
        <div className="flex items-center gap-1.5">
          <Minus className="size-4 text-muted" /> Tidak memiliki akses
        </div>
      </div>
    </div>
  );
}
