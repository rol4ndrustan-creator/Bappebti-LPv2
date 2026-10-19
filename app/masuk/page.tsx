"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useInternalAuth, INTERNAL_ACCOUNTS } from "@/lib/internal-auth";

export default function MasukInternalPage() {
  const router = useRouter();
  const { login } = useInternalAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const account = INTERNAL_ACCOUNTS.find((a) => a.username.toLowerCase() === username.trim().toLowerCase());
    if (login(username, password)) {
      router.push(account!.portalHref);
    } else {
      setError("Username atau password salah.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6 gap-2">
          <div className="flex size-10 items-center justify-center rounded-md bg-navy text-white text-base font-bold bg-linear-to-b from-white/20 to-transparent shadow-sm shadow-black/20">
            B
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-navy">Layanan Pengaduan Bappebti</p>
            <p className="text-[11px] text-muted">Masuk Internal — Staf &amp; Regulator</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-4">
            <h1 className="text-sm font-semibold text-navy mb-1">Masuk ke Portal Internal</h1>
            <p className="text-xs text-muted mb-4">
              Khusus staf Platform, Bursa, Kliring, Bappebti, dan Admin Sistem.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {error && (
                <p className="rounded-md border border-red/30 bg-red-bg px-3 py-2 text-xs text-red">
                  {error}
                </p>
              )}
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="contoh: dewi"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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

            <details className="mt-4 group">
              <summary className="text-[11px] text-navy font-medium cursor-pointer select-none">
                Lihat Kredensial Demo
              </summary>
              <div className="mt-2 rounded-md border border-border overflow-hidden">
                <table className="w-full text-[11px]">
                  <thead className="bg-muted-bg text-muted">
                    <tr>
                      <th className="text-left font-medium px-2 py-1.5">Persona</th>
                      <th className="text-left font-medium px-2 py-1.5">Username</th>
                      <th className="text-left font-medium px-2 py-1.5">Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INTERNAL_ACCOUNTS.map((a) => (
                      <tr key={a.username} className="border-t border-border">
                        <td className="px-2 py-1.5">
                          <p className="font-medium text-foreground">{a.name}</p>
                          <p className="text-muted">{a.institution}</p>
                        </td>
                        <td className="px-2 py-1.5 font-mono">{a.username}</td>
                        <td className="px-2 py-1.5 font-mono">{a.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
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
