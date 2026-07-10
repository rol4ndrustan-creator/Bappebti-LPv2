import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function PrototypeNotice({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border border-navy/20 bg-navy/5 px-3 py-2 text-[11px] text-navy",
        className
      )}
    >
      <Info className="size-3.5 shrink-0 mt-0.5" />
      <p>
        {children ?? (
          <>
            <span className="font-semibold">Mode Demonstrasi.</span> Data, autentikasi, dan unggahan
            dokumen pada halaman ini bersifat simulasi untuk kebutuhan prototipe dan belum terhubung ke
            sistem produksi.
          </>
        )}
      </p>
    </div>
  );
}
