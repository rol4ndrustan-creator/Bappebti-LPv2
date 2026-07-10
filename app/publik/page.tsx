import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  History,
  ClipboardList,
  IdCard,
  Building2,
  Hash,
  FileClock,
  MessageSquareText,
  Receipt,
  Target,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

const HIGHLIGHTS = [
  { icon: ClipboardList, title: "TIKET RESMI", desc: "1 tiket per pengaduan, dapat dipantau kapan saja" },
  { icon: ShieldCheck, title: "BATAS WAKTU TINDAK LANJUT", desc: "Setiap tahapan memiliki batas waktu yang dipantau" },
  { icon: History, title: "JEJAK AUDIT", desc: "Seluruh riwayat penanganan tercatat" },
];

const CHECKLIST = [
  { icon: IdCard, text: "Identitas dan kontak yang dapat diverifikasi" },
  { icon: Building2, text: "Nama pelaku usaha yang dilaporkan" },
  { icon: Hash, text: "Nomor akun atau ID pengguna" },
  { icon: Receipt, text: "Referensi transaksi (jika ada)" },
  { icon: FileClock, text: "Kronologi kejadian secara berurutan" },
  { icon: MessageSquareText, text: "Bukti komunikasi dengan pelaku usaha" },
  { icon: Receipt, text: "Bukti pembayaran atau transaksi" },
  { icon: Target, text: "Solusi yang diharapkan" },
];

export default function PublikLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background w-full">
      {/* Top header with login/register links */}
      <header className="bg-navy-dark">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <div className="flex size-6 items-center justify-center rounded bg-white text-navy text-xs font-bold">
              B
            </div>
            <span className="text-xs font-semibold tracking-wide">BAPPEBTI</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/publik/login" className="text-white/80 hover:text-white">
              Masuk
            </Link>
            <Link
              href="/publik/register"
              className="rounded-md bg-white px-3 py-1.5 font-medium text-navy hover:bg-white/90"
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-navy">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-14 md:py-20 flex flex-col items-start gap-4">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white/80">
            Layanan Pengaduan Online Bappebti
          </span>
          <h1 className="text-2xl md:text-4xl font-semibold text-white max-w-2xl leading-tight">
            Sampaikan pengaduan secara resmi dan pantau penanganannya dengan jelas.
          </h1>
          <p className="text-sm text-white/70 max-w-2xl leading-relaxed">
            Layanan Pengaduan Online Bappebti membantu masyarakat menyampaikan permasalahan terkait
            kegiatan yang berada dalam pengawasan Bappebti, melengkapi bukti, memantau tindak lanjut,
            dan memberikan tanggapan atas solusi yang diajukan.
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <Link href="/publik/cek-kelayakan">
              <Button size="lg" className="bg-white text-navy hover:bg-white/90">
                Periksa dan Buat Pengaduan
              </Button>
            </Link>
            <Link href="/publik/login">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Cek Status Pengaduan
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Highlight cards */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 -mt-8 md:-mt-10 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HIGHLIGHTS.map((h) => {
            const Icon = h.icon;
            return (
              <div
                key={h.title}
                className="rounded-lg border border-border bg-card p-4 shadow-sm flex items-start gap-3"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-navy/10 text-navy">
                  <Icon className="size-4.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-navy tracking-wide">{h.title}</p>
                  <p className="text-xs text-muted mt-0.5">{h.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Emergency alert */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8 md:mt-10 w-full">
        <div className="flex items-start gap-3 rounded-lg border border-red/30 bg-red-bg px-4 py-3">
          <ShieldAlert className="size-5 text-red shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red">Jika akun Anda sedang diakses pihak lain atau dana sedang dipindahkan</p>
            <p className="text-xs text-foreground/80 mt-1">
              Segera amankan akun Anda dan hubungi pelaku usaha melalui saluran resmi. Jangan
              membagikan OTP, PIN, kata sandi, atau kode pemulihan kepada siapa pun.
            </p>
          </div>
        </div>
      </section>

      {/* Preparation checklist */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16 w-full">
        <h2 className="text-base font-semibold text-navy uppercase tracking-wide mb-1">
          Sebelum Mengajukan Pengaduan, Siapkan
        </h2>
        <p className="text-xs text-muted mb-6 max-w-2xl">
          Melengkapi hal berikut sejak awal akan mempercepat proses pemeriksaan pengaduan Anda.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {CHECKLIST.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.text} className="rounded-lg border border-border bg-card p-3 flex items-start gap-2.5">
                <Icon className="size-4 text-navy shrink-0 mt-0.5" />
                <p className="text-xs text-foreground leading-snug">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Service explanation */}
      <section className="bg-card border-y border-border">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16 w-full">
          <h2 className="text-base font-semibold text-navy uppercase tracking-wide mb-6">
            Yang Perlu Anda Ketahui
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow
              icon={CheckCircle2}
              tone="green"
              title="Setelah pengaduan disampaikan"
              text="Bappebti melakukan pemeriksaan awal, memverifikasi kelengkapan data, lalu meneruskan pengaduan kepada pihak yang berwenang menindaklanjuti."
            />
            <InfoRow
              icon={AlertTriangle}
              tone="amber"
              title="Informasi yang mungkin dibagikan"
              text="Sebagian informasi pengaduan Anda (di luar data sensitif) dapat diteruskan kepada pihak yang dilaporkan agar dapat memberikan tanggapan, kecuali pada laporan entitas tidak berizin."
            />
            <InfoRow
              icon={XCircle}
              tone="red"
              title="Tidak ada jaminan kompensasi"
              text="Penyampaian pengaduan tidak secara otomatis menjamin pengembalian dana atau kompensasi. Setiap kasus dinilai berdasarkan bukti dan fakta yang ada."
            />
            <InfoRow
              icon={ShieldAlert}
              tone="navy"
              title="Informasi yang tidak benar"
              text="Informasi yang tidak akurat atau tidak benar dapat memperlambat proses, dan dapat memengaruhi keputusan atas pengaduan Anda."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-4 text-[11px] text-muted">
          © 2026 Badan Pengawas Perdagangan Berjangka Komoditi (Bappebti). Layanan Pengaduan Online —
          Demo Proposal PT Capio Teknologi Indonesia.
        </div>
      </footer>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  tone,
  title,
  text,
}: {
  icon: typeof CheckCircle2;
  tone: "green" | "amber" | "red" | "navy";
  title: string;
  text: string;
}) {
  const toneMap = { green: "text-green bg-green-bg", amber: "text-amber bg-amber-bg", red: "text-red bg-red-bg", navy: "text-navy bg-navy/10" };
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3.5">
      <div className={`flex size-8 shrink-0 items-center justify-center rounded-md ${toneMap[tone]}`}>
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted mt-0.5 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
