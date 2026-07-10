"use client";

import { useDemoSession } from "@/lib/demo-session";
import { DEMO_USERS, ROLE_LABEL } from "@/lib/permissions";
import { useRouter } from "next/navigation";
import { UserCircle2 } from "lucide-react";

export function DemoRoleSwitcher() {
  const { user, setUserId } = useDemoSession();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1.5">
      <span className="hidden lg:inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/70">
        Mode Demonstrasi
      </span>
      <div className="flex items-center gap-1.5 rounded-md bg-white/10 pl-2 pr-1 py-1">
        <UserCircle2 className="size-3.5 text-white/70 shrink-0" />
        <select
          aria-label="Pilih persona demonstrasi"
          value={user.id}
          onChange={(e) => {
            const next = DEMO_USERS.find((u) => u.id === e.target.value);
            setUserId(e.target.value);
            if (next) router.push(next.portalHref);
          }}
          className="bg-transparent text-[11px] font-medium text-white outline-none max-w-[110px] sm:max-w-[160px] lg:max-w-[200px] truncate [&>option]:text-foreground"
        >
          {DEMO_USERS.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} — {ROLE_LABEL[u.role]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
