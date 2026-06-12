import { useState, useEffect } from "react";

/* ─────────────────────── STYLES ─────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root{
  --bg:#030c1a; --bg2:#071120; --bg3:#0a1628;
  --b:rgba(255,255,255,.07); --b2:rgba(255,255,255,.13);
  --text:rgba(255,255,255,.9); --muted:rgba(255,255,255,.4); --faint:rgba(255,255,255,.16);
  --teal:#2dd4bf; --td:rgba(20,184,166,.12); --tb:rgba(20,184,166,.25);
  --red:#f87171; --rd:rgba(239,68,68,.08); --rb:rgba(239,68,68,.2);
  --amber:#fbbf24; --ad:rgba(245,158,11,.1); --ab:rgba(245,158,11,.2);
  --green:#34d399; --gd:rgba(52,211,153,.08); --gb:rgba(52,211,153,.2);
  --indigo:#818cf8;
}

/* ── Scene wrapper — simulates a browser window ── */
.scene{
  min-height:100vh;
  background:
    linear-gradient(135deg,#0d1117 0%,#161b22 50%,#0d1117 100%);
  display:flex;flex-direction:column;align-items:center;
  justify-content:center;padding:32px 16px;
  font-family:'Outfit',sans-serif;
}

.browser-chrome{
  width:420px;
  background:#1c1f26;
  border-radius:12px 12px 0 0;
  padding:10px 14px;
  display:flex;align-items:center;gap:8px;
  border:1px solid rgba(255,255,255,.08);
  border-bottom:none;
}

.bc-dots{display:flex;gap:5px;}
.bc-dot{width:10px;height:10px;border-radius:50%;}

.bc-bar{
  flex:1;background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.08);
  border-radius:5px;padding:4px 10px;
  font-family:'DM Mono',monospace;font-size:10px;
  color:rgba(255,255,255,.35);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}

.bc-ext-btn{
  width:24px;height:24px;border-radius:5px;
  background:linear-gradient(135deg,#0d9488,#0891b2);
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
}

/* ── Extension popup ── */
.popup{
  width:420px;
  background:var(--bg);
  border:1px solid var(--b2);
  border-radius:0 0 14px 14px;
  overflow:hidden;
  box-shadow:0 24px 80px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.04);
}

/* ── Popup header ── */
.popup-hdr{
  display:flex;align-items:center;justify-content:space-between;
  padding:13px 16px 11px;
  border-bottom:1px solid var(--b);
  background:rgba(255,255,255,.02);
}

