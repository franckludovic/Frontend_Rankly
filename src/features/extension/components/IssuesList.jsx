import { AlertTriangle, Lock, Check, X } from 'lucide-react'

function LockedSection({ label, sub, children, isUnavailable = false }) {
  return (
    <div className={`locked-section ${isUnavailable ? 'unavail-section' : ''}`} style={{ position: 'relative', overflow: 'hidden', padding: '12px 16px', borderBottom: '1px solid var(--b)' }}>
      <div className="locked-blur" style={{ filter: 'blur(3px)', opacity: 0.35, pointerEvents: 'none', userSelect: 'none' }}>
        {children}
      </div>
      <div className="locked-overlay" style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '4px',
        background: 'rgba(3,12,26,.65)', backdropFilter: 'blur(1.5px)', zIndex: 2,
        textAlign: 'center', justifyContent: 'center'
      }}>
        <div className="lock-icon" style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', margin: '0 auto'
        }}>
          {isUnavailable ? <AlertTriangle size={14} strokeWidth={1.8} /> : <Lock size={14} strokeWidth={1.8} />}
        </div>
        <div className="lock-lbl" style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '2px' }}>
          {label}
        </div>
        {sub && (
          <div className="lock-sub" style={{ fontSize: '10px', color: 'var(--muted)', opacity: 0.8 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

export default function IssuesList({ auditMode = 'cloud', scrapedData, keyword = 'buy laptops' }) {
  const isCloud = auditMode === 'cloud'

  const title = scrapedData?.title ?? ''
  const metaDesc = scrapedData?.metaDesc ?? ''
  const isHttps = scrapedData?.isHttps ?? true
  const viewport = scrapedData?.viewport ?? true
  const wordCount = scrapedData?.wordCount ?? 0
  const canonical = scrapedData?.canonical ?? ''
  const hasSchema = scrapedData?.hasSchema ?? false
  
  const hasTitleKeyword = title.toLowerCase().includes(keyword.toLowerCase())
  const hasDescKeyword = metaDesc.toLowerCase().includes(keyword.toLowerCase())

  const issues = []

  // Gather critical issues
  if (!isHttps) {
    issues.push({
      text: 'Page is insecure (not served over HTTPS). Security is a critical ranking factor.',
      severity: 'Critical',
      cls: 'crit'
    })
  }

  if (!viewport) {
    issues.push({
      text: 'Viewport meta tag is missing. Page will fail mobile-friendliness audits.',
      severity: 'Critical',
      cls: 'crit'
    })
  }

  if (!title) {
    issues.push({
      text: 'Page title is missing. The title tag is the most important on-page SEO signal.',
      severity: 'Critical',
      cls: 'crit'
    })
  } else if (!hasTitleKeyword) {
    issues.push({
      text: `Target keyword "${keyword}" is missing from the page title.`,
      severity: 'Critical',
      cls: 'crit'
    })
  }

  // Gather high issues
  if (wordCount > 0 && wordCount < 500) {
    issues.push({
      text: `Thin content detected (${wordCount} words). High-ranking pages typically have 1,000+ words.`,
      severity: 'High',
      cls: 'warn'
    })
  } else if (wordCount > 0 && wordCount < 1000) {
    issues.push({
      text: `Moderate word count (${wordCount} words). Consider expanding content for better depth.`,
      severity: 'Medium',
      cls: 'warn'
    })
  }

  if (!metaDesc) {
    issues.push({
      text: 'Meta description tag is missing. Search engines will generate automated snippets.',
      severity: 'High',
      cls: 'warn'
    })
  } else {
    if (!hasDescKeyword) {
      issues.push({
        text: `Target keyword "${keyword}" is missing from the meta description.`,
        severity: 'High',
        cls: 'warn'
      })
    }
    if (metaDesc.length < 120) {
      issues.push({
        text: `Meta description is short (${metaDesc.length} chars). Aim for 120-160 characters.`,
        severity: 'Medium',
        cls: 'warn'
      })
    } else if (metaDesc.length > 160) {
      issues.push({
        text: `Meta description is too long (${metaDesc.length} chars). Keep it under 160 characters.`,
        severity: 'Medium',
        cls: 'warn'
      })
    }
  }

  if (!canonical) {
    issues.push({
      text: 'Canonical URL is not specified. Duplicate versions of this page may hurt search performance.',
      severity: 'Medium',
      cls: 'warn'
    })
  }

  if (!hasSchema) {
    issues.push({
      text: 'Structured schema markup (JSON-LD) not detected. Rich snippets will not be available in search results.',
      severity: 'Medium',
      cls: 'warn'
    })
  }

  const shownIssues = isCloud ? issues.slice(0, 2) : issues
  const lockedIssuesCount = isCloud ? Math.max(0, issues.length - 2) : 0

  return (
    <>
      <div className="section">
        <div className="section-lbl">Identified Improvements</div>
        {shownIssues.length > 0 ? (
          <div className="issue-list">
            {shownIssues.map((issue, idx) => (
              <div key={idx} className={`issue-row ${issue.cls}`}>
                <div className={`issue-dot ${issue.cls}`}/>
                <div className="issue-text">{issue.text}</div>
                <span className={`issue-badge ${issue.cls}`}>{issue.severity}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '11.5px', color: 'var(--green)', padding: '4px 0', display:'flex', alignItems:'center', gap:'4px' }}>
            <Check size={12} strokeWidth={2} /> No major issues found! Your basic on-page SEO parameters are fully optimized.
          </div>
        )}
      </div>

      {/* ── Locked / Paywall Overlays (Only shown in Cloud Mode) ── */}
      {isCloud ? (
        <>
          {/* Locked Issues Overlay */}
          {lockedIssuesCount > 0 && (
            <LockedSection 
              label={`${lockedIssuesCount} more issues found`} 
              sub="Sign up to unlock the full issue reports"
            >
              <div className="fake-more-issues" style={{ padding: '4px 0' }}>
                <div className="fake-issue" style={{ height: '34px', background: 'rgba(255,255,255,.03)', borderRadius: '7px', border: '1px solid var(--b)', marginBottom: '5px' }}/>
                <div className="fake-issue" style={{ height: '34px', background: 'rgba(255,255,255,.03)', borderRadius: '7px', border: '1px solid var(--b)' }}/>
              </div>
            </LockedSection>
          )}

          {/* Locked Predicted Google Position */}
          <LockedSection 
            label="Predicted Google Position" 
            sub="Sign up to unlock AI ranking predictions"
          >
            <div>
              <div className="section-lbl">AI-Predicted Google Position</div>
              <div className="fake-rank-row" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div className="fake-rank-big" style={{ fontSize: '36px', fontWeight: 800, color: 'var(--indigo)' }}>#??</div>
                <div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '9px', color: 'var(--muted)', marginBottom: '4px' }}>
                    out of 100 results
                  </div>
                  <div style={{ height: '4px', width: '100px', background: 'rgba(99,102,241,.2)', borderRadius: '2px' }}/>
                </div>
              </div>
            </div>
          </LockedSection>

          {/* Locked Competitor Comparison */}
          <LockedSection 
            label="Competitor Comparison" 
            sub="See how top 10 pages optimize Alt tags and Schema"
          >
            <div>
              <div className="section-lbl">vs. Rank #1 competitor</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Word Count', 'Keyword Coverage', 'Schema'].map(m => (
                  <div key={m} style={{
                    flex: 1, height: '48px',
                    background: 'rgba(255,255,255,.04)',
                    borderRadius: '7px',
                    border: '1px solid rgba(255,255,255,.06)'
                  }}/>
                ))}
              </div>
            </div>
          </LockedSection>
        </>
      ) : (
        // Offline / Local Mode (All items unlocked, competitor comparison shown as unavailable)
        <>
          <div className="locked-section unavail-section" style={{ position: 'relative', overflow: 'hidden', padding: '12px 16px', borderBottom: '1px solid var(--b)' }}>
            <div className="locked-blur" style={{ filter: 'blur(3px)', opacity: 0.3, pointerEvents: 'none', userSelect: 'none' }}>
              <div className="section-lbl">vs. Rank #1 competitor</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Word Count', 'Keyword Coverage', 'Schema'].map(m => (
                  <div key={m} style={{ flex: 1, height: '48px', background: 'rgba(255,255,255,.04)', borderRadius: '7px', border: '1px solid rgba(255,255,255,.06)' }}/>
                ))}
              </div>
            </div>
            <div className="locked-overlay" style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '4px',
              background: 'rgba(3,12,26,.65)', zIndex: 2, padding: '10px', textAlign: 'center'
            }}>
              <AlertTriangle size={13} strokeWidth={1.8} />
              <div className="lock-lbl" style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 600 }}>
                Competitor Comparison Unavailable
              </div>
              <div className="lock-sub" style={{ fontSize: '10px', color: 'var(--muted)', opacity: 0.8 }}>
                Offline indexing requires a live public URL.
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
