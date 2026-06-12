import ScoreRing from './ScoreRing'

const CHECKS = [
  { name: 'HTTPS Secure',      val: 'Active',           cls: 'pass' },
  { name: 'Page Title',        val: 'Keyword missing',  cls: 'fail' },
  { name: 'Meta Description',  val: 'Too short + no KW',cls: 'fail' },
  { name: 'Canonical Tag',     val: 'Set',              cls: 'pass' },
  { name: 'Mobile Viewport',   val: 'Configured',       cls: 'pass' },
  { name: 'Structured Data',   val: 'Not found',        cls: 'warn' },
]

const STATS = [
  { val: '1,250', color: 'var(--red)',   lbl: 'Words'      },
  { val: '1.2%',  color: 'var(--amber)', lbl: 'KW Density' },
  { val: '3/4',   color: 'var(--green)', lbl: 'Tech Score'  },
]

function icon(cls) {
  return cls === 'pass' ? '✓' : cls === 'fail' ? '✗' : '⚠'
}

function iconColor(cls) {
  return cls === 'pass' ? 'var(--green)' : cls === 'fail' ? 'var(--red)' : 'var(--amber)'
}

export default function ResultsView({ score = 68, keyword = 'buy cheap laptops', auditMode = 'cloud' }) {
  const gradeLabel =
    score >= 70 ? 'High' : score >= 45 ? 'Medium' : 'Low'

  const gradeClass =
    score >= 70 ? 'grade-high' : score >= 45 ? 'grade-medium' : 'grade-low'

  return (
    <div className="results">

      {/* ── Score row ── */}
      <div className="score-row">
        <ScoreRing score={score} />
        <div className="score-info">
          <div className="score-grade-row">
            <span className={`score-grade ${gradeClass}`} style={{ fontFamily: "'Syne',sans-serif" }}>
              {gradeLabel}
            </span>
            <span className="score-grade-lbl">SEO Grade</span>
          </div>
          
          {/* Technical Accuracy Badge */}
          <div className={`audit-badge ${auditMode === 'local' ? 'badge-local' : 'badge-cloud'}`}>
            <span className="audit-badge-dot" />
            <span className="audit-badge-text">
              {auditMode === 'local' ? 'Offline Model (46.5% Accuracy)' : 'Full Pipeline (83.8% Accuracy)'}
            </span>
          </div>

          <div className="score-headline">
            {auditMode === 'local' 
              ? 'Local audit complete — recommendations based on HTML static factors' 
              : 'Needs work — 3 critical issues are hurting your rank'}
          </div>
          <div className="score-sub">Keyword: '{keyword}'</div>
        </div>
      </div>

      {/* ── Page at a glance (stats) ── */}
      <div className="section">
        <div className="section-lbl">Page at a glance</div>
        <div className="stats-mini">
          {STATS.map(s => (
            <div key={s.lbl} className="stat-mini">
              <div className="sm-val" style={{ fontFamily: "'Syne',sans-serif", color: s.color }}>
                {s.val}
              </div>
              <div className="sm-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick checks ── */}
      <div className="section">
        <div className="section-lbl">Quick checks</div>
        <div className="checks">
          {CHECKS.map((c, i) => (
            <div key={i} className="check-row">
              <div className="check-left">
                <span className="check-icon" style={{ color: iconColor(c.cls) }}>
                  {icon(c.cls)}
                </span>
                <span className="check-name">{c.name}</span>
              </div>
              <span className={`check-val ${c.cls}`}>{c.val}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
