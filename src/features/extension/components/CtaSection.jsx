import { useState } from 'react'
import { Zap, ArrowRight, ArrowLeft, Copy, Check } from 'lucide-react'

const APP_URL = 'https://rankly.app'

function openTab(url) {
  if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
    chrome.tabs.create({ url })
  } else {
    window.open(url, '_blank')
  }
}

export default function CtaSection({ auditMode, score = 0, url = '', keyword = '', onNewAudit }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const grade = score >= 70 ? 'High' : score >= 45 ? 'Medium' : 'Low'
    const lines = [
      `Rankly SEO Audit - ${url || 'this page'}`,
      `Score: ${score}/100 (${grade} SEO Grade)`,
      keyword ? `Keyword: "${keyword}"` : null,
      '',
      `Full report → ${APP_URL}`,
    ].filter(l => l !== null).join('\n')

    navigator.clipboard.writeText(lines).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="cta-section">

      {/* ── Back + Copy row ── */}
      <div className="cta-action-row">
        <button className="cta-back-btn" onClick={onNewAudit}>
          <ArrowLeft size={11} strokeWidth={2.5} />
          New Audit
        </button>
        <button className="cta-copy-btn" onClick={handleCopy}>
          {copied
            ? <><Check size={11} strokeWidth={2.5} />Copied!</>
            : <><Copy size={11} strokeWidth={2.5} />Copy Results</>}
        </button>
      </div>

      <div className="cta-headline" style={{ fontFamily: "'Syne',sans-serif" }}>
        Unlock your full SEO report
      </div>
      <div className="cta-sub">
        See your predicted Google position, full issue list, competitor benchmarks,
        and a step-by-step fix roadmap.
      </div>
      <div className="cta-buttons">
        <button className="cta-primary" onClick={() => openTab(`${APP_URL}/register`)}>
          <Zap size={13} fill="white" strokeWidth={0} />
          Get My Full Analysis
          <ArrowRight size={11} strokeWidth={2.5} color="white" />
        </button>
        <button className="cta-secondary" onClick={() => openTab(`${APP_URL}/login`)}>
          Sign in to existing account
        </button>
      </div>
      <div className="cta-footnote">Free plan available · No credit card required</div>
    </div>
  )
}