.ph-logo{display:flex;align-items:center;gap:7px;}
.ph-logo-icon{width:22px;height:22px;background:linear-gradient(135deg,#0d9488,#0891b2);border-radius:6px;display:flex;align-items:center;justify-content:center;}
.ph-logo-name{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;letter-spacing:-.2px;}
.ph-logo-name span{color:var(--teal);}

.ph-url{display:flex;align-items:center;gap:5px;background:rgba(255,255,255,.04);border:1px solid var(--b);border-radius:5px;padding:3px 8px;max-width:200px;}
.ph-url-txt{font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,.45);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.https-dot{width:5px;height:5px;border-radius:50%;background:#34d399;flex-shrink:0;}

/* ── Scanning state ── */
.scanning-wrap{padding:36px 20px;text-align:center;}
.scan-ring{width:72px;height:72px;margin:0 auto 16px;position:relative;}
.scan-ring svg{animation:spin 1.5s linear infinite;}
@keyframes spin{to{transform:rotate(360deg);}}
.scan-label{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);letter-spacing:.5px;}
.scan-steps{display:flex;flex-direction:column;gap:6px;margin-top:16px;}
.scan-step{
  display:flex;align-items:center;gap:8px;
  font-family:'DM Mono',monospace;font-size:10px;
  color:rgba(255,255,255,.25);padding:6px 12px;
  background:rgba(255,255,255,.02);border-radius:6px;
  animation:scanIn .4s ease both;
}
@keyframes scanIn{from{opacity:0;transform:translateX(-8px);}to{opacity:1;transform:translateX(0);}}
.scan-step.done{color:rgba(52,211,153,.7);}
.scan-step.active{color:rgba(45,212,191,.85);}
.scan-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
.scan-dot.done{background:#34d399;}
.scan-dot.active{background:#2dd4bf;animation:pulse 1s infinite;}
.scan-dot.wait{background:rgba(255,255,255,.15);}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.3;}}

/* ── Results ── */
.results{animation:fadeUp .4s ease both;}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}

/* Score row */
.score-row{
  display:flex;align-items:center;gap:16px;
  padding:16px 16px 14px;
  border-bottom:1px solid var(--b);
  background:linear-gradient(135deg,rgba(20,184,166,.05),rgba(5,15,34,.8));
}

.score-ring-wrap{position:relative;flex-shrink:0;}
.score-ring-wrap svg{display:block;}
.score-center{
  position:absolute;inset:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
}
.score-n{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;line-height:1;}
.score-denom{font-family:'DM Mono',monospace;font-size:8px;color:var(--faint);}

.score-info{}
.score-grade-row{display:flex;align-items:center;gap:7px;margin-bottom:5px;}
.score-grade{
  font-family:'Syne',sans-serif;font-size:14px;font-weight:700;
  padding:2px 9px;border-radius:6px;
}
.grade-c{background:rgba(245,158,11,.15);color:#fbbf24;border:1px solid rgba(245,158,11,.25);}
.score-headline{font-family:'Outfit',sans-serif;font-size:12.5px;font-weight:500;color:rgba(255,255,255,.75);margin-bottom:3px;line-height:1.35;}
.score-sub{font-family:'DM Mono',monospace;font-size:9px;color:var(--faint);}

/* Quick checks */
.section{padding:12px 16px;border-bottom:1px solid var(--b);}
.section-lbl{font-family:'DM Mono',monospace;font-size:8.5px;text-transform:uppercase;letter-spacing:.8px;color:var(--faint);margin-bottom:9px;}

.checks{display:flex;flex-direction:column;gap:5px;}
.check-row{display:flex;align-items:center;justify-content:space-between;padding:6px 9px;background:rgba(255,255,255,.025);border-radius:7px;border:1px solid var(--b);}
.check-left{display:flex;align-items:center;gap:7px;}
.check-icon{font-size:11px;flex-shrink:0;}
.check-name{font-family:'Outfit',sans-serif;font-size:12px;color:rgba(255,255,255,.7);}
.check-val{font-family:'DM Mono',monospace;font-size:10px;font-weight:500;}
.check-val.pass{color:var(--green);}
.check-val.fail{color:var(--red);}
.check-val.warn{color:var(--amber);}

/* Stats row */
.stats-mini{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;}
.stat-mini{background:rgba(255,255,255,.025);border:1px solid var(--b);border-radius:8px;padding:9px 10px;text-align:center;}
.sm-val{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;line-height:1;color:white;}
.sm-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);margin-top:3px;}

/* Top issues — free teaser */
.issue-list{display:flex;flex-direction:column;gap:5px;}
.issue-row{
  display:flex;align-items:flex-start;gap:8px;
  padding:8px 10px;border-radius:8px;border:1px solid;
}
.issue-row.crit{background:var(--rd);border-color:var(--rb);}
.issue-row.warn{background:var(--ad);border-color:var(--ab);}
.issue-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:4px;}
.issue-dot.crit{background:var(--red);}
.issue-dot.warn{background:var(--amber);}
.issue-text{font-family:'Outfit',sans-serif;font-size:11.5px;color:rgba(255,255,255,.78);line-height:1.4;}
.issue-badge{font-family:'DM Mono',monospace;font-size:8px;padding:1px 6px;border-radius:3px;margin-left:auto;flex-shrink:0;align-self:flex-start;margin-top:1px;}
.issue-badge.crit{background:rgba(239,68,68,.2);color:var(--red);}
.issue-badge.warn{background:rgba(245,158,11,.2);color:var(--amber);}

