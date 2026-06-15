"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { PROVINCE_LIST } from "@/lib/mock-data";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    nomorIdentitas: "",
    email: "",
    hp: "",
    provinsi: "",
    kota: "",
    password: "",
    konfirmasiPassword: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/publik/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center mb-6 gap-2">
          <div className="flex size-10 items-center justify-center rounded-md bg-navy text-white text-base font-bold">
            B
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-navy">Layanan Pengaduan Bappebti</p>
            <p className="text-[11px] text-muted">Pendaftaran Akun Publik</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-4">
            <h1 className="text-sm font-semibold text-navy mb-1">Buat Akun Baru</h1>
            <p className="text-xs text-muted mb-4">
              Lengkapi data berikut untuk membuat akun dan mengajukan pengaduan.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nama">Nama lengkap</Label>
                  <Input
                    id="nama"
                    placeholder="Sesuai KTP"
                    value={form.nama}
                    onChange={(e) => update("nama", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nomorIdentitas">Nomor identitas (KTP)</Label>
                  <Input
                    id="nomorIdentitas"
                    placeholder="16 digit NIK"
                    value={form.nomorIdentitas}
                    onChange={(e) => update("nomorIdentitas", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email aktif</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hp">Nomor HP / WhatsApp</Label>
                  <Input
                    id="hp"
                    placeholder="08xxxxxxxxxx"
                    value={form.hp}
                    onChange={(e) => update("hp", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="provinsi">Provinsi domisili</Label>
                  <Select
                    id="provinsi"
                    value={form.provinsi}
                    onChange={(e) => update("provinsi", e.target.value)}
                    required
                  >
                    <option value="">Pilih provinsi</option>
                    {PROVINCE_LIST.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="kota">Kota / Kabupaten</Label>
                  <Input
                    id="kota"
                    placeholder="contoh: Jakarta Selatan"
                    value={form.kota}
                    onChange={(e) => update("kota", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="konfirmasiPassword">Konfirmasi password</Label>
                  <Input
                    id="konfirmasiPassword"
                    type="password"
                    placeholder="********"
                    value={form.konfirmasiPassword}
                    onChange={(e) => update("konfirmasiPassword", e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="mt-2 w-full">
                Daftar
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted mt-4">
          Sudah memiliki akun?{" "}
          <Link href="/publik/login" className="text-navy font-medium hover:underline">
            Masuk di sini
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
