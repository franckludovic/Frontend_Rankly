/**
 * LockedSection — blurs its children and overlays a lock prompt.
 */
function LockedSection({ label, sub, children, isUnavailable = false }) {
  return (
    <div className={`locked-section ${isUnavailable ? 'unavail-section' : ''}`}>
      <div className="locked-blur">{children}</div>
      <div className="locked-overlay">
        <div className="lock-icon">{isUnavailable ? '⚠️' : '🔒'}</div>
        <div className="lock-lbl">{label}</div>
        {sub && <div className="lock-sub">{sub}</div>}
      </div>
    </div>
  )
}

/**
 * IssuesList — top 2 visible issues + 3 locked premium sections.
 */
export default function IssuesList({ auditMode = 'cloud' }) {
  const isLocal = auditMode === 'local'

  return (
    <>
      {/* ── Visible top issues ── */}
      <div className="section">
        <div className="section-lbl">Top issues found</div>
        <div className="issue-list">
          <div className="issue-row crit">
            <div className="issue-dot crit"/>
            <div className="issue-text">
              Meta description is missing your keyword and is too short (78 chars)
            </div>
            <span className="issue-badge crit">Critical</span>
          </div>
          <div className="issue-row warn">
            <div className="issue-dot warn"/>
            <div className="issue-text">
              Page content is below the 2,000-word target for this keyword
            </div>
            <span className="issue-badge warn">High</span>
          </div>
        </div>
      </div>

      {/* ── LOCKED — Predicted Position ── */}
      <LockedSection label="Predicted Google Position" sub="Sign up to unlock">
        <div>
          <div className="section-lbl">AI-Predicted Google Position</div>
          <div className="fake-rank-row">
            <div className="fake-rank-big" style={{ fontFamily: "'Syne',sans-serif" }}>#??</div>
            <div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '9px', color: 'rgba(165,180,252,.4)', marginBottom: '4px' }}>
                out of 100 results
              </div>
              <div style={{ height: '4px', width: '120px', background: 'rgba(99,102,241,.2)', borderRadius: '2px' }}/>
            </div>
          </div>
        </div>
      </LockedSection>

      {/* ── LOCKED — More issues ── */}
      <LockedSection label="10 more issues found" sub="Including 1 more critical">
        <div>
          <div className="section-lbl">Full issue list</div>
          <div className="fake-more-issues">
            <div className="fake-issue"/>
            <div className="fake-issue"/>
            <div className="fake-issue"/>
          </div>
        </div>
      </LockedSection>

      {/* ── LOCKED — Competitor comparison ── */}
      <LockedSection 
        label={isLocal ? "Competitor Comparison (Unavailable)" : "Competitor Comparison"} 
        sub={isLocal ? "Requires a public domain to index competitor pages" : "See how top 10 pages beat you"}
        isUnavailable={isLocal}
      >
        <div>
          <div className="section-lbl">vs. Rank #1 competitor</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Word Count', 'Keyword Coverage', 'Schema'].map(m => (
              <div key={m} style={{
                flex: 1, height: '52px',
                background: 'rgba(255,255,255,.04)',
                borderRadius: '7px',
                border: '1px solid rgba(255,255,255,.06)'
              }}/>
            ))}
          </div>
        </div>
      </LockedSection>
    </>
  )
}
