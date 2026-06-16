/**
 * WelcomeScreen — first thing the user sees when they open the extension.
 * Shows branding, the current page URL, feature grid, and CTAs.
 */
const FEATURES = [
  { icon: '⚡', label: 'SEO Score',       sub: 'Instant 0–100 rating'    },
  { icon: '🔍', label: 'Keyword Gaps',    sub: 'Missing keyword signals'  },
  { icon: '🛡️', label: 'Tech Health',    sub: 'Tags, schema, mobile'     },
  { icon: '📊', label: 'Competitors',     sub: 'vs. top 10 results'       },
]

export default function WelcomeScreen({ url = 'example.com', keyword = '', onKeywordChange, offlineCount = 0, onlineCount = 0, onAudit, onSignUp }) {
  return (
    <div className="welcome-wrap">

      {/* ── Brand bar ── */}
      <div className="w-brand">
        <div className="w-brand-icon">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
            <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
          </svg>
        </div>
        <span className="w-brand-name" style={{ fontFamily: "'Outfit',sans-serif" }}>
          SEO<span>Insight</span>
        </span>
        <span className="w-brand-badge">FREE</span>
      </div>

      {/* ── Headline ── */}
      <h1 className="w-headline" style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700 }}>
        SEO Page Audit
      </h1>
      <p className="w-sub">
        Analyse your page's SEO score, keyword targeting, and technical health.
      </p>

      {/* ── Current URL chip ── */}
      <div className="w-url-chip">
        <div className="https-dot" />
        <span className="w-url-txt">{url}</span>
      </div>

      {/* ── Target Keyword Input ── */}
      <div className="w-keyword-input-container">
        <div className="w-keyword-label">Target Keyword</div>
        <input
          type="text"
          className="w-keyword-input"
          placeholder="e.g. buy laptops, organic tea"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
        <div className="w-keyword-hint">Calculates keyword density and checks presence in title, desc, and H1 tags.</div>
      </div>

      {/* ── Scan Usage Badges ── */}
      <div className="w-usage-badges" style={{ display: 'flex', gap: '8px', margin: '-8px auto 24px', justifyContent: 'center', width: '100%' }}>
        <div className="w-usage-badge" style={{
          padding: '4px 10px', background: 'rgba(255,255,255,.02)',
          border: '1px solid var(--b)', borderRadius: '12px',
          fontSize: '9.5px', color: offlineCount >= 5 ? 'var(--red)' : 'var(--muted)',
          fontFamily: "'DM Mono', monospace"
        }}>
          Offline: {Math.max(0, 5 - offlineCount)}/5 left
        </div>
        <div className="w-usage-badge" style={{
          padding: '4px 10px', background: 'rgba(255,255,255,.02)',
          border: '1px solid var(--b)', borderRadius: '12px',
          fontSize: '9.5px', color: onlineCount >= 3 ? 'var(--red)' : 'var(--muted)',
          fontFamily: "'DM Mono', monospace"
        }}>
          Online: {Math.max(0, 3 - onlineCount)}/3 left
        </div>
      </div>

      {/* ── Feature grid ── */}
      <div className="w-features">
        {FEATURES.map(f => (
          <div key={f.label} className="w-feat">
            <span className="w-feat-icon">{f.icon}</span>
            <div>
              <div className="w-feat-label">{f.label}</div>
              <div className="w-feat-sub">{f.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CTAs ── */}
      <div className="w-ctas">
        <button id="btn-perform-audit" className="cta-primary" onClick={onAudit} disabled={!keyword.trim()}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
            <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
          </svg>
          Perform Audit
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        <button id="btn-sign-up" className="cta-secondary" onClick={onSignUp}>
          Sign Up for Full Reports
        </button>
      </div>

      <div className="cta-footnote" style={{ marginTop: '10px' }}>
        Free instant scan · No account required
      </div>

    </div>
  )
}
