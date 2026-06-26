import { Zap, ArrowRight, Search, Shield, BarChart2, Sun, Moon } from 'lucide-react'

const FEATURES = [
  { icon: <Zap      size={13} strokeWidth={1.8} />, label: 'SEO Score',   sub: 'Instant 0–100 rating'   },
  { icon: <Search   size={13} strokeWidth={1.8} />, label: 'Keyword Gaps',sub: 'Missing keyword signals' },
  { icon: <Shield   size={13} strokeWidth={1.8} />, label: 'Tech Health', sub: 'Tags, schema, mobile'    },
  { icon: <BarChart2 size={13} strokeWidth={1.8}/>, label: 'Competitors', sub: 'vs. top 10 SERP results' },
]

export default function WelcomeScreen({
  url = 'example.com',
  keyword = '',
  onKeywordChange,
  offlineCount = 0,
  onlineCount  = 0,
  onAudit,
  onSignUp,
  theme = 'dark',
  onToggleTheme,
  lastScore = null,
}) {
  return (
    <div className="welcome-wrap">

      {/* ── Ambient orbs ── */}
      <div className="w-orb w-orb1" />
      <div className="w-orb w-orb2" />

      {/* ── Brand bar ── */}
      <div className="w-brand">
        <div className="w-brand-icon">
          <Zap size={11} fill="white" strokeWidth={0} />
        </div>
        <span className="w-brand-name">
          Rank<span>ly</span>
        </span>
        <span className="w-brand-badge">FREE</span>

        {/* Theme toggle - pushed to the right */}
        <button className="w-theme-btn" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'dark'
            ? <Sun  size={12} strokeWidth={2} />
            : <Moon size={12} strokeWidth={2} />}
        </button>
      </div>

      {/* ── Hero icon ── */}
      <div className="w-hero">
        <div className="w-hero-core">
          <Zap size={15} strokeWidth={2} color="var(--teal)" />
        </div>
      </div>

      {/* ── Headline ── */}
      <h1 className="w-headline">
        Page 3 is where good<br />
        <span className="w-headline-accent">content dies.</span>
      </h1>
      <p className="w-sub">
        Instant audit - 70+ checks, live keyword signals,<br />and ML rank prediction.
      </p>

      {/* ── Current URL chip ── */}
      {url && (
        <div className="w-url-chip">
          <div className="https-dot" />
          <span className="w-url-txt">{url}</span>
          {lastScore && (
            <span className="w-last-score-chip" style={{
              color: lastScore.score >= 70 ? 'var(--green)' : lastScore.score >= 45 ? 'var(--amber)' : 'var(--red)'
            }}>
              · Last: {lastScore.score}/100
            </span>
          )}
        </div>
      )}

      {/* ── Target Keyword Input ── */}
      <div className="w-keyword-input-container">
        <div className="w-keyword-label">Target Keyword</div>
        <input
          type="text"
          className="w-keyword-input"
          placeholder="e.g. buy laptops, organic tea"
          value={keyword}
          onChange={e => onKeywordChange(e.target.value)}
        />
        <div className="w-keyword-hint">
          Checks keyword density, title, meta description, and H1 presence.
        </div>
      </div>

      {/* ── Scan usage badges ── */}
      <div className="w-usage-badges">
        <div className="w-usage-badge" style={{ color: offlineCount >= 5 ? 'var(--red)' : 'var(--muted)' }}>
          Offline: {Math.max(0, 5 - offlineCount)}/5 left
        </div>
        <div className="w-usage-badge" style={{ color: onlineCount >= 3 ? 'var(--red)' : 'var(--muted)' }}>
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
        <button className="cta-primary" onClick={onAudit} disabled={!keyword.trim()}>
          <Zap size={13} fill="white" strokeWidth={0} />
          Run Audit
          <ArrowRight size={11} strokeWidth={2.5} color="white" />
        </button>
        <button className="cta-secondary" onClick={onSignUp}>
          Sign Up for Full Reports
        </button>
      </div>

      <div className="cta-footnote" style={{ marginTop: '10px' }}>
        Free instant scan · No account required
      </div>

    </div>
  )
}
