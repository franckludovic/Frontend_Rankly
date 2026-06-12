import { useState } from "react";

const auditData = [
  { url: "your-store.io/sneakers", keyword: "running shoes 2024", score: "HIGH", ago: "2 mins ago", id: 1 },
  { url: "blog.saas-platform.com", keyword: "b2b crm software", score: "LOW", ago: "1 hour ago", id: 2 },
  { url: "fintech-guide.net/tools", keyword: "investment tracker", score: "HIGH", ago: "3 hours ago", id: 3 },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .dash-root {
    font-family: 'Outfit', sans-serif;
    background-color: #030712;
    background-image:
      linear-gradient(rgba(20,184,166,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(20,184,166,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    min-height: 100vh;
    color: white;
  }

  .dash-mono { font-family: 'DM Mono', monospace; }
  .dash-display { font-family: 'Syne', sans-serif; }

  /* Navbar */
  .navbar {
    position: sticky;
    top: 0;
    z-index: 50;
    height: 60px;
    padding: 0 28px;
    display: flex;
    align-items: center;
    gap: 32px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    background: rgba(3,7,18,0.88);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 9px;
    text-decoration: none;
  }

  .logo-icon {
    width: 30px;
    height: 30px;
    background: linear-gradient(135deg, #0d9488, #0891b2);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .logo-text {
    font-family: 'Syne', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: white;
    letter-spacing: -0.3px;
  }

  .logo-accent { color: #2dd4bf; }

  .nav-links {
    display: flex;
    gap: 2px;
  }

  .nav-btn {
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    padding: 6px 14px;
    border-radius: 7px;
    border: none;
    background: none;
    color: rgba(255,255,255,0.45);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .nav-btn:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.05); }

  .nav-btn.active {
    color: white;
    background: rgba(255,255,255,0.08);
    font-weight: 500;
  }

  .nav-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon-btn {
    position: relative;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 8px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255,255,255,0.65);
    transition: all 0.15s ease;
  }

  .icon-btn:hover {
    background: rgba(255,255,255,0.1);
    color: white;
  }

  .avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c3aed, #0891b2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    border: 1.5px solid rgba(255,255,255,0.1);
  }

  /* Pulse dot */
  .pulse-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #10b981;
    animation: pulse-ring 2s infinite;
    flex-shrink: 0;
  }

  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0   rgba(16,185,129,0.45); }
    70%  { box-shadow: 0 0 0 7px rgba(16,185,129,0); }
    100% { box-shadow: 0 0 0 0   rgba(16,185,129,0); }
  }

  /* Main */
  .main-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 52px 24px 72px;
  }

  /* Hero card */
  .hero-card {
    background: linear-gradient(160deg, rgba(13,22,45,0.97), rgba(6,12,26,0.99));
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px;
    padding: 44px 40px 36px;
    margin-bottom: 44px;
    text-align: center;
    box-shadow: 0 0 0 1px rgba(20,184,166,0.08), 0 24px 64px rgba(0,0,0,0.55);
    transition: box-shadow 0.3s ease;
    animation: fadeUp 0.5s ease forwards;
  }

  .hero-card:hover {
    box-shadow: 0 0 0 1px rgba(20,184,166,0.22), 0 28px 72px rgba(0,0,0,0.62);
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(20,184,166,0.08);
    border: 1px solid rgba(20,184,166,0.18);
    border-radius: 100px;
    padding: 4px 12px;
    margin-bottom: 22px;
  }

  .status-label {
    font-family: 'DM Mono', monospace;
    font-size: 10.5px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #2dd4bf;
  }

  .hero-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(26px, 3.5vw, 36px);
    font-weight: 800;
    color: white;
    letter-spacing: -0.5px;
    line-height: 1.15;
    margin-bottom: 10px;
  }

  .hero-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.4);
    max-width: 460px;
    margin: 0 auto 34px;
    line-height: 1.6;
  }

  /* Input grid */
  .input-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 16px;
  }

  .input-wrap { text-align: left; }

  .input-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
    display: block;
    margin-bottom: 7px;
  }

  .field-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 9px;
    padding: 12px 16px;
    font-family: 'DM Mono', monospace;
    font-size: 12.5px;
    color: white;
    outline: none;
    transition: all 0.2s ease;
  }

  .field-input::placeholder { color: rgba(255,255,255,0.2); }

  .field-input:focus {
    border-color: rgba(20,184,166,0.45);
    background: rgba(20,184,166,0.04);
    box-shadow: 0 0 0 3px rgba(20,184,166,0.07);
  }

  /* Generate button */
  .btn-generate {
    position: relative;
    overflow: hidden;
    width: 100%;
    padding: 14px 28px;
    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
    border: none;
    border-radius: 10px;
    color: white;
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-generate:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(13,148,136,0.35);
  }

  .btn-generate:active:not(:disabled) { transform: translateY(0); }

  .btn-generate::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent);
    transition: left 0.55s ease;
  }

  .btn-generate:hover::after { left: 160%; }

  .btn-generate:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .hint-text {
    font-family: 'DM Mono', monospace;
    font-size: 10.5px;
    color: rgba(255,255,255,0.18);
    margin-top: 14px;
    letter-spacing: 0.2px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { display: inline-block; animation: spin 1s linear infinite; }

  /* Section header */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    animation: fadeUp 0.5s 0.25s ease both;
  }

  .section-title-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .title-bar {
    width: 3px;
    height: 18px;
    background: #0d9488;
    border-radius: 2px;
  }

  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 17px;
    font-weight: 600;
    color: white;
  }

  .view-all-btn {
    background: none;
    border: none;
    color: #2dd4bf;
    font-family: 'DM Mono', monospace;
    font-size: 11.5px;
    cursor: pointer;
    letter-spacing: 0.3px;
    transition: opacity 0.15s;
  }

  .view-all-btn:hover { opacity: 0.7; }

  /* Audit cards grid */
  .audits-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .audit-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 13px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    animation: fadeUp 0.5s ease both;
  }

  .audit-card:hover {
    background: rgba(255,255,255,0.045);
    border-color: rgba(20,184,166,0.22);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }

  .audit-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .domain-icon {
    width: 30px;
    height: 30px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .badge {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.7px;
    padding: 3px 8px;
    border-radius: 5px;
  }

  .badge-high {
    background: rgba(16,185,129,0.12);
    color: #34d399;
    border: 1px solid rgba(16,185,129,0.22);
  }

  .badge-medium {
    background: rgba(245,158,11,0.12);
    color: #fbbf24;
    border: 1px solid rgba(245,158,11,0.22);
  }

  .badge-low {
    background: rgba(239,68,68,0.12);
    color: #f87171;
    border: 1px solid rgba(239,68,68,0.22);
  }

  .audit-url {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255,255,255,0.88);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
  }

  .audit-keyword {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: rgba(255,255,255,0.3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 14px;
  }

  .audit-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .audit-time {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: rgba(255,255,255,0.22);
  }

  .arrow-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255,255,255,0.45);
    transition: all 0.15s ease;
  }

  .arrow-btn:hover {
    background: rgba(20,184,166,0.12);
    border-color: rgba(20,184,166,0.3);
    color: #2dd4bf;
  }

  /* Notif dot */
  .notif-dot {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #10b981;
    border: 1.5px solid #030712;
  }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

