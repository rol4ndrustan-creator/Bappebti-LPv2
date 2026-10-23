// Hand-rolled bar/line trend charts — same rationale as donut-chart.tsx
// (no charting library installed for this static-export prototype).

export interface BarSeriesDatum {
  label: string;
  value: number;
  color: string;
}

export interface BarGroupDatum {
  label: string;
  series: BarSeriesDatum[];
}

export function GroupedBarChart({ data, height = 140 }: { data: BarGroupDatum[]; height?: number }) {
  const max = Math.max(1, ...data.flatMap((d) => d.series.map((s) => s.value)));
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="flex-1 flex items-end justify-center gap-0.5 min-w-0 h-full" title={d.label}>
            {d.series.map((s) => (
              <div
                key={s.label}
                className="flex-1 rounded-t-[2px] min-w-[2px]"
                style={{ height: `${Math.max((s.value / max) * 100, s.value > 0 ? 2 : 0)}%`, background: s.color }}
                title={`${d.label} — ${s.label}: ${s.value}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center text-[9px] text-muted truncate">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface LinePoint {
  label: string;
  value: number;
}

export function LineTrendChart({ data, height = 140, color = "var(--navy)" }: { data: LinePoint[]; height?: number; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const width = 100;
  const padY = 8;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;
  const coords = data.map((d, i) => ({
    x: i * stepX,
    y: height - padY - (d.value / max) * (height - padY * 2),
  }));

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          points={coords.map((c) => `${c.x},${c.y}`).join(" ")}
        />
        {coords.map((c, i) => (
          <circle key={data[i].label} cx={c.x} cy={c.y} r={1.8} fill={color} vectorEffect="non-scaling-stroke">
            <title>{`${data[i].label}: ${data[i].value}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex mt-1">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center text-[9px] text-muted truncate">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