/* Locked section */
.locked-section{
  position:relative;padding:12px 16px;border-bottom:1px solid var(--b);
  overflow:hidden;
}
.locked-blur{filter:blur(5px);pointer-events:none;user-select:none;opacity:.4;}
.locked-overlay{
  position:absolute;inset:0;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:6px;background:rgba(3,12,26,.55);backdrop-filter:blur(2px);
  z-index:2;
}
.lock-icon{
  width:34px;height:34px;border-radius:50%;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);
  display:flex;align-items:center;justify-content:center;
  font-size:14px;
}
.lock-lbl{font-family:'DM Mono',monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:.7px;color:rgba(255,255,255,.5);}
.lock-sub{font-family:'Outfit',monospace;font-size:10.5px;color:rgba(255,255,255,.28);}

/* Fake blurred content for locked sections */
.fake-rank-row{display:flex;align-items:center;gap:14px;margin-bottom:6px;}
.fake-rank-big{font-family:'Syne',sans-serif;font-size:42px;font-weight:800;color:var(--indigo);}
.fake-more-issues{display:flex;flex-direction:column;gap:5px;}
.fake-issue{height:34px;background:rgba(255,255,255,.06);border-radius:7px;border:1px solid var(--b);}

/* ── CTA ── */
.cta-section{padding:14px 16px;background:linear-gradient(135deg,rgba(13,148,136,.08),rgba(6,12,26,.95));}
.cta-headline{font-family:'Syne',sans-serif;font-size:13.5px;font-weight:700;color:white;margin-bottom:3px;}
.cta-sub{font-family:'Outfit',sans-serif;font-size:11.5px;color:var(--muted);margin-bottom:12px;line-height:1.45;}
.cta-buttons{display:flex;flex-direction:column;gap:7px;}
.cta-primary{
  width:100%;padding:11px;border-radius:9px;border:none;
  background:linear-gradient(135deg,#0d9488,#0f766e);
  color:white;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;
  cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;
  position:relative;overflow:hidden;
}
.cta-primary:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(13,148,136,.35);}
.cta-primary::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);transform:translateX(-100%);transition:transform .6s;}
.cta-primary:hover::after{transform:translateX(100%);}
.cta-secondary{
  width:100%;padding:9px;border-radius:9px;
  border:1px solid var(--b2);background:rgba(255,255,255,.03);
  color:rgba(255,255,255,.65);font-family:'Outfit',sans-serif;font-size:12px;
  cursor:pointer;transition:all .15s;
}
.cta-secondary:hover{background:rgba(255,255,255,.06);color:white;}
.cta-footnote{font-family:'DM Mono',monospace;font-size:8.5px;color:var(--faint);text-align:center;margin-top:8px;}