function getBadgeClass(score) {
  if (score === "HIGH") return "badge badge-high";
  if (score === "MEDIUM") return "badge badge-medium";
  return "badge badge-low";
}

export default function AuditDashboard() {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");

  const handleGenerate = () => {
    if (!url || !keyword || loading) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 3200);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="dash-root">
        {/* ── Navbar ── */}
        <nav className="navbar">
          <div className="logo">
            <div className="logo-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" />
              </svg>
            </div>
            <span className="logo-text dash-display">
              SEO<span className="logo-accent">Insight</span>
            </span>
          </div>

          <div className="nav-links">
            {["Dashboard", "Audits", "Settings"].map((item) => (
              <button
                key={item}
                className={`nav-btn${activeNav === item ? " active" : ""}`}
                onClick={() => setActiveNav(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="nav-right">
            <div className="icon-btn" style={{ position: "relative" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="notif-dot" />
            </div>
            <div className="avatar">TN</div>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main className="main-content">
          {/* Hero Audit Card */}
          <div className="hero-card">
            <div className="status-pill">
              <span className="pulse-dot" />
              <span className="status-label">ML pipeline ready</span>
            </div>

            <h1 className="hero-title dash-display">Start Your AI SEO Audit</h1>
            <p className="hero-sub">
              Enter your webpage and target keyword. Our machine learning models
              will analyze the top 10 Google competitors.
            </p>

            <div className="input-grid">
              <div className="input-wrap">
                <label className="input-label">Target Webpage URL</label>
                <input
                  className="field-input"
                  type="url"
                  placeholder="https://your-site.com/page"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="input-wrap">
                <label className="input-label">Target Keyword</label>
                <input
                  className="field-input"
                  type="text"
                  placeholder="e.g. running shoes 2024"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>

            <button
              className="btn-generate"
              onClick={handleGenerate}
              disabled={loading || !url || !keyword}
            >
              {loading ? (
                <>
                  <span className="spin">⚙</span>
                  Analyzing competitors…
                </>
              ) : (
                <>
                  Generate AI Analysis
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" />
                  </svg>
                </>
              )}
            </button>

            <p className="hint-text">
              Avg. analysis time: 12–18s · Top 10 SERP competitors scraped in real-time
            </p>
          </div>

          {/* Recent Audits */}
          <div className="section-header">
            <div className="section-title-group">
              <div className="title-bar" />
              <h2 className="section-title dash-display">Recent Audits</h2>
            </div>
            <button className="view-all-btn">View All History →</button>
          </div>

          <div className="audits-grid">
            {auditData.map((audit, i) => (
              <div
                key={audit.id}
                className="audit-card"
                style={{ animationDelay: `${0.28 + i * 0.08}s` }}
              >
                <div className="audit-card-top">
                  <div className="domain-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.7">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <span className={getBadgeClass(audit.score)}>{audit.score}</span>
                </div>

                <p className="audit-url">{audit.url}</p>
                <p className="audit-keyword">⌕ {audit.keyword}</p>

                <div className="audit-footer">
                  <span className="audit-time">{audit.ago}</span>
                  <button className="arrow-btn">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
