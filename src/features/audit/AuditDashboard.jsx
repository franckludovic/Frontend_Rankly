import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAudit } from './services/auditService.js'
import { useAudit } from '../../store/auditSlice.js'
import { printSeoReport } from '../reports/reportGenerator.js'

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;}
.ad{padding:30px 28px 52px;min-width:0;font-family:'Outfit',sans-serif;color:var(--text);}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
.ad-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:18px;}
.ad-spin{width:44px;height:44px;border:3px solid var(--border,rgba(255,255,255,.08));border-top-color:var(--teal,#2dd4bf);border-radius:50%;animation:spin 1s linear infinite;}
.ad-load-txt{font-family:'DM Mono',monospace;font-size:12px;color:var(--muted,rgba(255,255,255,.4));letter-spacing:.5px;}

/* header */
.ad-hdr{margin-bottom:26px;animation:fadeUp .5s ease both;}
.ad-eyebrow{display:inline-flex;align-items:center;gap:6px;background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border2,rgba(255,255,255,.11));border-radius:6px;padding:4px 11px;margin-bottom:11px;}
.ad-eyebrow-txt{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.1px;text-transform:uppercase;color:var(--muted,rgba(255,255,255,.4));}
.ad-title{font-family:'Syne',sans-serif;font-size:clamp(20px,2.4vw,28px);font-weight:800;letter-spacing:-.5px;line-height:1.15;margin-bottom:10px;}
.ad-title em{color:var(--teal,#2dd4bf);font-style:normal;}
.ad-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.ad-chip{display:inline-flex;align-items:center;gap:7px;background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border,rgba(255,255,255,.07));border-radius:7px;padding:5px 11px;}
.ad-chip-lbl{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted,rgba(255,255,255,.4));}
.ad-chip-lbl b{color:var(--text);font-weight:500;}
.ad-live{display:inline-flex;align-items:center;gap:5px;background:var(--green-d,rgba(52,211,153,.08));border:1px solid var(--green-b,rgba(52,211,153,.2));border-radius:100px;padding:3px 10px;}
.ad-ldot{width:6px;height:6px;border-radius:50%;background:#10b981;animation:pulse 2s infinite;}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(16,185,129,.4);}70%{box-shadow:0 0 0 7px transparent;}100%{box-shadow:0 0 0 0 transparent;}}
.ad-ltxt{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.8px;text-transform:uppercase;color:var(--green,#34d399);}

/* hero row */
.ad-hero-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;animation:fadeUp .5s .05s ease both;}
.ad-hc{border-radius:13px;padding:20px 22px;position:relative;overflow:hidden;}
.ad-hc-quality{background:linear-gradient(135deg,rgba(251,191,36,.08),rgba(245,158,11,.04));border:1px solid rgba(245,158,11,.22);}
.ad-hc-quality::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 100% 0%,rgba(251,191,36,.1),transparent 65%);pointer-events:none;}
.ad-hc-rank{background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(79,70,229,.04));border:1px solid rgba(99,102,241,.25);}
.ad-hc-rank::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 100% 0%,rgba(99,102,241,.14),transparent 65%);pointer-events:none;}
.ad-hc-lbl{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;}
.ad-hc-quality .ad-hc-lbl{color:rgba(251,191,36,.55);}
.ad-hc-rank .ad-hc-lbl{color:rgba(165,180,252,.55);}
.ad-hc-main{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;}
.ad-hc-val{font-family:'Syne',sans-serif;line-height:1;}
.ad-hc-quality .ad-hc-val{font-size:32px;font-weight:800;color:var(--amber,#fbbf24);}
.ad-hc-rank .ad-hc-val{font-size:52px;font-weight:800;color:var(--indigo,#818cf8);}
.ad-rank-hash{font-size:26px;color:rgba(165,180,252,.45);margin-right:1px;}
.ad-hc-aside{text-align:right;}
.ad-hc-pill{display:inline-flex;align-items:center;gap:5px;border-radius:100px;padding:4px 10px;font-family:'DM Mono',monospace;font-size:9.5px;font-weight:500;margin-bottom:6px;}
.ad-hc-quality .ad-hc-pill{background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.2);color:var(--amber,#fbbf24);}
.ad-hc-rank .ad-hc-pill{background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.2);color:var(--indigo,#818cf8);}
.ad-hc-note{font-family:'DM Mono',monospace;font-size:9px;color:var(--faint,rgba(255,255,255,.18));}
.ad-qual-levels{display:flex;gap:5px;margin-top:14px;}
.ad-ql{flex:1;height:5px;border-radius:3px;}
.ad-ql.low{background:#f87171;}.ad-ql.med{background:var(--amber,#fbbf24);}.ad-ql.high{background:var(--green,#34d399);}.ad-ql.off{background:var(--bg3,rgba(255,255,255,.08));}
.ad-qual-tags{display:flex;justify-content:space-between;margin-top:5px;}
.ad-qual-tag{font-family:'DM Mono',monospace;font-size:8px;color:var(--faint,rgba(255,255,255,.18));}
.ad-qual-tag.current{font-weight:600;}
.ad-qual-tag.current.low{color:#f87171;}.ad-qual-tag.current.med{color:var(--amber,#fbbf24);}.ad-qual-tag.current.high{color:var(--green,#34d399);}
.ad-rank-track{height:4px;background:var(--bg3,rgba(255,255,255,.07));border-radius:3px;margin-top:14px;overflow:hidden;}
.ad-rank-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#6366f1,#a5b4fc);}
.ad-rank-labels{display:flex;justify-content:space-between;margin-top:5px;}
.ad-rank-lbl{font-family:'DM Mono',monospace;font-size:8px;color:var(--faint,rgba(255,255,255,.18));}
.ad-rank-lbl.current{color:var(--indigo,#818cf8);font-weight:500;}

/* secondary metrics */
.ad-sec-row{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:20px;animation:fadeUp .5s .1s ease both;}
.ad-sc{background:var(--bg3);border:1px solid var(--border);border-radius:11px;padding:13px 14px;transition:all .2s;}
.ad-sc:hover{background:var(--bg-hover);border-color:var(--border2,rgba(255,255,255,.11));}
.ad-sc-lbl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.8px;text-transform:uppercase;color:var(--faint,rgba(255,255,255,.18));margin-bottom:5px;}
.ad-sc-val{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;line-height:1.05;}
.ad-sc-unit{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted,rgba(255,255,255,.38));}
.ad-sc-sub{font-family:'DM Mono',monospace;font-size:8px;color:var(--faint,rgba(255,255,255,.18));margin-top:3px;}
.ad-pips{display:flex;gap:3px;margin-top:6px;}
.ad-pip{height:5px;border-radius:2px;flex:1;}
.ad-pip.teal{background:var(--teal,#2dd4bf);}.ad-pip.amber{background:var(--amber,#fbbf24);}.ad-pip.off{background:var(--bg3,rgba(255,255,255,.08));}

/* panel grid */
.ad-pgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;}
.ad-panel{background:var(--bg2);border:1px solid var(--border);border-radius:13px;overflow:hidden;animation:fadeUp .5s ease both;}
.ad-ph{display:flex;align-items:center;justify-content:space-between;padding:13px 16px 12px;border-bottom:1px solid var(--border,rgba(255,255,255,.07));}
.ad-ph-title{display:flex;align-items:center;gap:7px;font-family:'DM Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.6px;color:var(--muted);text-transform:uppercase;}
.ad-pb-body{padding:16px;}

/* badges */
.ad-badge{font-family:'DM Mono',monospace;font-size:8px;font-weight:500;letter-spacing:.3px;padding:2px 8px;border-radius:4px;text-transform:uppercase;white-space:nowrap;}
.ad-badge.crit{background:var(--red-d,rgba(239,68,68,.08));color:var(--red,#f87171);border:1px solid var(--red-b,rgba(239,68,68,.2));}
.ad-badge.warn{background:var(--amber-d,rgba(245,158,11,.1));color:var(--amber,#fbbf24);border:1px solid var(--amber-b,rgba(245,158,11,.22));}
.ad-badge.ok{background:var(--green-d,rgba(52,211,153,.08));color:var(--green,#34d399);border:1px solid var(--green-b,rgba(52,211,153,.2));}
.ad-badge.miss{background:var(--red-d,rgba(239,68,68,.08));color:var(--red,#fca5a5);border:1px solid var(--red-b,rgba(239,68,68,.14));}
.ad-badge.info{background:var(--indigo-d,rgba(99,102,241,.1));color:var(--indigo,#818cf8);border:1px solid var(--indigo-b,rgba(99,102,241,.25));}

/* meta rows */
.ad-mrow{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--border,rgba(255,255,255,.07));}
.ad-mrow:last-child{border-bottom:none;}
.ad-mr-left{flex:1;min-width:0;}
.ad-mr-key{font-family:'DM Mono',monospace;font-size:10px;color:var(--faint,rgba(255,255,255,.18));margin-bottom:3px;text-transform:uppercase;letter-spacing:.4px;}
.ad-mr-val{font-family:'DM Mono',monospace;font-size:12px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ad-mr-right{flex-shrink:0;display:flex;align-items:center;}

/* suggestions */
.ad-sugg-list{display:flex;flex-direction:column;gap:8px;}
.ad-sugg{display:flex;gap:12px;padding:11px 13px;background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border,rgba(255,255,255,.07));border-radius:10px;transition:all .2s;}
.ad-sugg:hover{background:var(--bg-hover);border-color:var(--border2,rgba(255,255,255,.11));}
.ad-sugg-rank{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--faint,rgba(255,255,255,.18));flex-shrink:0;width:36px;text-align:center;align-self:center;}
.ad-sugg-body{flex:1;min-width:0;}
.ad-sugg-fix{font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px;line-height:1.35;}
.ad-sugg-why{font-family:'Outfit',sans-serif;font-size:11.5px;color:var(--muted,rgba(255,255,255,.38));line-height:1.5;}
.ad-impact-wrap{text-align:right;flex-shrink:0;}
.ad-impact-val{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;}
.ad-impact-high{color:var(--red,#f87171);}.ad-impact-med{color:var(--amber,#fbbf24);}
.ad-impact-lbl{font-family:'DM Mono',monospace;font-size:8px;color:var(--faint,rgba(255,255,255,.18));text-transform:uppercase;margin-bottom:3px;}

/* CTA */
.ad-cta-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:14px;animation:fadeUp .5s .25s ease both;}
.ad-cta-card{background:linear-gradient(135deg,rgba(13,148,136,.1),rgba(15,118,110,.04));border:1px solid rgba(13,148,136,.25);border-radius:13px;padding:20px 22px;cursor:pointer;transition:all .2s;text-decoration:none;display:block;}
.ad-cta-card.indigo{background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(79,70,229,.04));border-color:rgba(99,102,241,.25);}
.ad-cta-card.rose{background:linear-gradient(135deg,rgba(244,63,94,.08),rgba(190,18,60,.04));border-color:rgba(244,63,94,.25);}
.ad-cta-card:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.25);}
.ad-cta-icon{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;}
.ad-cta-card:not(.indigo):not(.rose) .ad-cta-icon{background:rgba(13,148,136,.18);border:1px solid rgba(13,148,136,.3);}
.ad-cta-card.indigo .ad-cta-icon{background:rgba(99,102,241,.18);border:1px solid rgba(99,102,241,.3);}
.ad-cta-card.rose .ad-cta-icon{background:rgba(244,63,94,.14);border:1px solid rgba(244,63,94,.3);}
.ad-cta-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:var(--text);margin-bottom:5px;}
.ad-cta-sub{font-family:'Outfit',sans-serif;font-size:12px;color:var(--muted,rgba(255,255,255,.38));line-height:1.5;}
.ad-cta-arrow{display:inline-flex;align-items:center;gap:5px;margin-top:10px;font-family:'DM Mono',monospace;font-size:11px;}
.ad-cta-card:not(.indigo):not(.rose) .ad-cta-arrow{color:var(--teal,#2dd4bf);}
.ad-cta-card.indigo .ad-cta-arrow{color:var(--indigo,#818cf8);}
.ad-cta-card.rose .ad-cta-arrow{color:#fb7185;}
/* download btn in header */
.ad-dl-btn{display:inline-flex;align-items:center;gap:7px;background:rgba(244,63,94,.1);border:1px solid rgba(244,63,94,.25);color:#fb7185;border-radius:8px;padding:6px 14px;font-family:'DM Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.4px;text-transform:uppercase;cursor:pointer;transition:all .2s;}
.ad-dl-btn:hover{background:rgba(244,63,94,.18);border-color:rgba(244,63,94,.4);transform:translateY(-1px);}

@media(max-width:900px){.ad-sec-row{grid-template-columns:repeat(3,1fr);}.ad-pgrid{grid-template-columns:1fr;}}
@media(max-width:600px){.ad-hero-row{grid-template-columns:1fr;}.ad-sec-row{grid-template-columns:1fr 1fr;}.ad-cta-row{grid-template-columns:1fr;}.ad{padding:20px 16px 40px;}}
`

const check = (ok) => ok
  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

export default function AuditDashboard() {
  const { id }            = useParams()
  const navigate          = useNavigate()
  const { currentAudit, isLoading, setAudit } = useAudit()
  const [error, setError] = useState('')

  useEffect(() => {
    if (currentAudit?.id === id) return
    getAudit(id)
      .then(setAudit)
      .catch(() => setError('Audit not found. It may have been deleted.'))
  }, [id])

  if (isLoading || (!currentAudit && !error) || (currentAudit?.id !== id && !error)) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className="ad">
          <div className="ad-loading">
            <div className="ad-spin" />
            <div className="ad-load-txt">Loading audit analysis…</div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className="ad" style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'50vh',gap:12 }}>
          <div style={{ fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:700,color:'var(--text)' }}>Audit not found</div>
          <div style={{ fontFamily:"'DM Mono',monospace",fontSize:12,color:'var(--muted)' }}>{error}</div>
          <button onClick={() => navigate('/dashboard')} style={{ marginTop:12,padding:'10px 22px',borderRadius:9,background:'var(--teal-d)',border:'1px solid var(--teal-b)',color:'var(--teal)',fontFamily:"'Outfit',sans-serif",fontSize:13,cursor:'pointer' }}>
            Back to Dashboard
          </button>
        </div>
      </>
    )
  }

  const a = currentAudit
  const qualityLevel = a.quality === 'HIGH' ? 'high' : a.quality === 'MEDIUM' ? 'med' : 'low'
  const rankPct = Math.max(5, Math.round(((100 - a.predictedRank) / 100) * 100))

  // Adapts the current flat audit shape for the report generator.
  // When Phase 5 refactors pages to the nested backend shape, update these
  // field paths (e.g. a.on_page.title, a.on_page.word_count, etc.).
  const handleDownloadReport = () => {
    const reportData = {
      url:            a.url,
      title:          a.pageTitle,
      metaDesc:       a.metaDescription,
      wordCount:      a.wordCount,
      isHttps:        a.isHttps ?? true,
      viewport:       a.viewport ?? true,
      canonical:      a.canonical || '',
      hasSchema:      a.hasSchema ?? false,
      keyword_density: a.keywordDensity,
    }
    printSeoReport(reportData, a.seoScore ?? 0, a.keyword)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="ad">
        {/* ── Header ── */}
        <div className="ad-hdr">
          <div className="ad-eyebrow">
            <span className="ad-eyebrow-txt">AI Analysis Complete</span>
          </div>
          <h1 className="ad-title">SEO Analysis — <em>{a.keyword}</em></h1>
          <div className="ad-meta">
            <div className="ad-chip"><span className="ad-chip-lbl">⌕ <b>{a.keyword}</b></span></div>
            <div className="ad-chip"><span className="ad-chip-lbl">🌐 <b>{a.url}</b></span></div>
            <button className="ad-dl-btn" onClick={handleDownloadReport} id="download-report-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Report
            </button>
          </div>
        </div>

        {/* ── Hero cards ── */}
        <div className="ad-hero-row">
          <div className="ad-hc ad-hc-quality">
            <div className="ad-hc-lbl">Content Quality</div>
            <div className="ad-hc-main">
              <div className="ad-hc-val">{a.quality}</div>
              <div className="ad-hc-aside">
                <div className={`ad-hc-pill`}>SEO Score: {a.seoScore}</div>
                <div className="ad-hc-note">Based on 27 signals</div>
              </div>
            </div>
            <div className="ad-qual-levels">
              <div className={`ad-ql ${qualityLevel === 'low' ? 'low' : 'off'}`}/>
              <div className={`ad-ql ${qualityLevel === 'med' || qualityLevel === 'high' ? 'med' : 'off'}`}/>
              <div className={`ad-ql ${qualityLevel === 'high' ? 'high' : 'off'}`}/>
            </div>
            <div className="ad-qual-tags">
              <span className={`ad-qual-tag ${qualityLevel === 'low' ? 'current low' : ''}`}>Low</span>
              <span className={`ad-qual-tag ${qualityLevel === 'med' ? 'current med' : ''}`}>Medium</span>
              <span className={`ad-qual-tag ${qualityLevel === 'high' ? 'current high' : ''}`}>High</span>
            </div>
          </div>

          <div className="ad-hc ad-hc-rank">
            <div className="ad-hc-lbl">Predicted Position</div>
            <div className="ad-hc-main">
              <div className="ad-hc-val">
                <span className="ad-rank-hash">#</span>{a.predictedRank}
              </div>
              <div className="ad-hc-aside">
                <div className="ad-hc-pill">ML Confidence: High</div>
                <div className="ad-hc-note">vs. top-10 competitors</div>
              </div>
            </div>
            <div className="ad-rank-track"><div className="ad-rank-fill" style={{ width:`${rankPct}%` }}/></div>
            <div className="ad-rank-labels">
              <span className="ad-rank-lbl">#100</span>
              <span className="ad-rank-lbl current">#{a.predictedRank}</span>
              <span className="ad-rank-lbl">#1</span>
            </div>
          </div>
        </div>

        {/* ── Secondary metrics ── */}
        <div className="ad-sec-row">
          {[
            { lbl:'Keyword Coverage', val: a.keywordCoverage, unit:'/5', sub:'placement signals', pips: a.keywordCoverage, max:5, color:'teal' },
            { lbl:'Technical Score',  val: a.technicalScore,  unit:'/5', sub:'page health',       pips: a.technicalScore, max:5, color:'teal' },
            { lbl:'Issues Found',     val: a.issuesFound,     unit:'',   sub:'fix recommended',   pips: a.issuesFound, max:5, color:'amber' },
            { lbl:'Checks Passed',    val: a.checksPassed,    unit:'',   sub:`of ${a.checksPassed + a.issuesFound} total`, pips: null },
            { lbl:'Word Count',       val: a.wordCount,       unit:'',   sub:'words on page', pips: null },
          ].map(m => (
            <div key={m.lbl} className="ad-sc">
              <div className="ad-sc-lbl">{m.lbl}</div>
              <div className="ad-sc-val" style={{ color: m.color==='amber' ? 'var(--amber,#fbbf24)' : m.color==='teal' ? 'var(--teal,#2dd4bf)' : 'var(--text,rgba(255,255,255,.88))' }}>
                {m.val.toLocaleString()}<span className="ad-sc-unit">{m.unit}</span>
              </div>
              <div className="ad-sc-sub">{m.sub}</div>
              {m.pips !== null && (
                <div className="ad-pips">
                  {Array.from({ length: m.max || 5 }).map((_, i) => (
                    <div key={i} className={`ad-pip ${i < m.pips ? m.color : 'off'}`}/>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Panels ── */}
        <div className="ad-pgrid">
          {/* On-page Metadata */}
          <div className="ad-panel">
            <div className="ad-ph">
              <div className="ad-ph-title">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                On-Page Metadata
              </div>
              <span className={`ad-badge ${a.issuesFound > 2 ? 'crit' : 'warn'}`}>{a.issuesFound} issues</span>
            </div>
            <div className="ad-pb-body">
              {[
                { key:'Page Title',       val: a.pageTitle,       badge: a.titleHasKw ? null : { cls:'miss', txt:'Missing KW' } },
                { key:'Meta Description', val: a.metaDescription, badge: a.metaHasKw  ? null : { cls:'miss', txt:'Missing KW' } },
                { key:'H1 Heading',       val: a.h1,              badge: a.h1HasKw    ? null : { cls:'miss', txt:'Missing KW' } },
                { key:'Canonical URL',    val: a.canonical,       badge: null },
                { key:'Index Status',     val: a.indexStatus,     badge: { cls:'ok', txt:'OK' } },
              ].map(r => (
                <div key={r.key} className="ad-mrow">
                  <div className="ad-mr-left">
                    <div className="ad-mr-key">{r.key}</div>
                    <div className="ad-mr-val">{r.val}</div>
                  </div>
                  <div className="ad-mr-right">
                    {r.badge
                      ? <span className={`ad-badge ${r.badge.cls}`}>{r.badge.txt}</span>
                      : <span className={`ad-badge ok`}>OK</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Keyword presence */}
          <div className="ad-panel">
            <div className="ad-ph">
              <div className="ad-ph-title">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Keyword Presence
              </div>
              <span className="ad-badge info">{a.keyword}</span>
            </div>
            <div className="ad-pb-body">
              {[
                { loc:'Title Tag',        ok: a.titleHasKw },
                { loc:'Meta Description', ok: a.metaHasKw  },
                { loc:'H1 Heading',       ok: a.h1HasKw    },
                { loc:'Image Alt Text',   ok: a.altHasKw   },
                { loc:'Body Content',     ok: a.bodyHasKw  },
              ].map(r => (
                <div key={r.loc} className="ad-mrow">
                  <div className="ad-mr-left">
                    <div className="ad-mr-val">{r.loc}</div>
                  </div>
                  <div className="ad-mr-right" style={{ gap: 8, display:'flex', alignItems:'center' }}>
                    {check(r.ok)}
                    <span className={`ad-badge ${r.ok ? 'ok' : 'miss'}`}>{r.ok ? 'Found' : 'Missing'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content stats */}
          <div className="ad-panel">
            <div className="ad-ph">
              <div className="ad-ph-title">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
                Content Statistics
              </div>
            </div>
            <div className="ad-pb-body">
              {[
                { key:'Word Count',        val: a.wordCount + ' words',       badge: a.wordCount >= 1500 ? { cls:'ok',txt:'Good' } : { cls:'warn',txt:'Too short' } },
                { key:'Keyword Density',   val: a.keywordDensity + '%',       badge: a.keywordDensity >= 1 && a.keywordDensity <= 3 ? { cls:'ok',txt:'Good' } : { cls:'warn',txt:'Check' } },
                { key:'Paragraphs',        val: a.paragraphs + ' sections',   badge: null },
                { key:'H2 Headings',       val: a.h2Count + ' subheadings',   badge: null },
                { key:'H3 Headings',       val: a.h3Count + ' sub-sections',  badge: null },
              ].map(r => (
                <div key={r.key} className="ad-mrow">
                  <div className="ad-mr-left">
                    <div className="ad-mr-key">{r.key}</div>
                    <div className="ad-mr-val">{r.val}</div>
                  </div>
                  <div className="ad-mr-right">
                    {r.badge
                      ? <span className={`ad-badge ${r.badge.cls}`}>{r.badge.txt}</span>
                      : null
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical */}
          <div className="ad-panel">
            <div className="ad-ph">
              <div className="ad-ph-title">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Technical Signals
              </div>
            </div>
            <div className="ad-pb-body">
              {[
                { key:'Alt Text Coverage',  val: a.altCoverage + '%',          badge: a.altCoverage >= 80 ? { cls:'ok',txt:'Good' } : { cls:'warn',txt:'Low' } },
                { key:'Internal Links',     val: a.internalLinks + ' links',   badge: a.internalLinks >= 50 ? { cls:'ok',txt:'Good' } : { cls:'warn',txt:'Low' } },
                { key:'External Links',     val: a.externalLinks + ' links',   badge: null },
                { key:'Schema Markup',      val: a.hasSchema ? 'Present' : 'Not detected', badge: a.hasSchema ? { cls:'ok',txt:'Present' } : { cls:'miss',txt:'Missing' } },
                { key:'Readability Score',  val: a.readabilityScore + '/100',  badge: a.readabilityScore >= 60 ? { cls:'ok',txt:'Good' } : { cls:'warn',txt:'Improve' } },
              ].map(r => (
                <div key={r.key} className="ad-mrow">
                  <div className="ad-mr-left">
                    <div className="ad-mr-key">{r.key}</div>
                    <div className="ad-mr-val">{r.val}</div>
                  </div>
                  <div className="ad-mr-right">
                    {r.badge ? <span className={`ad-badge ${r.badge.cls}`}>{r.badge.txt}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Suggestions ── */}
        <div className="ad-panel" style={{ marginBottom:14, animation:'fadeUp .5s .2s ease both' }}>
          <div className="ad-ph">
            <div className="ad-ph-title">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/></svg>
              Top AI Suggestions
            </div>
            <span className="ad-badge warn">{a.suggestions.length} improvements</span>
          </div>
          <div className="ad-pb-body">
            <div className="ad-sugg-list">
              {a.suggestions.map(s => (
                <div key={s.rank} className="ad-sugg">
                  <div className="ad-sugg-rank">#{s.rank}</div>
                  <div className="ad-sugg-body">
                    <div className="ad-sugg-fix">{s.fix}</div>
                    <div className="ad-sugg-why">{s.why}</div>
                  </div>
                  <div className="ad-impact-wrap">
                    <div className="ad-impact-lbl">Impact</div>
                    <div className={`ad-impact-val ${s.impact === 'high' ? 'ad-impact-high' : 'ad-impact-med'}`}>
                      +{s.pct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA cards ── */}
        <div className="ad-cta-row">
          <div className="ad-cta-card" onClick={() => navigate(`/audit/${a.id}/competitors`)}>
            <div className="ad-cta-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal,#2dd4bf)" strokeWidth="1.8">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="ad-cta-title">View Competitor Benchmark</div>
            <div className="ad-cta-sub">See exactly how you stack up against the top 10 ranking pages with a head-to-head breakdown.</div>
            <div className="ad-cta-arrow">View Competitors →</div>
          </div>

          <div className="ad-cta-card indigo" onClick={() => navigate(`/audit/${a.id}/roadmap`)}>
            <div className="ad-cta-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--indigo,#818cf8)" strokeWidth="1.8">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
              </svg>
            </div>
            <div className="ad-cta-title">Open Optimization Roadmap</div>
            <div className="ad-cta-sub">Your {a.roadmapTasks?.length || 0} prioritised tasks with estimated position gains. Tick them off as you go.</div>
            <div className="ad-cta-arrow">View Roadmap →</div>
          </div>

          {/* Download Report CTA — uses current flat shape, update field paths in Phase 5 */}
          <div className="ad-cta-card rose" onClick={handleDownloadReport} id="cta-download-report">
            <div className="ad-cta-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="1.8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <polyline points="9 15 12 18 15 15"/>
              </svg>
            </div>
            <div className="ad-cta-title">Download PDF Report</div>
            <div className="ad-cta-sub">Export a print-ready SEO audit report with all checks, issues, and recommendations.</div>
            <div className="ad-cta-arrow">Download Report →</div>
          </div>
        </div>
      </div>
    </>
  )
}
