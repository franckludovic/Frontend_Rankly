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

export default function WelcomeScreen({ url = 'example.com', onAudit, onSignUp }) {
  return (
    <div className="welcome-wrap">

      {/* Ambient background orbs */}
      <div className="w-orb w-orb1" aria-hidden="true" />
      <div className="w-orb w-orb2" aria-hidden="true" />

      {/* ── Brand bar ── */}
      <div className="w-brand">
        <div className="w-brand-icon">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
            <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
          </svg>
        </div>
        <span className="w-brand-name" style={{ fontFamily: "'Syne',sans-serif" }}>
          SEO<span>Insight</span>
        </span>
        <span className="w-brand-badge">FREE</span>
      </div>

      {/* ── Hero ring animation ── */}
      <div className="w-hero">
        <div className="w-ring w-ring-3" aria-hidden="true" />
        <div className="w-ring w-ring-2" aria-hidden="true" />
        <div className="w-ring w-ring-1" aria-hidden="true" />
        <div className="w-hero-core">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
            stroke="var(--teal)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
            <path d="M11 8v6M8 11h6"/>
          </svg>
        </div>
      </div>

      {/* ── Headline ── */}
      <h1 className="w-headline" style={{ fontFamily: "'Syne',sans-serif" }}>
        Instant SEO Audit<br/><span className="w-headline-accent">for Any Page</span>
      </h1>
      <p className="w-sub">
        Scores, keyword gaps, technical issues & competitor insights — in seconds.
      </p>

      {/* ── Current URL chip ── */}
      <div className="w-url-chip">
        <div className="https-dot" />
        <span className="w-url-txt">{url}</span>
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
        <button id="btn-perform-audit" className="cta-primary" onClick={onAudit}>
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
