// Minimal hand-rolled SVG donut chart — no charting library is installed
// (kept out on purpose for a static-export prototype), so every chart in
// this app is a small inline SVG/CSS component styled from the existing
// design tokens (--navy/--amber/--red/--green) rather than a generic
// palette, matching the stacked-bar pattern already used in
// app/admin/page.tsx.

export interface DonutDatum {
  label: string;
  value: number;
  /** A CSS color value, e.g. "var(--navy)". */
  color: string;
}

export function DonutChart({ data, size = 150, thickness = 22 }: { data: DonutDatum[]; size?: number; thickness?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativeFraction = 0;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={thickness} />
        {total > 0 &&
          data.map((d) => {
            if (d.value <= 0) return null;
            const fraction = d.value / total;
            const dash = fraction * circumference;
            const offset = cumulativeFraction * circumference;
            cumulativeFraction += fraction;
            return (
              <circle
                key={d.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
          })}
      </svg>
      <ul className="flex flex-col gap-1.5 text-xs min-w-0">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-foreground truncate">{d.label}</span>
            <span className="text-muted shrink-0 pl-2 tabular-nums">
              {d.value} {total > 0 && `(${Math.round((d.value / total) * 100)}%)`}
            </span>
          </li>
        ))}
        {total === 0 && <li className="text-muted">Belum ada data.</li>}
      </ul>
    </div>
  );
}
