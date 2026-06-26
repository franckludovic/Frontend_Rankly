import { Zap, Lock, ArrowRight, Sun, Moon } from 'lucide-react'

const APP_URL = 'https://rankly.app'

function openTab(url) {
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
    chrome.tabs.create({ url })
  } else {
    window.open(url, '_blank')
  }
}

export default function LimitScreen({ limitType = 'local', onBack, theme = 'dark', onToggleTheme }) {
  const isLocal   = limitType === 'local'
  const usedCount = isLocal ? 5 : 3
  const title     = isLocal ? 'Offline Scan Limit Reached' : 'Full Scan Limit Reached'
  const subtitle  = isLocal
    ? `You've used all 5 free offline audits. Upgrade to keep running local ML audits without limits.`
    : `You've used all 3 free online audits. Upgrade to Pro for 50 audits/month, PDF exports, and AI briefs.`

  return (
    <div className="limit-screen welcome-wrap">

      {/* Ambient orbs */}
      <div className="w-orb w-orb1" />
      <div className="w-orb w-orb2" />

      {/* Brand bar */}
      <div className="w-brand" style={{ marginBottom: 'auto' }}>
        <div className="w-brand-icon">
          <Zap size={11} fill="white" strokeWidth={0} />
        </div>
        <span className="w-brand-name">
          Rank<span>ly</span>
        </span>
        <span className="w-brand-badge" style={{
          background: 'rgba(239,68,68,.15)', color: 'var(--red)',
          border: '1px solid rgba(239,68,68,.25)'
        }}>LIMIT</span>
        <button className="w-theme-btn" onClick={onToggleTheme} title="Toggle theme" style={{ marginLeft: 'auto' }}>
          {theme === 'dark'
            ? <Sun  size={12} strokeWidth={2} />
            : <Moon size={12} strokeWidth={2} />}
        </button>
      </div>

      {/* Limit box */}
      <div className="limit-box" style={{ margin: 'auto 0', textAlign: 'center' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'rgba(251,191,36,.10)', border: '1px solid rgba(251,191,36,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          color: 'var(--amber)'
        }}>
          <Lock size={22} strokeWidth={1.8} />
        </div>

        <h1 className="w-headline" style={{ fontSize: '17px', marginBottom: '8px' }}>
          {title}
        </h1>

        <p className="w-sub" style={{ padding: '0 5px', marginBottom: '20px' }}>
          {subtitle}
        </p>

        <div style={{
          display: 'inline-block', padding: '4px 12px',
          background: 'rgba(255,255,255,.03)', border: '1px solid var(--b)',
          borderRadius: '15px', fontSize: '10px',
          fontFamily: "'DM Mono',monospace", color: 'var(--muted)'
        }}>
          Used {usedCount} of {usedCount} free scans
        </div>
      </div>

      {/* CTAs */}
      <div className="w-ctas" style={{ marginTop: 'auto', width: '100%' }}>
        <button className="cta-primary" onClick={() => openTab(`${APP_URL}/billing`)}>
          Upgrade to Pro - $14 / 8,400 XAF
          <ArrowRight size={11} strokeWidth={2.5} color="white" />
        </button>
        <button className="cta-secondary" onClick={() => openTab(`${APP_URL}/register`)}>
          Create Free Account
        </button>
        <button className="cta-secondary" onClick={onBack} style={{ marginTop: '4px' }}>
          Go Back
        </button>
      </div>

    </div>
  )
}
