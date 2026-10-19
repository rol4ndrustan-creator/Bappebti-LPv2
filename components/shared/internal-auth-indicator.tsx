"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { useInternalAuth } from "@/lib/internal-auth";
import { useDemoSession } from "@/lib/demo-session";

export function InternalAuthIndicator() {
  const { isAuthenticated, ready, logout } = useInternalAuth();
  const { user } = useDemoSession();
  const router = useRouter();

  if (!ready) return null;

  if (!isAuthenticated) {
    return (
      <Link
        href="/masuk"
        className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-white/70 hover:bg-white/10 hover:text-white"
      >
        <LogIn className="size-3.5" />
        <span className="hidden sm:inline">Masuk Internal</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-md bg-white/10 pl-2 pr-1 py-1">
      <span className="hidden lg:inline text-[11px] font-medium text-white truncate max-w-[160px]" title={`${user.name} — ${user.institution}`}>
        {user.name}
      </span>
      <button
        type="button"
        onClick={() => {
          logout();
          router.push("/masuk");
        }}
        className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-white/70 hover:bg-white/10 hover:text-white"
        title="Keluar dari akun internal"
      >
        <LogOut className="size-3.5" />
        <span className="hidden sm:inline">Keluar</span>
      </button>
    </div>
  );
}
