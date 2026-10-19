/**
 * Abstract hero banner background (Section: Bab I.2.a / Bab II.1 of the
 * review brief) — a clean, non-photographic pattern evoking commodities
 * trading and regulatory oversight (candlestick bars + soft orbiting
 * rings), kept low-contrast and anchored to the right so it never competes
 * with the headline text on the left.
 */
export function HeroBannerPattern() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 800 400"
      preserveAspectRatio="xMaxYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]"
    >
      <defs>
        <linearGradient id="hero-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="45%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <mask id="hero-mask">
          <rect x="0" y="0" width="800" height="400" fill="url(#hero-fade)" />
        </mask>
      </defs>
      <g mask="url(#hero-mask)">
        <circle cx="700" cy="80" r="130" fill="white" fillOpacity="0.08" />
        <circle cx="600" cy="300" r="90" fill="white" fillOpacity="0.06" />
        <circle cx="770" cy="340" r="50" fill="white" fillOpacity="0.1" />

        {/* Abstract candlestick / market-bar motif */}
        {[
          { x: 500, h: 60, wick: 90 },
          { x: 530, h: 110, wick: 150 },
          { x: 560, h: 40, wick: 70 },
          { x: 590, h: 150, wick: 190 },
          { x: 620, h: 80, wick: 120 },
          { x: 650, h: 130, wick: 170 },
          { x: 680, h: 70, wick: 100 },
          { x: 710, h: 160, wick: 200 },
          { x: 740, h: 95, wick: 135 },
        ].map((bar, i) => {
          const baseline = 260;
          return (
            <g key={bar.x} stroke="white" strokeOpacity={0.35} strokeWidth="2">
              <line x1={bar.x} y1={baseline - bar.wick} x2={bar.x} y2={baseline + 20} />
              <rect
                x={bar.x - 6}
                y={baseline - bar.h}
                width="12"
                height={bar.h}
                fill="white"
                fillOpacity={i % 2 === 0 ? 0.18 : 0.1}
                stroke="none"
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
