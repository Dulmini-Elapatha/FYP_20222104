interface ScoreRingProps {
  score: number // 0 to 1
  size?: number
  strokeWidth?: number
  label?: string
}

export default function ScoreRing({ score, size = 120, strokeWidth = 8, label }: ScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(1, score))
  const offset = circumference - pct * circumference

  const color =
    pct >= 0.7 ? '#14b8a6' :
    pct >= 0.4 ? '#f59e0b' : '#ef4444'

  const textColor =
    pct >= 0.7 ? 'text-teal-400' :
    pct >= 0.4 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1s ease-out',
              filter: `drop-shadow(0 0 6px ${color}88)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-display font-bold ${textColor}`}>
            {Math.round(pct * 100)}%
          </span>
        </div>
      </div>
      {label && <p className="text-xs text-white/40 font-medium">{label}</p>}
    </div>
  )
}
