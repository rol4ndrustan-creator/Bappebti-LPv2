"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PrototypeNotice } from "@/components/shared/prototype-notice";
import { AlertTriangle, CheckCircle2, ExternalLink, ShieldAlert, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTOR_OPTIONS = [
  "Perdagangan berjangka komoditi",
  "Aset kripto",
  "Perdagangan emas digital",
  "Sistem resi gudang",
  "Pasar lelang komoditas",
  "Saya belum yakin",
];

const CONTACT_OPTIONS = [
  "Sudah, tetapi belum selesai",
  "Sudah, tetapi tidak mendapat tanggapan",
  "Belum",
  "Perusahaan tidak dapat dihubungi",
  "Perusahaan diduga tidak berizin",
];

const RISK_OPTIONS = [
  "Akun sedang diakses pihak lain",
  "Dana sedang dipindahkan",
  "Dugaan penipuan sedang berlangsung",
  "Bukti dapat segera hilang",
  "Tidak ada risiko langsung",
];

type Outcome = "emergency" | "illegal-entity" | "unsure-referral" | "contact-first" | "eligible";

function deriveOutcome(sector: string, contact: string, risk: string): Outcome {
  if (risk !== "Tidak ada risiko langsung") return "emergency";
  if (contact === "Perusahaan diduga tidak berizin") return "illegal-entity";
  if (sector === "Saya belum yakin") return "unsure-referral";
  if (contact === "Belum") return "contact-first";
  return "eligible";
}

export default function CekKelayakanPage() {
  const [step, setStep] = React.useState(1);
  const [sector, setSector] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [risk, setRisk] = React.useState("");

  const canContinue = (step === 1 && sector) || (step === 2 && contact) || (step === 3 && risk);
  const outcome = step === 4 ? deriveOutcome(sector, contact, risk) : null;

  return (
    <div className="w-full max-w-[720px] mx-auto px-4 md:px-6 py-8 md:py-12">
      <p className="text-xs font-medium uppercase tracking-wide text-navy mb-1">Periksa dan Buat Pengaduan</p>
      <h1 className="text-xl md:text-2xl font-semibold text-navy mb-2">Pemeriksaan Awal Kelayakan Pengaduan</h1>
      <p className="text-sm text-muted mb-6 max-w-xl">
        Jawab tiga pertanyaan singkat berikut agar kami dapat mengarahkan Anda ke langkah yang paling
        tepat. Ini bukan formulir pengaduan — data yang Anda masukkan di sini tidak disimpan.
      </p>

      <PrototypeNotice className="mb-6" />

      {step <= 3 && (
        <div className="mb-6 flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={cn("h-1.5 flex-1 rounded-full", s <= step ? "bg-navy" : "bg-border")}
            />
          ))}
        </div>
      )}

      {step === 1 && (
        <QuestionCard
          question="Permasalahan Anda berkaitan dengan apa?"
          options={SECTOR_OPTIONS}
          value={sector}
          onChange={setSector}
        />
      )}
      {step === 2 && (
        <QuestionCard
          question="Apakah Anda sudah menghubungi pelaku usaha terkait?"
          options={CONTACT_OPTIONS}
          value={contact}
          onChange={setContact}
        />
      )}
      {step === 3 && (
        <QuestionCard
          question="Apakah terdapat risiko yang sedang berlangsung?"
          options={RISK_OPTIONS}
          value={risk}
          onChange={setRisk}
        />
      )}

      {step <= 3 && (
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className={step === 1 ? "invisible" : ""}
          >
            <ArrowLeft className="size-3.5" /> Kembali
          </Button>
          <Button size="sm" disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
            Lanjut <ArrowRight className="size-3.5" />
          </Button>
        </div>
      )}

      {step === 4 && outcome && <OutcomePanel outcome={outcome} onBack={() => setStep(3)} />}
    </div>
  );
}

