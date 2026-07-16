// Signature motif: a glowing focus ring — used in the pomodoro timer,
// streak indicators, goal progress, and hero section.
export default function ProgressRing({
  size = 120,
  stroke = 10,
  progress = 0, // 0-100
  color = 'var(--color-amber-400)',
  trackColor = 'var(--color-ink-700)',
  glow = true,
  children,
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(progress, 0), 100) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" opacity="0.4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: glow ? 'drop-shadow(0 0 8px rgba(245,184,65,0.55))' : 'none',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
