import ScoreRing from './ScoreRing'

export default function ResultsView({ score = 68, keyword = 'buy laptops', auditMode = 'cloud', scrapedData }) {
  const isHttps = scrapedData?.isHttps ?? true
  const title = scrapedData?.title ?? ''
  const metaDesc = scrapedData?.metaDesc ?? ''
  const canonical = scrapedData?.canonical ?? ''
  const viewport = scrapedData?.viewport ?? true
  const hasSchema = scrapedData?.hasSchema ?? false
  const wordCount = scrapedData?.wordCount ?? 0

  const hasTitleKeyword = title.toLowerCase().includes(keyword.toLowerCase())
  const hasDescKeyword = metaDesc.toLowerCase().includes(keyword.toLowerCase())

  const CHECKS = [
    { 
      name: 'HTTPS Secure',      
      val: isHttps ? 'Active' : 'Insecure (HTTP)',           
      cls: isHttps ? 'pass' : 'fail' 
    },
    { 
      name: 'Page Title',        
      val: title ? (hasTitleKeyword ? 'Optimised' : 'Keyword missing') : 'Missing',  
      cls: title ? (hasTitleKeyword ? 'pass' : 'fail') : 'fail'
    },
    { 
      name: 'Meta Description',  
      val: metaDesc ? (hasDescKeyword ? 'Optimised' : 'Missing keyword') : 'Missing',
      cls: metaDesc ? (hasDescKeyword ? 'pass' : 'warn') : 'fail'
    },
    { 
      name: 'Canonical Tag',     
      val: canonical ? 'Set' : 'Missing',              
      cls: canonical ? 'pass' : 'warn' 
    },
    { 
      name: 'Mobile Viewport',   
      val: viewport ? 'Configured' : 'Missing',       
      cls: viewport ? 'pass' : 'fail' 
    },
    { 
      name: 'Structured Data',   
      val: hasSchema ? 'Found' : 'Not found',        
      cls: hasSchema ? 'pass' : 'warn' 
    },
  ]

  const passCount = CHECKS.filter(c => c.cls === 'pass').length

  let density = '0%'
  if (scrapedData?.keyword_density !== undefined) {
    density = scrapedData.keyword_density.toFixed(1) + '%'
  } else if (wordCount > 0 && keyword) {
    const kwClean = keyword.toLowerCase()
    const titleMatch = title.toLowerCase().includes(kwClean) ? 1 : 0
    const descMatch = metaDesc.toLowerCase().includes(kwClean) ? 1 : 0
    const freq = titleMatch + descMatch + 2
    density = ((freq / wordCount) * 100).toFixed(1) + '%'
  }

  const STATS = [
    { 
      val: wordCount.toLocaleString(), 
      color: wordCount >= 1000 ? 'var(--green)' : wordCount >= 500 ? 'var(--amber)' : 'var(--red)', 
      lbl: 'Words' 
    },
    { 
      val: density,  
      color: (parseFloat(density) >= 0.5 && parseFloat(density) <= 2.5) ? 'var(--green)' : 'var(--amber)', 
      lbl: 'KW Density' 
    },
    { 
      val: `${passCount}/6`,   
      color: passCount >= 5 ? 'var(--green)' : passCount >= 3 ? 'var(--amber)' : 'var(--red)', 
      lbl: 'Tech Score'  
    },
  ]

  const gradeLabel =
    score >= 70 ? 'High' : score >= 45 ? 'Medium' : 'Low'

  const gradeClass =
    score >= 70 ? 'grade-high' : score >= 45 ? 'grade-medium' : 'grade-low'

  function icon(cls) {
    return cls === 'pass' ? '✓' : cls === 'fail' ? '✗' : '⚠'
  }

  function iconColor(cls) {
    return cls === 'pass' ? 'var(--green)' : cls === 'fail' ? 'var(--red)' : 'var(--amber)'
  }

  return (
    <div className="results">

      {/* ── Score row ── */}
      <div className="score-row">
        <ScoreRing score={score} />
        <div className="score-info">
          <div className="score-grade-row">
            <span className={`score-grade ${gradeClass}`} style={{ fontFamily: "'Outfit',sans-serif" }}>
              {gradeLabel}
            </span>
            <span className="score-grade-lbl">SEO Grade</span>
          </div>

          <div className="score-headline">
            {passCount === 6 
              ? 'Excellent technical SEO — all signals verified successfully.' 
              : `Needs work — ${6 - passCount} issues found on this page.`}
          </div>
          <div className="score-sub">Target: '{keyword}'</div>
        </div>
      </div>

      {/* ── Page at a glance (stats) ── */}
      <div className="section">
        <div className="section-lbl">Page at a glance</div>
        <div className="stats-mini">
          {STATS.map(s => (
            <div key={s.lbl} className="stat-mini">
              <div className="sm-val" style={{ fontFamily: "'Outfit',sans-serif", color: s.color }}>
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
          {CHECKS.map((c, i) => {
            const isLocked = i === 5 && auditMode === 'cloud'
            
            return (
              <div key={i} className="check-row" style={{ position: 'relative', overflow: 'hidden' }}>
                <div className="check-left" style={{ filter: isLocked ? 'blur(2px)' : 'none', opacity: isLocked ? 0.4 : 1 }}>
                  <span className="check-icon" style={{ color: iconColor(c.cls) }}>
                    {icon(c.cls)}
                  </span>
                  <span className="check-name">{c.name}</span>
                </div>
                <span className={`check-val ${c.cls}`} style={{ filter: isLocked ? 'blur(2px)' : 'none', opacity: isLocked ? 0.4 : 1 }}>
                  {c.val}
                </span>

                {isLocked && (
                  <div className="check-lock-overlay" style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(3,12,26,.4)', backdropFilter: 'blur(1px)', zIndex: 2
                  }}>
                    <span style={{ fontSize: '9.5px', color: 'var(--muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '.4px' }}>
                      🔒 Sign up to unlock
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
