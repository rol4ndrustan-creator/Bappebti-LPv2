"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/publik/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6 gap-2">
          <div className="flex size-10 items-center justify-center rounded-md bg-navy text-white text-base font-bold">
            B
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-navy">Layanan Pengaduan Bappebti</p>
            <p className="text-[11px] text-muted">Portal Publik</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-4">
            <h1 className="text-sm font-semibold text-navy mb-1">Masuk ke Akun Anda</h1>
            <p className="text-xs text-muted mb-4">
              Gunakan email/nomor HP terdaftar untuk memantau status pengaduan.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <Label htmlFor="identifier">Email atau Nomor HP</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="contoh: andra.wicaksono@email.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="mt-2 w-full">
                Masuk
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted mt-4">
          Belum memiliki akun?{" "}
          <Link href="/publik/register" className="text-navy font-medium hover:underline">
            Daftar di sini
          </Link>
        </p>
        <p className="text-center text-[11px] text-muted mt-2">
          <Link href="/publik" className="hover:underline">
            Kembali ke halaman utama
          </Link>
        </p>
      </div>
    </div>
  );
}
