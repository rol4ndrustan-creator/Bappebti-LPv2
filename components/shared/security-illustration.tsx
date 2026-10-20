/**
 * Abstract shield/lock illustration for the internal staff login page (Bab
 * III item 1) — evokes data protection and regulatory compliance without
 * any photographic or trademarked imagery, consistent with the app's
 * existing SVG-pattern illustrations (see hero-banner.tsx).
 */
export function SecurityIllustration() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 480"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="sec-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--navy-light)" />
          <stop offset="100%" stopColor="var(--navy-dark)" />
        </linearGradient>
      </defs>
      <rect width="400" height="480" fill="url(#sec-bg)" />

      {/* faint orbiting rings */}
      <circle cx="80" cy="90" r="60" fill="white" fillOpacity="0.05" />
      <circle cx="340" cy="420" r="90" fill="white" fillOpacity="0.05" />
      <circle cx="350" cy="60" r="30" fill="white" fillOpacity="0.07" />

      {/* connecting dots suggesting a protected data network */}
      <g stroke="white" strokeOpacity="0.18" strokeWidth="1.5">
        <line x1="40" y1="180" x2="120" y2="140" />
        <line x1="120" y1="140" x2="110" y2="260" />
        <line x1="280" y1="150" x2="340" y2="200" />
        <line x1="290" y1="340" x2="340" y2="380" />
        <line x1="70" y1="340" x2="120" y2="300" />
      </g>
      <g fill="white" fillOpacity="0.3">
        <circle cx="40" cy="180" r="4" />
        <circle cx="120" cy="140" r="4" />
        <circle cx="110" cy="260" r="4" />
        <circle cx="280" cy="150" r="4" />
        <circle cx="340" cy="200" r="4" />
        <circle cx="290" cy="340" r="4" />
        <circle cx="340" cy="380" r="4" />
        <circle cx="70" cy="340" r="4" />
        <circle cx="120" cy="300" r="4" />
      </g>

      {/* central shield + lock */}
      <g transform="translate(200 240)">
        <path
          d="M0 -95 L78 -60 V10 C78 70 40 108 0 125 C-40 108 -78 70 -78 10 V-60 Z"
          fill="white"
          fillOpacity="0.1"
          stroke="white"
          strokeOpacity="0.5"
          strokeWidth="3"
        />
        <rect x="-26" y="-8" width="52" height="42" rx="6" fill="white" fillOpacity="0.85" />
        <path
          d="M-16 -8 V-24 a16 16 0 0 1 32 0 V-8"
          fill="none"
          stroke="white"
          strokeOpacity="0.85"
          strokeWidth="6"
        />
        <circle cx="0" cy="12" r="5" fill="var(--navy-dark)" />
      </g>
    </svg>
  );
}
