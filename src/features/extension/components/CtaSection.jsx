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
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
            <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
          </svg>
          Get My Full Analysis
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        <button className="cta-secondary">Sign in to existing account</button>
      </div>
      <div className="cta-footnote">Free plan available · No credit card required</div>
    </div>
  )
}
