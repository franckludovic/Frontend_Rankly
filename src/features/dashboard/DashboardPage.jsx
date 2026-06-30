import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateAudit } from './services/dashboardService.js'
import { getHistory, deleteAudit } from '../history/services/historyService.js'
import { useAuth } from '../../store/authSlice.js'
import CannibalizationWidget from './components/CannibalizationWidget.jsx'
import LinkingWidget from './components/LinkingWidget.jsx'
import MonitorWidget from './components/MonitorWidget.jsx'
import { X, Globe, ArrowRight, Settings, Zap } from 'lucide-react'
import FeatureGate from '../../shared/components/FeatureGate.jsx'
import UpgradeModal from '../../shared/components/UpgradeModal.jsx'
import { notify } from '../../store/notificationSlice.js'

/* ─── inline styles ─── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;}

.dp{padding:36px 32px 64px;max-width:1400px;margin:0 auto;font-family:'Outfit',sans-serif;color:var(--text);}

/* hero */
.dp-hero{background:var(--hero-bg,linear-gradient(160deg,rgba(13,22,45,.97),rgba(6,12,26,.99)));border:1px solid var(--hero-border,var(--border));border-radius:18px;padding:42px 40px 36px;margin-bottom:44px;text-align:center;box-shadow:var(--hero-shadow,0 24px 64px rgba(0,0,0,.5));animation:fadeUp .5s ease both;transition:background-color var(--ease-slow),border-color var(--ease-slow),box-shadow var(--ease-slow);}
.dp-hero:hover{box-shadow:var(--hero-shadow);border-color:var(--teal-b);}
.dp-status-pill{display:inline-flex;align-items:center;gap:7px;background:var(--teal-d,rgba(20,184,166,.08));border:1px solid var(--teal-b,rgba(20,184,166,.18));border-radius:100px;padding:4px 12px;margin-bottom:22px;}
.dp-pdot{width:7px;height:7px;border-radius:50%;background:var(--green,#10b981);animation:pdot 2s infinite;flex-shrink:0;}
@keyframes pdot{0%{box-shadow:0 0 0 0 rgba(16,185,129,.45);}70%{box-shadow:0 0 0 7px transparent;}100%{box-shadow:0 0 0 0 transparent;}}
.dp-status-lbl{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:1px;text-transform:uppercase;color:var(--teal,#2dd4bf);}
.dp-h1{font-family:'Syne',sans-serif;font-size:clamp(24px,3.2vw,34px);font-weight:800;color:var(--text);letter-spacing:-.5px;line-height:1.15;margin-bottom:10px;}
.dp-sub{font-size:14px;color:var(--muted);max-width:460px;margin:0 auto 34px;line-height:1.6;}

/* form */
.dp-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px;}
.dp-field label{display:block;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.9px;text-transform:uppercase;color:var(--muted,rgba(255,255,255,.28));margin-bottom:7px;}
.dp-input{width:100%;background:var(--bg-input,rgba(255,255,255,.04));border:1px solid var(--border,rgba(255,255,255,.09));border-radius:9px;padding:12px 16px;font-family:'DM Mono',monospace;font-size:12.5px;color:var(--text,white);outline:none;transition:all .2s;}
.dp-input::placeholder{color:var(--faint,rgba(255,255,255,.2));}
.dp-input:focus{border-color:var(--teal-b,rgba(20,184,166,.45));background:var(--teal-d,rgba(20,184,166,.04));box-shadow:0 0 0 3px var(--teal-d,rgba(20,184,166,.07));}
.dp-btn{position:relative;overflow:hidden;width:100%;padding:14px 28px;background:linear-gradient(135deg,var(--cta-start,#0d9488),var(--cta-end,#0f766e));border:none;border-radius:10px;color:white;font-family:'Outfit',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 20px var(--cta-shadow,rgba(13,148,136,.28));}
.dp-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 28px var(--cta-shadow,rgba(13,148,136,.38));}
.dp-btn:disabled{opacity:.5;cursor:not-allowed;}
.dp-btn::after{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.14),transparent);transition:left .55s;}
.dp-btn:hover::after{left:160%;}
.dp-hint{font-family:'DM Mono',monospace;font-size:10.5px;color:var(--faint,rgba(255,255,255,.18));margin-top:14px;letter-spacing:.2px;}
.dp-error{background:var(--red-d,rgba(239,68,68,.1));border:1px solid var(--red-b,rgba(239,68,68,.22));border-radius:8px;padding:10px 14px;font-family:'DM Mono',monospace;font-size:11px;color:var(--red,#f87171);margin-bottom:14px;}

@keyframes spin{to{transform:rotate(360deg);}}
.spin{display:inline-block;animation:spin 1s linear infinite;}

/* recent */
.dp-section-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;animation:fadeUp .5s .25s ease both;}
.dp-sh-left{display:flex;align-items:center;gap:10px;}
.dp-sh-bar{width:3px;height:18px;background:var(--teal,#2dd4bf);border-radius:2px;}
.dp-sh-title{font-family:'Syne',sans-serif;font-size:17px;font-weight:600;color:var(--text);}
.dp-view-all{background:none;border:none;color:var(--teal,#2dd4bf);font-family:'DM Mono',monospace;font-size:11.5px;cursor:pointer;letter-spacing:.3px;transition:opacity .15s;}
.dp-view-all:hover{opacity:.7;}

.dp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
.dp-card{background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border,rgba(255,255,255,.07));border-radius:13px;padding:16px;cursor:pointer;transition:all .2s;animation:fadeUp .5s ease both;position:relative;}
.dp-card:hover{background:var(--bg-hover);border-color:var(--teal-b,rgba(20,184,166,.22));transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.3);}
.dp-card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;}
.dp-domain-icon{width:30px;height:30px;background:var(--bg-input,rgba(255,255,255,.05));border:1px solid var(--border,rgba(255,255,255,.07));border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.dp-badge{font-family:'DM Mono',monospace;font-size:10px;font-weight:600;letter-spacing:.7px;padding:3px 8px;border-radius:5px;}
.dp-badge.high{background:var(--green-d);color:var(--green);border:1px solid var(--green-b);}
.dp-badge.medium{background:var(--amber-d);color:var(--amber);border:1px solid var(--amber-b);}
.dp-badge.low{background:var(--red-d);color:var(--red);border:1px solid var(--red-b);}
.dp-url{font-family:'DM Mono',monospace;font-size:12px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px;}
.dp-kw{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted,rgba(255,255,255,.3));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:14px;}
.dp-card-foot{display:flex;align-items:center;justify-content:space-between;}
.dp-time{font-family:'DM Mono',monospace;font-size:10px;color:var(--faint,rgba(255,255,255,.22));}
.dp-arr{background:var(--bg3,rgba(255,255,255,.05));border:1px solid var(--border,rgba(255,255,255,.08));border-radius:6px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted,rgba(255,255,255,.45));transition:all .15s;}
.dp-arr:hover{background:var(--teal-d,rgba(20,184,166,.12));border-color:var(--teal-b,rgba(20,184,166,.3));color:var(--teal,#2dd4bf);}
.dp-del{position:absolute;top:8px;right:8px;width:22px;height:22px;background:var(--red-d,rgba(239,68,68,.08));border:1px solid var(--red-b,rgba(239,68,68,.18));border-radius:5px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:all .15s;}
.dp-card:hover .dp-del{opacity:1;}
.dp-del:hover{background:var(--red-d);border-color:var(--red-b);filter:brightness(1.15);}

.dp-empty{text-align:center;padding:52px 24px;border:1px dashed var(--border,rgba(255,255,255,.07));border-radius:13px;animation:fadeUp .5s .3s ease both;}
.dp-empty-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:var(--text);margin-bottom:8px;}
.dp-empty-sub{font-family:'Outfit',sans-serif;font-size:13px;color:var(--muted);max-width:320px;margin:0 auto;}

@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}

@media(max-width:720px){.dp-form-grid{grid-template-columns:1fr;}.dp-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:480px){.dp{padding:24px 16px 48px;}.dp-hero{padding:28px 20px 24px;}.dp-grid{grid-template-columns:1fr;}}
`

function timeAgo(isoStr) {
  const secs = Math.floor((Date.now() - new Date(isoStr)) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

export default function DashboardPage() {
  const navigate       = useNavigate()
  const { user }       = useAuth()
  const [url, setUrl]  = useState('')
  const [kw,  setKw]   = useState('')
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')
  const [showUpgrade,   setShowUpgrade]   = useState(false)
  const [upgradeLimit,  setUpgradeLimit]  = useState(3)
  const [history, setHistory] = useState([])
  const [histLoading, setHistLoading] = useState(true)

  useEffect(() => {
    getHistory()
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setHistLoading(false))
  }, [])

  const handleGenerate = async () => {
    if (!url.trim() || !kw.trim() || loading) return
    setError('')
    setLoading(true)
    try {
      const audit = await generateAudit({ url: url.trim(), keyword: kw.trim() })
      notify.success(
        'Audit complete',
        `SEO score ${audit.seoScore}/100 for "${audit.keyword}". A copy was emailed to you.`,
      )
      navigate(`/audit/${audit.id}`)
    } catch (e) {
      if (e.isQuotaError) {
        setUpgradeLimit(e.limit || 3)
        setShowUpgrade(true)
      } else {
        setError(e.message || 'Failed to generate audit. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    await deleteAudit(id)
    setHistory(prev => prev.filter(a => a.id !== id))
  }

  const qualityBadge = (q) => {
    const map = { HIGH: 'high', MEDIUM: 'medium', LOW: 'low' }
    return map[q] || 'low'
  }

  const greet = user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back'

  return (
    <>
      {showUpgrade && (
        <UpgradeModal limit={upgradeLimit} onClose={() => setShowUpgrade(false)} />
      )}
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="dp">
        {/* ── Hero ── */}
        <div className="dp-hero">
          <h1 className="dp-h1">{greet}<br />Start Your AI SEO Audit</h1>
          <p className="dp-sub">
            Enter your webpage URL and target keyword. Our machine learning engine
            will analyse the top 10 SERP competitors and generate your personalised report.
          </p>

          <div className="dp-form-grid">
            <div className="dp-field">
              <label>Target Webpage URL</label>
              <input
                className="dp-input"
                id="dash-url"
                type="url"
                placeholder="https://your-site.com/page"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              />
            </div>
            <div className="dp-field">
              <label>Target Keyword</label>
              <input
                className="dp-input"
                id="dash-keyword"
                type="text"
                placeholder="e.g. buy cheap laptops"
                value={kw}
                onChange={e => setKw(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              />
            </div>
          </div>

          {error && <div className="dp-error">{error}</div>}

          <button
            id="dash-generate"
            className="dp-btn"
            onClick={handleGenerate}
            disabled={loading || !url.trim() || !kw.trim()}
          >
            {loading
              ? <><Settings size={15} className="spin" /> Analysing competitors…</>
              : <>Generate AI Analysis <Zap size={15} fill="currentColor" strokeWidth={0} /></>
            }
          </button>
          <p className="dp-hint">
            Avg. analysis time: 2–3s · Top 10 SERP competitors benchmarked · Try: "buy cheap laptops"
          </p>
        </div>

        {/* ── Keyword Cannibalization ── */}
        <div style={{ marginBottom: '20px', animation: 'fadeUp .5s .15s ease both' }}>
          <FeatureGate feature="cannibalization" mode="widget" label="Keyword Cannibalization">
            <CannibalizationWidget />
          </FeatureGate>
        </div>

        {/* ── Internal Linking Opportunities ── */}
        <div style={{ marginBottom: '20px', animation: 'fadeUp .5s .2s ease both' }}>
          <FeatureGate feature="linking" mode="widget" label="Internal Link AI">
            <LinkingWidget audits={history} />
          </FeatureGate>
        </div>

        {/* ── Competitor Monitor ── */}
        <MonitorWidget />

        {/* ── Recent Audits ── */}
        <div className="dp-section-hdr">
          <div className="dp-sh-left">
            <div className="dp-sh-bar" />
            <h2 className="dp-sh-title">Recent Audits</h2>
          </div>
          <button className="dp-view-all" style={{display:'inline-flex',alignItems:'center',gap:5}} onClick={() => navigate('/history')}>
            View All History <ArrowRight size={12} strokeWidth={2} />
          </button>
        </div>

        {histLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontFamily: "'DM Mono',monospace", fontSize: '12px' }}>
            Loading history…
          </div>
        ) : history.length === 0 ? (
          <div className="dp-empty">
            <div className="dp-empty-title">No audits yet</div>
            <div className="dp-empty-sub">Run your first audit above and your results will appear here.</div>
          </div>
        ) : (
          <div className="dp-grid">
            {history.slice(0, 6).map((audit, i) => (
              <div
                key={audit.id}
                className="dp-card"
                style={{ animationDelay: `${0.28 + i * 0.06}s` }}
                onClick={() => navigate(`/audit/${audit.id}`)}
              >
                <button className="dp-del" onClick={e => handleDelete(e, audit.id)} title="Delete">
                  <X size={10} strokeWidth={2.5} color="#f87171" />
                </button>
                <div className="dp-card-top">
                  <div className="dp-domain-icon">
                    <Globe size={14} strokeWidth={1.7} color="var(--muted)" />
                  </div>
                  <span className={`dp-badge ${qualityBadge(audit.quality)}`}>{audit.quality}</span>
                </div>
                <p className="dp-url">{audit.url}</p>
                <p className="dp-kw">{audit.keyword}</p>
                <div className="dp-card-foot">
                  <span className="dp-time">{timeAgo(audit.createdAt)}</span>
                  <button className="dp-arr">
                    <ArrowRight size={10} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
