import { Zap, Lock, ArrowRight } from 'lucide-react'

export default function LimitScreen({ limitType = 'local', onBack }) {
  const isLocal = limitType === 'local'
  const title = isLocal ? 'Offline Scan Limit Reached' : 'Full Scan Limit Reached'
  const subtitle = isLocal 
    ? 'You have used all 5 free local offline audits. Upgrade to continue performing local ML audits on your projects.'
    : 'You have used all 3 free full online audits. Sign up to get unlimited audits, competitor indexing, and deep-dive roadmaps.'
  const usedCount = isLocal ? 5 : 3

  const handleUpgrade = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: 'https://rankly-seo.com/upgrade' })
    } else {
      window.open('https://rankly-seo.com/upgrade', '_blank')
    }
  }

  return (
    <div className="limit-screen welcome-wrap" style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center' }}>
      {/* Brand logo bar */}
      <div className="w-brand" style={{ marginBottom: 'auto' }}>
        <div className="w-brand-icon">
          <Zap size={11} fill="white" strokeWidth={0} />
        </div>
        <span className="w-brand-name" style={{ fontFamily: "'Outfit',sans-serif" }}>
          Rank<span>ly</span>
        </span>
        <span className="w-brand-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>LIMIT</span>
      </div>

      <div className="limit-box" style={{ margin: 'auto 0', textAlign: 'center' }}>
        <div className="limit-icon-wrap" style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'rgba(251, 191, 36, 0.10)', border: '1px solid rgba(251, 191, 36, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
        }}>
          <Lock size={24} strokeWidth={1.8} />
        </div>
        
        <h1 className="w-headline" style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700 }}>
          {title}
        </h1>
        
        <p className="w-sub" style={{ padding: '0 5px', marginBottom: '24px' }}>
          {subtitle}
        </p>

        <div className="limit-stats-chip" style={{
          display: 'inline-block', padding: '5px 12px',
          background: 'rgba(255,255,255,.03)', border: '1px solid var(--b)',
          borderRadius: '15px', fontSize: '10.5px', fontFamily: "'DM Mono', monospace", color: 'var(--muted)'
        }}>
          Used {usedCount} of {usedCount} free scans
        </div>
      </div>

      {/* CTAs */}
      <div className="w-ctas" style={{ marginTop: 'auto', width: '100%' }}>
        <button className="cta-primary" onClick={handleUpgrade}>
          Upgrade to Premium
          <ArrowRight size={11} strokeWidth={2.5} color="white" />
        </button>
        <button className="cta-secondary" onClick={onBack}>
          Go Back
        </button>
      </div>
    </div>
  )
}
