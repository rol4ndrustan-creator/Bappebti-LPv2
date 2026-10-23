"use client";

import { Shuffle } from "lucide-react";
import { EKOSISTEM_ACTIVE_ROLE_TYPES, useEkosistemActiveRole, EkosistemActiveRoleType } from "@/lib/ekosistem-active-role";

export function EkosistemActiveRoleSwitcher() {
  const { roleType, setRoleType } = useEkosistemActiveRole();

  return (
    <div className="border-b border-border bg-card px-4 py-2 flex items-center gap-2">
      <Shuffle className="size-3.5 text-muted shrink-0" />
      <label className="text-[11px] font-medium text-muted shrink-0">Peran Aktif:</label>
      <select
        aria-label="Pilih peran aktif Ekosistem Active"
        value={roleType}
        onChange={(e) => setRoleType(e.target.value as EkosistemActiveRoleType)}
        className="rounded-md border border-border bg-white px-2 py-1 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
      >
        {EKOSISTEM_ACTIVE_ROLE_TYPES.map((t) => (
          <option key={t} value={t}>
            Sebagai: {t}
          </option>
        ))}
      </select>
      <span className="text-[11px] text-muted">
        Seluruh metrik, daftar tiket, dan data member di portal ini terfilter sesuai peran yang dipilih.
      </span>
    </div>
  );
}
