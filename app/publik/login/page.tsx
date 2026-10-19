"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn, UserPlus } from "lucide-react";

export default function LoginChoicePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6 gap-2">
          <div className="flex size-10 items-center justify-center rounded-md bg-navy text-white text-base font-bold bg-linear-to-b from-white/20 to-transparent shadow-sm shadow-black/20">
            B
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-navy">Layanan Pengaduan Bappebti</p>
            <p className="text-[11px] text-muted">Portal Publik</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-4 flex flex-col gap-3">
            <h1 className="text-sm font-semibold text-navy mb-1 text-center">Mulai Pengaduan Anda</h1>

            <Link href="/publik/masuk">
              <Button className="w-full justify-start" size="lg">
                <LogIn className="size-4" /> Sudah Punya Akun
              </Button>
            </Link>
            <Link href="/publik/register">
              <Button variant="secondary" className="w-full justify-start" size="lg">
                <UserPlus className="size-4" /> Belum Punya Akun
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted mt-4">
          <Link href="/publik" className="hover:underline">
            Kembali ke halaman utama
          </Link>
        </p>
      </div>
    </div>
  );
}