/* ── Scene label ── */
.scene-label{font-family:'DM Mono',monospace;font-size:10px;color:rgba(255,255,255,.2);text-align:center;margin-top:12px;letter-spacing:.5px;}
`;

/* ── Scan steps ── */
const SCAN_STEPS = [
  "Reading page metadata…",
  "Checking keyword signals…",
  "Auditing technical health…",
  "Comparing against top 10 competitors…",
];

/* ── Score ring SVG ── */
function ScoreRing({ score }) {
  const r = 38, cx = 44, cy = 44;
  const circ = 2 * Math.PI * r;
  const fill = circ * (score / 100);
  const color = score >= 70 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171";
  return (
    <div className="score-ring-wrap" style={{ width: 88, height: 88 }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="7"/>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - fill}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{filter:`drop-shadow(0 0 6px ${color}88)`}}
        />
      </svg>
      <div className="score-center">
        <div className="score-n" style={{ color, fontFamily:"'Syne',sans-serif" }}>{score}</div>
        <div className="score-denom">/100</div>
      </div>
    </div>
  );
}

/* ── Locked overlay ── */
function LockedSection({ label, sub, children }) {
  return (
    <div className="locked-section">
      <div className="locked-blur">{children}</div>
      <div className="locked-overlay">
        <div className="lock-icon">🔒</div>
        <div className="lock-lbl">{label}</div>
        {sub && <div className="lock-sub">{sub}</div>}
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function ExtensionPopup() {
  const [phase, setPhase]         = useState("scanning"); // scanning | results
  const [stepIdx, setStepIdx]     = useState(0);

  /* Simulate scanning: advance steps, then reveal results */
  useEffect(() => {
    if (phase !== "scanning") return;
    if (stepIdx < SCAN_STEPS.length - 1) {
      const t = setTimeout(() => setStepIdx(i => i + 1), 600);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setPhase("results"), 800);
      return () => clearTimeout(t);
    }
  }, [stepIdx, phase]);

  const checks = [
    { name: "HTTPS Secure",            pass: true,  val: "Active",            cls: "pass" },
    { name: "Page Title",              pass: false, val: "Keyword missing",    cls: "fail" },
    { name: "Meta Description",        pass: false, val: "Too short + no KW",  cls: "fail" },
    { name: "Canonical Tag",           pass: true,  val: "Set",               cls: "pass" },
    { name: "Mobile Viewport",         pass: true,  val: "Configured",        cls: "pass" },
    { name: "Structured Data",         pass: false, val: "Not found",         cls: "warn" },
  ];

  const icon = (c) => c === "pass" ? "✓" : c === "fail" ? "✗" : "⚠";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="scene">
        {/* Browser chrome */}
        <div className="browser-chrome">
          <div className="bc-dots">
            <div className="bc-dot" style={{ background: "#ff5f57" }}/>
            <div className="bc-dot" style={{ background: "#ffbd2e" }}/>
            <div className="bc-dot" style={{ background: "#28ca41" }}/>
          </div>
          <div className="bc-bar">example.com/laptops — Buy Laptops Today | Best Deals</div>
          <div className="bc-ext-btn">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
              <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
            </svg>
          </div>
        </div>

        {/* Popup */}
        <div className="popup">

          {/* Popup header */}
          <div className="popup-hdr">
            <div className="ph-logo">
              <div className="ph-logo-icon">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                  <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
                </svg>
              </div>
              <div className="ph-logo-name" style={{ fontFamily:"'Syne',sans-serif" }}>
                SEO<span>Insight</span>
              </div>
            </div>
            <div className="ph-url">
              <div className="https-dot"/>
              <div className="ph-url-txt">example.com/laptops</div>
            </div>
          </div>

          {/* ── SCANNING ── */}
          {phase === "scanning" && (
            <div className="scanning-wrap">
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
                      <stop offset="0%" stopColor="#0d9488"/>
                      <stop offset="100%" stopColor="#2dd4bf"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="scan-label">Analysing page…</div>
              <div className="scan-steps">
                {SCAN_STEPS.map((s, i) => (
                  <div key={i} className={`scan-step${i < stepIdx ? " done" : i === stepIdx ? " active" : ""}`}
                       style={{ animationDelay: `${i * 0.15}s` }}>
                    <div className={`scan-dot${i < stepIdx ? " done" : i === stepIdx ? " active" : " wait"}`}/>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── RESULTS ── */}
          {phase === "results" && (
            <div className="results">

              {/* Score row */}
              <div className="score-row">
                <ScoreRing score={68} />
                <div className="score-info">
                  <div className="score-grade-row">
                    <span className="score-grade grade-c" style={{ fontFamily:"'Syne',sans-serif" }}>C+</span>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"9px", color:"rgba(255,255,255,.3)" }}>SEO Grade</span>
                  </div>
                  <div className="score-headline">Needs work — 3 critical<br/>issues are hurting your rank</div>
                  <div className="score-sub">Keyword: 'buy cheap laptops'</div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="section">
                <div className="section-lbl">Page at a glance</div>
                <div className="stats-mini">
                  <div className="stat-mini">
                    <div className="sm-val" style={{ fontFamily:"'Syne',sans-serif", color:"#f87171" }}>1,250</div>
                    <div className="sm-lbl">Words</div>
                  </div>
                  <div className="stat-mini">
                    <div className="sm-val" style={{ fontFamily:"'Syne',sans-serif", color:"#fbbf24" }}>1.2%</div>
                    <div className="sm-lbl">KW Density</div>
                  </div>
                  <div className="stat-mini">
                    <div className="sm-val" style={{ fontFamily:"'Syne',sans-serif", color:"#34d399" }}>3/4</div>
                    <div className="sm-lbl">Tech Score</div>
                  </div>
                </div>
              </div>

              {/* Quick checks */}
              <div className="section">
                <div className="section-lbl">Quick checks</div>
                <div className="checks">
                  {checks.map((c, i) => (
                    <div key={i} className="check-row">
                      <div className="check-left">
                        <span className="check-icon" style={{
                          color: c.cls==="pass"?"#34d399":c.cls==="fail"?"#f87171":"#fbbf24"
                        }}>{icon(c.cls)}</span>
                        <span className="check-name">{c.name}</span>
                      </div>
                      <span className={`check-val ${c.cls}`}>{c.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 2 issues — free */}
              <div className="section">
                <div className="section-lbl">Top issues found</div>
                <div className="issue-list">
                  <div className="issue-row crit">
                    <div className="issue-dot crit"/>
                    <div className="issue-text">Meta description is missing your keyword and is too short (78 chars)</div>
                    <span className="issue-badge crit">Critical</span>
                  </div>
                  <div className="issue-row warn">
                    <div className="issue-dot warn"/>
                    <div className="issue-text">Page content is below the 2,000-word target for this keyword</div>
                    <span className="issue-badge warn">High</span>
                  </div>
                </div>
              </div>

              {/* LOCKED — Predicted Position */}
              <LockedSection label="Predicted Google Position" sub="Sign up to unlock">
                <div>
                  <div className="section-lbl">AI-Predicted Google Position</div>
                  <div className="fake-rank-row">
                    <div className="fake-rank-big" style={{ fontFamily:"'Syne',sans-serif" }}>#??</div>
                    <div>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"9px", color:"rgba(165,180,252,.4)", marginBottom:"4px" }}>out of 100 results</div>
                      <div style={{ height:"4px", width:"120px", background:"rgba(99,102,241,.2)", borderRadius:"2px" }}/>
                    </div>
                  </div>
                </div>
              </LockedSection>

              {/* LOCKED — More issues */}
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

              {/* LOCKED — Competitor comparison */}
              <LockedSection label="Competitor Comparison" sub="See how top 10 pages beat you">
                <div>
                  <div className="section-lbl">vs. Rank #1 competitor</div>
                  <div style={{ display:"flex", gap:"8px" }}>
                    {["Word Count","Keyword Coverage","Schema"].map(m=>(
                      <div key={m} style={{ flex:1, height:"52px", background:"rgba(255,255,255,.04)", borderRadius:"7px", border:"1px solid rgba(255,255,255,.06)" }}/>
                    ))}
                  </div>
                </div>
              </LockedSection>

              {/* CTA */}
              <div className="cta-section">
                <div className="cta-headline" style={{ fontFamily:"'Syne',sans-serif" }}>
                  Unlock your full SEO report
                </div>
                <div className="cta-sub">
                  See your predicted Google position, full issue list, competitor benchmarks, and a step-by-step fix roadmap.
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

            </div>
          )}
        </div>

        <div className="scene-label">Browser Extension Popup — 420 × auto</div>
      </div>
    </>
  );
}
