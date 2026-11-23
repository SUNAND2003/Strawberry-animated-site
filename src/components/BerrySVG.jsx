export default function BerrySVG({ className = '' }) {
  return (
    <svg
      viewBox="0 0 100 126"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bf-body" x1="18" y1="24" x2="84" y2="122" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF5C78" />
          <stop offset="0.55" stopColor="#E81130" />
          <stop offset="1" stopColor="#9D0B22" />
        </linearGradient>
        <linearGradient id="bf-leaf" x1="50" y1="4" x2="50" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6BD985" />
          <stop offset="1" stopColor="#23772F" />
        </linearGradient>
      </defs>

      <path
        d="M50 122C14 97 6 63 21 41 33 23 67 23 79 41 94 63 86 97 50 122Z"
        fill="url(#bf-body)"
      />
      <path
        d="M50 7C44 25 33 31 15 28 23 40 33 46 50 46 67 46 77 40 85 28 67 31 56 25 50 7Z"
        fill="url(#bf-leaf)"
      />
      <rect x="47" y="1" width="6" height="17" rx="3" fill="#23772F" />

      <g fill="#FFE7A8">
        <ellipse cx="36" cy="58" rx="2.3" ry="3.3" transform="rotate(-14 36 58)" />
        <ellipse cx="52" cy="52" rx="2.3" ry="3.3" transform="rotate(4 52 52)" />
        <ellipse cx="67" cy="60" rx="2.3" ry="3.3" transform="rotate(16 67 60)" />
        <ellipse cx="30" cy="76" rx="2.3" ry="3.3" transform="rotate(-22 30 76)" />
        <ellipse cx="46" cy="72" rx="2.3" ry="3.3" transform="rotate(-4 46 72)" />
        <ellipse cx="62" cy="78" rx="2.3" ry="3.3" transform="rotate(12 62 78)" />
        <ellipse cx="40" cy="94" rx="2.2" ry="3.1" transform="rotate(-18 40 94)" />
        <ellipse cx="57" cy="95" rx="2.2" ry="3.1" transform="rotate(10 57 95)" />
        <ellipse cx="50" cy="110" rx="2" ry="2.8" />
      </g>

      <path
        d="M50 122C14 97 6 63 21 41 33 23 67 23 79 41 94 63 86 97 50 122Z"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />
    </svg>
  )
}
