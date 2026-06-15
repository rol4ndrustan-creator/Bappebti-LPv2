import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileCheck2, ShieldCheck, History, ClipboardList, Upload, ScanSearch, MessageSquareWarning, CheckCircle2 } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: FileCheck2,
    title: "TIKET RESMI",
    desc: "1 tiket per pengaduan",
  },
  {
    icon: ShieldCheck,
    title: "SLA",
    desc: "Tindak lanjut terpantau",
  },
  {
    icon: History,
    title: "AUDIT",
    desc: "Riwayat tercatat",
  },
];

const STEPS = [
  { icon: ClipboardList, title: "Isi data pengaduan" },
  { icon: Upload, title: "Unggah bukti pendukung" },
  { icon: ScanSearch, title: "Verifikasi Bappebti / sistem" },
  { icon: MessageSquareWarning, title: "Tindak lanjut pelaku usaha" },
  { icon: MessageSquareWarning, title: "Klarifikasi / eskalasi jika diperlukan" },
  { icon: CheckCircle2, title: "Resolusi dan penutupan kasus" },
];

export default function PublikLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
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
            Sampaikan pengaduan Anda secara resmi, mudah, dan terpantau.
          </h1>
          <p className="text-sm text-white/70 max-w-2xl leading-relaxed">
            Laporkan kendala transaksi, layanan pelaku usaha, penarikan dana, akses akun, dugaan
            pelanggaran, atau permasalahan lain dalam ruang lingkup pengawasan Bappebti.
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <Link href="/publik/login">
              <Button size="lg" className="bg-white text-navy hover:bg-white/90">
                BUAT PENGADUAN
              </Button>
            </Link>
            <Link href="/publik/login">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                CEK STATUS TIKET
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

      {/* Process section */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-16 w-full">
        <h2 className="text-base font-semibold text-navy uppercase tracking-wide mb-6">
          Alur Pengaduan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-lg border border-border bg-card p-4 flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy text-white text-xs font-semibold">
                  {i + 1}
                </div>
                <div className="flex flex-col gap-1">
                  <Icon className="size-4 text-navy" />
                  <p className="text-xs font-medium text-foreground leading-snug">{step.title}</p>
                </div>
              </div>
            );
          })}
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
