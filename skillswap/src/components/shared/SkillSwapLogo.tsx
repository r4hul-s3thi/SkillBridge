interface LogoProps {
  size?: number;
  className?: string;
}

export function SkillSwapLogo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background rounded square */}
      <rect width="40" height="40" rx="10" fill="url(#bgrad)" />

      {/* Bridge deck */}
      <path
        d="M6 26 H34"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Left tower */}
      <path d="M12 26 V13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Right tower */}
      <path d="M28 26 V13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />

      {/* Arch / cables from towers to center */}
      <path
        d="M12 13 Q20 7 28 13"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* Suspender cables */}
      <line x1="17" y1="18" x2="17" y2="26" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      <line x1="20" y1="15" x2="20" y2="26" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      <line x1="23" y1="18" x2="23" y2="26" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />

      {/* Road below bridge */}
      <path d="M6 29 H34" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" strokeDasharray="3 3" />

      <defs>
        <linearGradient id="bgrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
