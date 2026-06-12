import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAudit } from '../../store/auditSlice.js'
import { getAudit } from '../audit/services/auditService.js'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;}
.cp{padding:30px 28px 52px;min-width:0;font-family:'Outfit',sans-serif;color:var(--text);}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}

.cp-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:18px;}
.cp-spin{width:44px;height:44px;border:3px solid rgba(255,255,255,.08);border-top-color:var(--teal,#2dd4bf);border-radius:50%;animation:spin 1s linear infinite;}

/* header */
.cp-hdr{margin-bottom:22px;animation:fadeUp .5s ease both;}
.cp-eyebrow{display:inline-flex;align-items:center;gap:6px;background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border2,rgba(255,255,255,.11));border-radius:6px;padding:4px 11px;margin-bottom:10px;}
.cp-eyebrow-txt{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.1px;text-transform:uppercase;color:var(--muted,rgba(255,255,255,.4));}
.cp-title{font-family:'Syne',sans-serif;font-size:clamp(18px,2.3vw,26px);font-weight:800;letter-spacing:-.5px;margin-bottom:8px;}
.cp-title em{color:var(--teal,#2dd4bf);font-style:normal;}
.cp-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.cp-chip{display:inline-flex;align-items:center;gap:6px;background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border,rgba(255,255,255,.07));border-radius:7px;padding:5px 11px;font-family:'DM Mono',monospace;font-size:11px;color:var(--muted,rgba(255,255,255,.4));}
.cp-chip b{color:var(--text);font-weight:500;}
.cp-count{background:var(--teal-d,rgba(20,184,166,.12));border:1px solid var(--teal-b,rgba(20,184,166,.25));border-radius:100px;padding:3px 10px;font-family:'DM Mono',monospace;font-size:9px;color:var(--teal,#2dd4bf);}

/* chart card */
.cp-chart-card{background:var(--bg2);border:1px solid var(--border);border-radius:13px;padding:20px 20px 16px;margin-bottom:20px;animation:fadeUp .5s .05s ease both;}
.cp-chart-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px;flex-wrap:wrap;}
.cp-chart-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:var(--text,white);margin-bottom:3px;}
.cp-chart-sub{font-family:'DM Mono',monospace;font-size:9.5px;color:var(--faint,rgba(255,255,255,.18));}
.cp-legend{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
.cp-leg-item{display:flex;align-items:center;gap:5px;font-family:'DM Mono',monospace;font-size:9px;color:var(--muted,rgba(255,255,255,.4));}
.cp-leg-dot{width:9px;height:9px;border-radius:3px;flex-shrink:0;}

/* metric selector */
.cp-metrics{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;}
.cp-ms-btn{padding:5px 12px;border-radius:7px;border:1px solid var(--border,rgba(255,255,255,.07));background:none;font-family:'DM Mono',monospace;font-size:10px;color:var(--muted,rgba(255,255,255,.4));cursor:pointer;transition:all .15s;letter-spacing:.2px;}
.cp-ms-btn:hover{border-color:var(--border2,rgba(255,255,255,.12));color:rgba(255,255,255,.7);}
.cp-ms-btn.active{background:var(--indigo-d,rgba(99,102,241,.1));border-color:var(--indigo-b,rgba(99,102,241,.25));color:var(--indigo,#818cf8);font-weight:500;}

/* custom tooltip */
.cp-tooltip{background:var(--chart-tooltip,rgba(5,12,28,.97));border:1px solid rgba(255,255,255,.12);border-radius:9px;padding:10px 13px;min-width:140px;}
.cp-tt-domain{font-family:'DM Mono',monospace;font-size:10px;color:rgba(255,255,255,.5);margin-bottom:4px;}
.cp-tt-val{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;}
.cp-tt-unit{font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,.3);margin-top:2px;}

/* competitor tabs */
.cp-selector{margin-bottom:20px;animation:fadeUp .5s .12s ease both;}
.cp-sel-label{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.8px;color:var(--faint,rgba(255,255,255,.18));margin-bottom:10px;}
.cp-tabs{display:flex;gap:7px;overflow-x:auto;padding-bottom:4px;}
.cp-tabs::-webkit-scrollbar{height:3px;}
.cp-tab{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 12px;border-radius:10px;border:1px solid var(--border,rgba(255,255,255,.07));background:var(--bg3,rgba(255,255,255,.025));cursor:pointer;transition:all .2s;flex-shrink:0;min-width:70px;}
.cp-tab:hover{border-color:var(--border2,rgba(255,255,255,.12));background:rgba(255,255,255,.04);}
.cp-tab.active{border-color:var(--teal-b,rgba(20,184,166,.25));background:var(--teal-d,rgba(20,184,166,.12));}
.cp-tab-rank{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;line-height:1;}
.cp-tab.active .cp-tab-rank{color:var(--teal,#2dd4bf);}
.cp-tab-rlbl{font-family:'DM Mono',monospace;font-size:7.5px;text-transform:uppercase;letter-spacing:.4px;color:var(--faint,rgba(255,255,255,.18));}
.cp-tab-domain{font-family:'DM Mono',monospace;font-size:8.5px;color:var(--muted,rgba(255,255,255,.4));max-width:68px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;}
.cp-tab.active .cp-tab-domain{color:var(--teal,#2dd4bf);}
.cp-you-tab{border-color:rgba(45,212,191,.25)!important;background:rgba(45,212,191,.06)!important;}
.cp-you-tab .cp-tab-rank{color:var(--teal,#2dd4bf)!important;}

/* overview row */
.cp-ov-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;animation:fadeUp .5s .18s ease both;}
.cp-ov{background:var(--bg2);border:1px solid var(--border);border-radius:13px;padding:16px 18px;position:relative;overflow:hidden;}
.cp-ov-lbl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.8px;text-transform:uppercase;color:var(--faint,rgba(255,255,255,.18));margin-bottom:6px;}
.cp-ov-val{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;line-height:1;}
.cp-ov-note{font-family:'DM Mono',monospace;font-size:9px;margin-top:4px;color:var(--muted,rgba(255,255,255,.4));}
.cp-pips{display:flex;gap:3px;margin-top:8px;}
.cp-pip{height:5px;flex:1;border-radius:2px;}
.cp-pip.on-t{background:var(--teal,#2dd4bf);}.cp-pip.on-g{background:var(--green,#34d399);}.cp-pip.off{background:rgba(255,255,255,.08);}

/* H2H */
.cp-h2h{animation:fadeUp .5s .22s ease both;}
.cp-shdr{display:flex;align-items:center;gap:9px;margin-bottom:14px;}
.cp-sbar{width:3px;height:17px;border-radius:2px;}
.cp-stitle{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:var(--text,white);}
.cp-col-labels{display:grid;grid-template-columns:1fr 160px 1fr;margin-bottom:8px;padding:0 36px;}
.cp-col-comp{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:var(--indigo,#818cf8);text-align:left;}
.cp-col-mid{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:var(--faint,rgba(255,255,255,.18));text-align:center;}
.cp-col-you{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:var(--teal,#2dd4bf);text-align:right;}
.cp-mrows{display:flex;flex-direction:column;gap:6px;margin-bottom:18px;}
.cp-mrow{display:grid;grid-template-columns:1fr 160px 1fr;align-items:center;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px 36px;transition:all .2s;}
.cp-mrow:hover{background:var(--bg-hover);border-color:var(--border2);}
.cp-mrow.comp-win{border-color:rgba(239,68,68,.13);}.cp-mrow.you-win{border-color:rgba(20,184,166,.15);}
.cp-mrow-val{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;line-height:1;}
.cp-mrow-l{text-align:left;}.cp-mrow-r{text-align:right;}
.c-teal{color:var(--teal,#2dd4bf);}.c-indigo{color:var(--indigo,#818cf8);}
.c-win{color:rgba(45,212,191,.9);}.c-lose{color:rgba(248,113,113,.75);}
.cp-mrow-mid{display:flex;flex-direction:column;align-items:center;gap:4px;padding:0 10px;}
.cp-mrow-name{font-family:'Outfit',sans-serif;font-size:12px;font-weight:500;color:var(--muted);text-align:center;line-height:1.3;}
.cp-rbadge{font-family:'DM Mono',monospace;font-size:8.5px;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:.3px;font-weight:500;white-space:nowrap;}
.rb-ahead{background:var(--teal-d,rgba(20,184,166,.12));color:var(--teal,#2dd4bf);border:1px solid var(--teal-b,rgba(20,184,166,.25));}
.rb-behind{background:var(--red-d,rgba(239,68,68,.08));color:var(--red,#f87171);border:1px solid var(--red-b,rgba(239,68,68,.2));}
.rb-tied{background:rgba(255,255,255,.05);color:var(--muted,rgba(255,255,255,.4));border:1px solid var(--border,rgba(255,255,255,.07));}

/* keyword presence grid */
.cp-kp-wrap{background:var(--bg2);border:1px solid var(--border);border-radius:13px;padding:16px;margin-bottom:18px;animation:fadeUp .5s .26s ease both;}
.cp-kp-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:10px;}
.cp-kp-cell{border-radius:8px;padding:9px 8px;border:1px solid;text-align:center;}
.cp-kp-loc{font-family:'DM Mono',monospace;font-size:8.5px;text-transform:uppercase;letter-spacing:.4px;color:var(--faint,rgba(255,255,255,.18));margin-bottom:5px;}
.cp-kp-lbl{font-family:'DM Mono',monospace;font-size:7.5px;text-transform:uppercase;color:var(--faint,rgba(255,255,255,.18));margin-top:3px;}

@media(max-width:1100px){.cp-ov-row{grid-template-columns:repeat(2,1fr);}.cp-kp-grid{grid-template-columns:repeat(3,1fr);}.cp-col-labels,.cp-mrow{grid-template-columns:1fr 130px 1fr;}.cp-col-labels{padding:0 24px;}.cp-mrow{padding:12px 24px;}}
@media(max-width:600px){.cp{padding:20px 16px 40px;}.cp-mrow-val{font-size:14px;}.cp-col-labels,.cp-mrow{grid-template-columns:1fr 90px 1fr;}.cp-col-labels{padding:0 14px;}.cp-mrow{padding:12px 14px;}}
`

const METRICS = [
  { key: 'wordCount',      label: 'Word Count',       unit: 'words'  },
  { key: 'keywordDensity', label: 'Keyword Density',  unit: '%'      },
  { key: 'internalLinks',  label: 'Internal Links',   unit: 'links'  },
  { key: 'altCoverage',    label: 'Alt Coverage',     unit: '%'      },
]

const H2H_ROWS = [
  { key: 'wordCount',      label: 'Word Count',       unit: 'w',  higher: true  },
  { key: 'keywordDensity', label: 'Keyword Density',  unit: '%',  higher: true  },
  { key: 'internalLinks',  label: 'Internal Links',   unit: '',   higher: true  },
  { key: 'altCoverage',    label: 'Alt Coverage',     unit: '%',  higher: true  },
  { key: 'h2Count',        label: 'H2 Headings',      unit: '',   higher: true  },
]

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="cp-tooltip">
      <div className="cp-tt-domain">{label}</div>
      <div className="cp-tt-val" style={{ color: label === 'You' ? '#2dd4bf' : '#818cf8' }}>{payload[0].value}</div>
      <div className="cp-tt-unit">{unit}</div>
    </div>
  )
}

export default function CompetitorsPage() {
  const { id }                     = useParams()
  const navigate                   = useNavigate()
  const { currentAudit, isLoading, setAudit } = useAudit()
  const [selComp, setSelComp]      = useState(0)
  const [selMetric, setSelMetric]  = useState(0)

  useEffect(() => {
    if (!currentAudit || currentAudit.id !== id) {
      getAudit(id).then(setAudit).catch(() => navigate('/dashboard'))
    }
  }, [id])

  if (isLoading || !currentAudit || currentAudit.id !== id) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className="cp"><div className="cp-loading"><div className="cp-spin"/></div></div>
      </>
    )
  }

  const a    = currentAudit
  const comp = a.competitors[selComp]
  const m    = METRICS[selMetric]

  /* Read the current --muted CSS variable value for SVG chart ticks */
  const tickColor = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || 'rgba(100,116,139,1)'

  /* Chart data: you vs all competitors */
  const youVal = { wordCount: a.wordCount, keywordDensity: a.keywordDensity, internalLinks: a.internalLinks, altCoverage: a.altCoverage }
  const chartData = [
    { name: 'You', value: youVal[m.key] ?? 0, you: true },
    ...a.competitors.map(c => ({ name: c.domain.split('.')[0], value: c[m.key] ?? 0, you: false }))
  ]

  /* H2H comparison */
  const youH2H  = { wordCount: a.wordCount, keywordDensity: a.keywordDensity, internalLinks: a.internalLinks, altCoverage: a.altCoverage, h2Count: a.h2Count }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="cp">
        {/* Header */}
        <div className="cp-hdr">
          <div className="cp-eyebrow"><span className="cp-eyebrow-txt">Competitor Benchmarking</span></div>
          <h1 className="cp-title">Competing for <em>{a.keyword}</em></h1>
          <div className="cp-meta">
            <div className="cp-chip"><span>⌕ <b>{a.keyword}</b></span></div>
            <div className="cp-chip"><span>🌐 <b>{a.url}</b></span></div>
            <span className="cp-count">{a.competitors.length} competitors</span>
          </div>
        </div>

        {/* Bar chart */}
        <div className="cp-chart-card">
          <div className="cp-chart-top">
            <div>
              <div className="cp-chart-title">Metric Comparison — All Competitors</div>
              <div className="cp-chart-sub">You vs. the top {a.competitors.length} ranking pages</div>
            </div>
            <div className="cp-legend">
              <div className="cp-leg-item"><div className="cp-leg-dot" style={{ background:'#2dd4bf' }}/> You</div>
              <div className="cp-leg-item"><div className="cp-leg-dot" style={{ background:'rgba(99,102,241,.5)' }}/> Competitors</div>
            </div>
          </div>
          <div className="cp-metrics">
            {METRICS.map((mt, i) => (
              <button key={mt.key} className={`cp-ms-btn${selMetric === i ? ' active' : ''}`} onClick={() => setSelMetric(i)}>
                {mt.label}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top:4, right:8, left:-16, bottom:0 }} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontFamily:"'DM Mono',monospace", fontSize:9, fill: tickColor }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontFamily:"'DM Mono',monospace", fontSize:9, fill: tickColor }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip unit={m.unit}/>} cursor={{ fill:'rgba(255,255,255,.03)' }}/>
              <ReferenceLine y={youVal[m.key]} stroke="rgba(45,212,191,.25)" strokeDasharray="4 3"/>
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.you ? '#2dd4bf' : 'rgba(99,102,241,.45)'}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Competitor selector tabs */}
        <div className="cp-selector">
          <div className="cp-sel-label">Select Competitor for Head-to-Head</div>
          <div className="cp-tabs">
            <div className="cp-tab cp-you-tab">
              <div className="cp-tab-rank">–</div>
              <div className="cp-tab-rlbl">You</div>
              <div className="cp-tab-domain" style={{ color:'var(--teal,#2dd4bf)' }}>your-site</div>
            </div>
            {a.competitors.map((c, i) => (
              <div key={c.rank} className={`cp-tab${selComp === i ? ' active' : ''}`} onClick={() => setSelComp(i)}>
                <div className="cp-tab-rank">#{c.rank}</div>
                <div className="cp-tab-rlbl">Rank</div>
                <div className="cp-tab-domain">{c.domain}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Overview cards */}
        <div className="cp-ov-row">
          <div className="cp-ov" style={{ borderColor:'rgba(99,102,241,.22)',background:'rgba(99,102,241,.05)' }}>
            <div className="cp-ov-lbl">Their Rank</div>
            <div className="cp-ov-val" style={{ color:'var(--indigo,#818cf8)' }}>#{comp.rank}</div>
            <div className="cp-ov-note">vs. your predicted #{a.predictedRank}</div>
          </div>
          <div className="cp-ov" style={{ borderColor:'rgba(245,158,11,.18)',background:'rgba(245,158,11,.03)' }}>
            <div className="cp-ov-lbl">Search Presence</div>
            <div className="cp-ov-val" style={{ color:'var(--amber,#fbbf24)' }}>{comp.searchPresence}%</div>
            <div className="cp-ov-note">estimated SERP visibility</div>
          </div>
          <div className="cp-ov" style={{ borderColor:'var(--teal-b,rgba(20,184,166,.25))',background:'var(--teal-d,rgba(20,184,166,.12))' }}>
            <div className="cp-ov-lbl">Keyword Signals</div>
            <div className="cp-ov-val" style={{ color:'var(--teal,#2dd4bf)' }}>{comp.keywordSignal}/5</div>
            <div className="cp-pips">{Array.from({length:5}).map((_,i)=><div key={i} className={`cp-pip ${i < comp.keywordSignal ? 'on-t' : 'off'}`}/>)}</div>
          </div>
          <div className="cp-ov" style={{ borderColor:'var(--green-b,rgba(52,211,153,.2))',background:'var(--green-d,rgba(52,211,153,.08))' }}>
            <div className="cp-ov-lbl">Technical Score</div>
            <div className="cp-ov-val" style={{ color:'var(--green,#34d399)' }}>{comp.technicalScore}/5</div>
            <div className="cp-pips">{Array.from({length:5}).map((_,i)=><div key={i} className={`cp-pip ${i < comp.technicalScore ? 'on-g' : 'off'}`}/>)}</div>
          </div>
        </div>

        {/* Head to head */}
        <div className="cp-h2h">
          <div className="cp-shdr">
            <div className="cp-sbar" style={{ background:'var(--teal,#2dd4bf)' }}/>
            <h2 className="cp-stitle">Head-to-Head vs. {comp.domain}</h2>
          </div>
          <div className="cp-col-labels">
            <div className="cp-col-comp">{comp.domain}</div>
            <div className="cp-col-mid">Metric</div>
            <div className="cp-col-you">You</div>
          </div>
          <div className="cp-mrows">
            {H2H_ROWS.map(row => {
              const cVal = comp[row.key] ?? 0
              const yVal = youH2H[row.key] ?? 0
              const youWin  = row.higher ? yVal >= cVal : yVal <= cVal
              const compWin = !youWin
              const diff = Math.abs(yVal - cVal)
              return (
                <div key={row.key} className={`cp-mrow ${youWin ? 'you-win' : 'comp-win'}`}>
                  <div className={`cp-mrow-val cp-mrow-l ${compWin ? 'c-indigo' : 'c-lose'}`}>
                    {cVal}{row.unit}
                  </div>
                  <div className="cp-mrow-mid">
                    <div className="cp-mrow-name">{row.label}</div>
                    <div className={`cp-rbadge ${youWin ? 'rb-ahead' : 'rb-behind'}`}>
                      {youWin ? `+${diff}${row.unit} ahead` : `-${diff}${row.unit} behind`}
                    </div>
                  </div>
                  <div className={`cp-mrow-val cp-mrow-r ${youWin ? 'c-win' : 'c-lose'}`}>
                    {yVal}{row.unit}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Keyword presence grid */}
        <div className="cp-kp-wrap">
          <div className="cp-shdr">
            <div className="cp-sbar" style={{ background:'var(--indigo,#818cf8)' }}/>
            <h2 className="cp-stitle">Keyword Placement — {comp.domain}</h2>
          </div>
          <div className="cp-kp-grid">
            {[
              { loc:'Title',       compHas: comp.titleHasKw, youHas: a.titleHasKw },
              { loc:'Meta Desc',   compHas: comp.metaHasKw,  youHas: a.metaHasKw  },
              { loc:'H1 Heading',  compHas: comp.h1HasKw,    youHas: a.h1HasKw    },
              { loc:'Alt Text',    compHas: comp.altHasKw,   youHas: a.altHasKw   },
              { loc:'Body',        compHas: comp.bodyHasKw,  youHas: a.bodyHasKw  },
            ].map(cell => (
              <div key={cell.loc} className="cp-kp-cell" style={{
                borderColor: cell.compHas ? 'rgba(52,211,153,.2)' : 'rgba(239,68,68,.15)',
                background:  cell.compHas ? 'rgba(52,211,153,.06)' : 'rgba(239,68,68,.05)',
              }}>
                <div className="cp-kp-loc">{cell.loc}</div>
                <div style={{ fontSize:18 }}>{cell.compHas ? '✓' : '✗'}</div>
                <div className="cp-kp-lbl" style={{ color: cell.compHas ? '#34d399' : '#f87171' }}>
                  {cell.compHas ? 'Has KW' : 'No KW'}
                </div>
                <div className="cp-kp-lbl" style={{ marginTop:4, color: cell.youHas ? 'rgba(45,212,191,.6)' : 'rgba(248,113,113,.5)' }}>
                  you: {cell.youHas ? 'yes' : 'no'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
