/**
 * ScoreRing- SVG donut ring showing SEO score.
 * Color is determined by score bracket (red / amber / green).
 * No glow/drop-shadow- clean crisp ring only.
 */
export default function ScoreRing({ score = 68 }) {
  const r    = 38, cx = 44, cy = 44
  const circ = 2 * Math.PI * r
  const fill = circ * (score / 100)
  const color = score >= 70 ? '#34d399' : score >= 45 ? '#fbbf24' : '#f87171'

  return (
    <div className="score-ring-wrap" style={{ width: 88, height: 88 }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="7"/>
        {/* Progress- no drop-shadow, clean ring */}
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - fill}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div className="score-center">
        <div className="score-n" style={{ color, fontFamily: "'Syne',sans-serif" }}>{score}</div>
        <div className="score-denom">/100</div>
      </div>
    </div>
  )
}
