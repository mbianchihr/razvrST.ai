export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="lgm" x1="6" y1="4" x2="42" y2="44">
          <stop stopColor="#19d6bc" />
          <stop offset="1" stopColor="#0a7d6e" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#lgm)" />
      {/* recycling loop formed by two leaves */}
      <path
        d="M24 11c-6.6 0-12 5.4-12 12 0 4 2 7.6 5 9.8"
        stroke="#fff"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M24 11c6.6 0 12 5.4 12 12 0 4-2 7.6-5 9.8"
        stroke="#ffffff"
        strokeOpacity="0.5"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* arrowhead */}
      <path
        d="M17 30.5l-2.6 4 4.6.7z"
        fill="#fff"
      />
      {/* leaf seed center */}
      <circle cx="24" cy="23.5" r="4.4" fill="#fff" />
      <path
        d="M24 27.6c2.6-1 4.1-3.3 4.1-6.1"
        stroke="#0a7d6e"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <span className="font-display font-extrabold tracking-[-0.03em] text-[1.5rem] leading-none">
        <span className="text-ink">razvr</span>
        <span className="text-mint">ST</span>
        <span className="text-ink-soft">.ai</span>
      </span>
    </span>
  );
}