function QuestionCard({
  question,
  options,
  value,
  onChange,
}: {
  question: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 md:p-5">
      <h2 className="text-sm font-semibold text-foreground mb-3">{question}</h2>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "text-left rounded-md border px-3 py-2.5 text-sm transition-colors",
              value === opt
                ? "border-navy bg-navy/5 text-navy font-medium"
                : "border-border hover:bg-muted-bg text-foreground"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function OutcomePanel({ outcome, onBack }: { outcome: Outcome; onBack: () => void }) {
  if (outcome === "emergency") {
    return (
      <div className="rounded-lg border border-red/30 bg-red-bg p-4 md:p-5">
        <div className="flex items-start gap-2 mb-2">
          <ShieldAlert className="size-5 text-red shrink-0" />
          <h2 className="text-sm font-semibold text-red">Terdapat Indikasi Risiko yang Sedang Berlangsung</h2>
        </div>
        <p className="text-sm text-foreground/90 mb-2">
          Segera amankan akun Anda dan hubungi pelaku usaha melalui saluran resmi. Jangan membagikan
          OTP, PIN, kata sandi, atau kode pemulihan kepada siapa pun.
        </p>
        <p className="text-xs text-muted mb-4">
          Pengaduan Anda akan diberi prioritas tinggi. Segera lengkapi pengaduan agar dapat ditindaklanjuti
          secepatnya oleh Bappebti dan pelaku usaha terkait.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/publik/pengaduan/baru">
            <Button size="sm" variant="destructive">
              Buat Pengaduan Prioritas Tinggi
            </Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={onBack}>
            Ubah Jawaban
          </Button>
        </div>
      </div>
    );
  }

  if (outcome === "illegal-entity") {
    return (
      <div className="rounded-lg border border-amber/40 bg-amber-bg p-4 md:p-5">
        <div className="flex items-start gap-2 mb-2">
          <AlertTriangle className="size-5 text-amber shrink-0" />
          <h2 className="text-sm font-semibold text-amber">Dugaan Pelaku Usaha Tidak Berizin</h2>
        </div>
        <p className="text-sm text-foreground/90 mb-2">
          Berdasarkan jawaban Anda, pihak yang dilaporkan diduga tidak memiliki izin dari Bappebti.
          Laporan ini akan diarahkan ke jalur khusus intelijen dan penegakan, dan identitas serta isi
          laporan Anda <span className="font-medium">tidak akan diteruskan kepada pihak yang dilaporkan</span>.
        </p>
        <p className="text-xs text-muted mb-4">
          Berdasarkan informasi awal, pengaduan Anda kemungkinan termasuk dalam ruang lingkup layanan
          ini. Bappebti tetap akan melakukan pemeriksaan awal setelah pengaduan disampaikan.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/publik/pengaduan/baru">
            <Button size="sm">Lanjutkan Laporan Entitas Tidak Berizin</Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={onBack}>
            Ubah Jawaban
          </Button>
        </div>
      </div>
    );
  }

  if (outcome === "unsure-referral") {
    return (
      <div className="rounded-lg border border-border bg-card p-4 md:p-5">
        <div className="flex items-start gap-2 mb-2">
          <ExternalLink className="size-5 text-navy shrink-0" />
          <h2 className="text-sm font-semibold text-navy">Kemungkinan Perlu Diarahkan ke Instansi Lain</h2>
        </div>
        <p className="text-sm text-foreground/90 mb-2">
          Karena Anda belum yakin dengan sektor permasalahan, layanan ini mungkin bukan yang paling
          sesuai. Bappebti hanya mengawasi perdagangan berjangka komoditi, aset kripto, emas digital,
          sistem resi gudang, dan pasar lelang komoditas.
        </p>
        <p className="text-xs text-muted mb-4">
          Berdasarkan informasi awal, pengaduan Anda kemungkinan termasuk dalam ruang lingkup layanan
          ini. Bappebti tetap akan melakukan pemeriksaan awal setelah pengaduan disampaikan, dan akan
          mengalihkan pengaduan ke instansi berwenang lain bila diperlukan.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/publik/pengaduan/baru">
            <Button size="sm">Tetap Ajukan Pengaduan</Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={onBack}>
            Ubah Jawaban
          </Button>
        </div>
      </div>
    );
  }

  if (outcome === "contact-first") {
    return (
      <div className="rounded-lg border border-amber/40 bg-amber-bg p-4 md:p-5">
        <div className="flex items-start gap-2 mb-2">
          <AlertTriangle className="size-5 text-amber shrink-0" />
          <h2 className="text-sm font-semibold text-amber">Disarankan Menghubungi Pelaku Usaha Terlebih Dahulu</h2>
        </div>
        <p className="text-sm text-foreground/90 mb-2">
          Bappebti umumnya menyarankan Anda menyampaikan keluhan kepada pelaku usaha terlebih dahulu
          dan memberikan waktu yang wajar untuk direspons. Anda tetap dapat melanjutkan pengaduan bila
          diinginkan.
        </p>
        <p className="text-xs text-muted mb-4">
          Berdasarkan informasi awal, pengaduan Anda kemungkinan termasuk dalam ruang lingkup layanan
          ini. Bappebti tetap akan melakukan pemeriksaan awal setelah pengaduan disampaikan.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/publik/pengaduan/baru">
            <Button size="sm">Lanjutkan Pengaduan</Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={onBack}>
            Ubah Jawaban
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-green/30 bg-green-bg p-4 md:p-5">
      <div className="flex items-start gap-2 mb-2">
        <CheckCircle2 className="size-5 text-green shrink-0" />
        <h2 className="text-sm font-semibold text-green">Layak Dilanjutkan</h2>
      </div>
      <p className="text-sm text-foreground/90 mb-4">
        Berdasarkan informasi awal, pengaduan Anda kemungkinan termasuk dalam ruang lingkup layanan
        ini. Bappebti tetap akan melakukan pemeriksaan awal setelah pengaduan disampaikan.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/publik/pengaduan/baru">
          <Button size="sm">Lanjutkan ke Formulir Pengaduan</Button>
        </Link>
        <Button size="sm" variant="ghost" onClick={onBack}>
          Ubah Jawaban
        </Button>
      </div>
    </div>
  );
}
