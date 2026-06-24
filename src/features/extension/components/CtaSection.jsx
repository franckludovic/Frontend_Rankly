import { Zap, ArrowRight } from 'lucide-react'

export default function CtaSection() {
  return (
    <div className="cta-section">
      <div className="cta-headline" style={{ fontFamily: "'Syne',sans-serif" }}>
        Unlock your full SEO report
      </div>
      <div className="cta-sub">
        See your predicted Google position, full issue list, competitor benchmarks,
        and a step-by-step fix roadmap.
      </div>
      <div className="cta-buttons">
        <button className="cta-primary">
          <Zap size={13} fill="white" strokeWidth={0} />
          Get My Full Analysis
          <ArrowRight size={11} strokeWidth={2.5} color="white" />
        </button>
        <button className="cta-secondary">Sign in to existing account</button>
      </div>
      <div className="cta-footnote">Free plan available · No credit card required</div>
    </div>
  )
}
