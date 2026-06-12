const SCAN_STEPS = [
  'Reading page metadata…',
  'Checking keyword signals…',
  'Auditing technical health…',
  'Comparing against top 10 competitors…',
]

const LOCAL_SCAN_STEPS = [
  'Reading local DOM parameters…',
  'Preprocessing feature matrix…',
  'Running local inference engine…',
  'Generating on-page recommendations…',
]

export default function ScanningView({ stepIdx, auditMode = 'cloud' }) {
  const steps = auditMode === 'local' ? LOCAL_SCAN_STEPS : SCAN_STEPS
  
  return (
    <div className="scanning-wrap">
      {/* Animated spinner ring */}
      <div className="scan-ring">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="5"/>
          <circle cx="36" cy="36" r="28" fill="none"
            stroke="url(#scanGrad)" strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="176" strokeDashoffset="130"
          />
          <defs>
            <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#0d9488"/>
              <stop offset="100%" stopColor="#2dd4bf"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="scan-label">
        {auditMode === 'local' ? 'Running Browser ML Engine…' : 'Analysing page…'}
      </div>

      <div className="scan-steps">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`scan-step${i < stepIdx ? ' done' : i === stepIdx ? ' active' : ''}`}
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <div className={`scan-dot${i < stepIdx ? ' done' : i === stepIdx ? ' active' : ' wait'}`}/>
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}

export { SCAN_STEPS, LOCAL_SCAN_STEPS }
