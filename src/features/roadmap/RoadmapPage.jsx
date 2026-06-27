import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAudit } from '../../store/auditSlice.js'
import { getAudit } from '../audit/services/auditService.js'
import { updateTaskStatus } from './services/roadmapService.js'
import { Check, ArrowRight, Clock, Globe, Search } from 'lucide-react'

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;}
.rp{padding:30px 28px 52px;min-width:0;font-family:'Outfit',sans-serif;color:var(--text);}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
.rp-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:18px;}
.rp-spin{width:44px;height:44px;border:3px solid var(--border);border-top-color:var(--teal,#2dd4bf);border-radius:50%;animation:spin 1s linear infinite;}

/* header */
.rp-hdr{margin-bottom:24px;animation:fadeUp .5s ease both;}
.rp-eyebrow{display:inline-flex;align-items:center;gap:6px;background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border2,rgba(255,255,255,.12));border-radius:6px;padding:4px 11px;margin-bottom:10px;}
.rp-eyebrow-txt{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.1px;text-transform:uppercase;color:var(--muted,rgba(255,255,255,.4));}
.rp-title{font-family:'Syne',sans-serif;font-size:clamp(18px,2.3vw,26px);font-weight:800;letter-spacing:-.5px;margin-bottom:8px;}
.rp-title em{color:var(--teal,#2dd4bf);font-style:normal;}
.rp-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.rp-chip{display:inline-flex;align-items:center;gap:6px;background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border,rgba(255,255,255,.07));border-radius:7px;padding:5px 11px;font-family:'DM Mono',monospace;font-size:11px;color:var(--muted,rgba(255,255,255,.4));}
.rp-chip b{color:var(--text);font-weight:500;}

/* progress banner */
.rp-banner{background:var(--bg2);border:1px solid var(--border);border-radius:13px;padding:20px 22px;margin-bottom:18px;animation:fadeUp .5s .05s ease both;}
.rp-b-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px;flex-wrap:wrap;}
.rp-b-hl{font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:6px;}
.rp-b-rank-row{display:flex;align-items:center;gap:10px;}
.rp-rank-from{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:var(--muted);line-height:1;}
.rp-rank-to{font-family:'Syne',sans-serif;font-size:36px;font-weight:800;line-height:1;transition:all .4s;}
.rp-rank-note{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);margin-top:3px;}
.rp-b-stats{display:flex;gap:20px;flex-wrap:wrap;}
.rp-b-stat{text-align:center;}
.rp-b-stat-val{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;line-height:1;}
.rp-b-stat-lbl{font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-top:2px;}
.rp-bar-hdr{display:flex;justify-content:space-between;margin-bottom:6px;}
.rp-bar-lbl{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);}
.rp-bar-pct{font-family:'DM Mono',monospace;font-size:10px;color:var(--teal,#2dd4bf);}
.rp-track{height:6px;background:var(--border2);border-radius:3px;overflow:hidden;}
.rp-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#0d9488,#2dd4bf);transition:width .5s;}
.rp-disclaimer{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);margin-top:8px;}

/* summary cards */
.rp-sum-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;animation:fadeUp .5s .08s ease both;}
.rp-sum{background:var(--bg2);border:1px solid var(--border);border-radius:11px;padding:14px 16px;}
.rp-sum-lbl{font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:5px;}
.rp-sum-val{font-family:'Syne',sans-serif;font-size:24px;font-weight:700;line-height:1;}
.rp-sum-sub{font-family:'DM Mono',monospace;font-size:10px;margin-top:3px;color:var(--muted);}

/* filter bar */
.rp-filters{display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap;animation:fadeUp .5s .11s ease both;}
.rp-fbtn{padding:5px 11px;border-radius:7px;border:1px solid var(--border);background:none;font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);cursor:pointer;transition:all .15s;white-space:nowrap;}
.rp-fbtn:hover{border-color:var(--border2);color:var(--text);}
.rp-fbtn.active{font-weight:500;}
.rp-fbtn.f-all.active{background:var(--bg-hover);border-color:var(--border2);color:var(--text);}
.rp-fbtn.f-todo.active{background:var(--red-d);border-color:var(--red-b);color:var(--red);}
.rp-fbtn.f-prog.active{background:var(--amber-d);border-color:var(--amber-b);color:var(--amber);}
.rp-fbtn.f-done.active{background:var(--green-d);border-color:var(--green-b);color:var(--green);}
.rp-fbtn.f-cat.active{background:var(--indigo-d);border-color:var(--indigo-b);color:var(--indigo);}
.rp-fsep{width:1px;height:20px;background:var(--border);margin:0 4px;flex-shrink:0;}

/* task list */
.rp-tasks{display:flex;flex-direction:column;gap:8px;animation:fadeUp .5s .14s ease both;}
.rp-task{display:grid;grid-template-columns:44px 1fr auto;gap:0;border-radius:12px;border:1px solid var(--border);background:var(--bg3);overflow:hidden;transition:all .2s;}
.rp-task:hover{background:var(--bg-hover);border-color:var(--border2);}
.rp-task.done{opacity:.55;}
.rp-task.done:hover{opacity:.7;}
.rp-accent{width:44px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:18px;gap:6px;flex-shrink:0;}
.rp-ppip{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.rp-status-btn{width:28px;height:28px;border-radius:50%;border:2px solid;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;}
.rp-status-btn.todo{border-color:var(--border2);}
.rp-status-btn.todo:hover{border-color:var(--amber);background:var(--amber-d);}
.rp-status-btn.progress{border-color:var(--amber);background:var(--amber-d);}
.rp-status-btn.done{border-color:var(--green);background:var(--green-d);}
.rp-body{padding:15px 14px 15px 0;min-width:0;}
.rp-body-top{display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;}
.rp-task-title{font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;color:var(--text);line-height:1.35;}
.rp-task.done .rp-task-title{text-decoration:line-through;color:var(--muted);}
.rp-task-desc{font-family:'Outfit',sans-serif;font-size:12.5px;color:var(--muted);line-height:1.55;margin-bottom:8px;}
.rp-tags{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.rp-tag{font-family:'DM Mono',monospace;font-size:9px;padding:2px 7px;border-radius:4px;border:1px solid;white-space:nowrap;}
.tag-content  {color:#a855f7;border-color:rgba(168,85,247,.3);background:rgba(168,85,247,.08);}
.tag-metadata {color:#818cf8;border-color:rgba(129,140,248,.3);background:rgba(129,140,248,.08);}
.tag-technical{color:#0d9488;border-color:rgba(45,212,191,.3);background:rgba(20,184,166,.08);}
.tag-structure{color:#b45309;border-color:rgba(251,191,36,.3);background:rgba(245,158,11,.08);}
.tag-links    {color:#047857;border-color:rgba(52,211,153,.3);background:rgba(52,211,153,.08);}
.tag-easy   {color:#047857;border-color:rgba(52,211,153,.25);background:rgba(52,211,153,.06);}
.tag-medium {color:#b45309;border-color:rgba(251,191,36,.25);background:rgba(245,158,11,.06);}
.tag-hard   {color:#dc2626;border-color:rgba(248,113,113,.25);background:rgba(239,68,68,.06);}
.rp-pri-badge{font-family:'DM Mono',monospace;font-size:9px;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:.3px;font-weight:500;white-space:nowrap;}
.pri-critical{background:var(--red-d);color:var(--red);border:1px solid var(--red-b);}
.pri-high    {background:var(--amber-d);color:var(--amber);border:1px solid var(--amber-b);}
.pri-medium  {background:var(--indigo-d);color:var(--indigo);border:1px solid var(--indigo-b);}
.pri-low     {background:var(--bg3);color:var(--muted);border:1px solid var(--border);}
.rp-right{padding:15px 16px 15px 10px;display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;gap:8px;flex-shrink:0;min-width:110px;}
.rp-impact-lbl{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);}
.rp-impact-val{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;line-height:1;text-align:right;}
.rp-bar-mini{width:72px;height:4px;background:var(--border2);border-radius:2px;overflow:hidden;}
.rp-bar-mini-fill{height:100%;border-radius:2px;}
.rp-effort-note{font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);text-align:right;}
.rp-status-txt{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.4px;}
.rp-status-txt.todo{color:var(--muted);}.rp-status-txt.progress{color:var(--amber);}.rp-status-txt.done{color:var(--green);}
.rp-empty{text-align:center;padding:40px 20px;color:var(--muted);font-family:'DM Mono',monospace;font-size:12px;}

/* schema card */
.rp-schema-card{background:var(--bg2);border:1px solid var(--border);border-radius:13px;padding:18px 20px;margin-bottom:18px;animation:fadeUp .5s .09s ease both;}
.rp-schema-hdr{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap;}
.rp-schema-title-row{display:flex;align-items:center;gap:9px;}
.rp-schema-bar{width:3px;height:17px;border-radius:2px;background:var(--green,#34d399);flex-shrink:0;}
.rp-schema-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;}
.rp-schema-type{font-family:'DM Mono',monospace;font-size:8px;padding:2px 8px;border-radius:4px;background:rgba(52,211,153,.1);color:#34d399;border:1px solid rgba(52,211,153,.25);text-transform:uppercase;letter-spacing:.4px;}
.rp-schema-desc{font-family:'Outfit',sans-serif;font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:12px;}
.rp-schema-desc em{color:var(--text);font-style:normal;}
.rp-schema-code-wrap{position:relative;}
.rp-schema-code{background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.07);border-radius:9px;padding:14px 16px;font-family:'DM Mono',monospace;font-size:11px;color:rgba(255,255,255,.72);line-height:1.7;overflow-x:auto;white-space:pre;max-height:280px;overflow-y:auto;}
.rp-schema-code::-webkit-scrollbar{width:4px;height:4px;}
.rp-schema-code::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:2px;}
.rp-copy-btn{position:absolute;top:10px;right:10px;padding:4px 10px;border-radius:6px;border:1px solid var(--border2,rgba(255,255,255,.12));background:var(--bg3,rgba(255,255,255,.03));font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);cursor:pointer;transition:all .2s;letter-spacing:.3px;white-space:nowrap;}
.rp-copy-btn:hover{border-color:var(--teal-b,rgba(20,184,166,.25));color:var(--teal,#2dd4bf);background:var(--teal-d,rgba(20,184,166,.08));}
.rp-copy-btn.copied{border-color:var(--green-b,rgba(52,211,153,.25));color:var(--green,#34d399);background:rgba(52,211,153,.08);}
.rp-schema-hint{font-family:'DM Mono',monospace;font-size:9px;color:var(--faint,rgba(255,255,255,.18));margin-top:8px;}

@media(max-width:1000px){.rp-sum-row{grid-template-columns:repeat(2,1fr);}.rp-task{grid-template-columns:36px 1fr auto;}.rp-right{min-width:90px;}}
@media(max-width:760px){.rp{padding:20px 16px 40px;}.rp-right{display:none;}.rp-task{grid-template-columns:36px 1fr;}.rp-sum-row{grid-template-columns:1fr 1fr;}}
@media(max-width:480px){.rp-sum-row{grid-template-columns:1fr 1fr;}}
`

const PRIORITIES = { critical:'var(--red,#f87171)', high:'var(--amber,#fbbf24)', medium:'var(--indigo,#818cf8)', low:'var(--border2)' }
const STATUS_CYCLE = { todo: 'in_progress', in_progress: 'done', done: 'todo' }
const statusCls   = s => s === 'in_progress' ? 'progress' : s  // CSS class uses shorter name
const CATS = ['All','Metadata','Content','Technical','Structure','Links']

export default function RoadmapPage() {
  const { id }                     = useParams()
  const navigate                   = useNavigate()
  const { currentAudit, isLoading, setAudit } = useAudit()
  const [statusFilter, setStatusF] = useState('all')
  const [catFilter,    setCatF]    = useState('All')
  const [saving, setSaving]        = useState(null)
  const [copied, setCopied]        = useState(false)

  const copySchema = useCallback(() => {
    const gs = currentAudit?.generatedSchema
    const text = gs?.script_tag || gs?.json_ld || ''
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [currentAudit])

  useEffect(() => {
    if (!currentAudit || currentAudit.id !== id) {
      getAudit(id).then(setAudit).catch(() => navigate('/dashboard'))
    }
  }, [id])

  if (isLoading || !currentAudit || currentAudit.id !== id) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className="rp"><div className="rp-loading"><div className="rp-spin"/></div></div>
      </>
    )
  }

  const a       = currentAudit
  const tasks   = a.roadmapTasks || []
  const done    = tasks.filter(t => t.status === 'done').length
  const inProg  = tasks.filter(t => t.status === 'in_progress').length
  const todo    = tasks.filter(t => t.status === 'todo').length
  const pct     = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  /* Model-backed SEO-score projection: sum of per-fix predicted point gains.
     (Rank is intentionally not projected here- the regressor is driven by
     off-page signals, so on-page fixes barely move predicted position.) */
  const sumDelta = (list) => list.reduce((acc, t) => acc + (t.scoreDelta || 0), 0)
  const baseScore     = Math.round(a.seoScore || 0)
  const scoreGainDone = sumDelta(tasks.filter(t => t.status === 'done'))
  const scoreGainAll  = sumDelta(tasks)
  const projScore     = Math.min(100, Math.round(baseScore + scoreGainDone))
  const maxProjScore  = Math.min(100, Math.round(baseScore + scoreGainAll))

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const matchStatus = statusFilter === 'all' || t.status === statusFilter
      const matchCat    = catFilter === 'All' || t.category === catFilter
      return matchStatus && matchCat
    })
  }, [tasks, statusFilter, catFilter])

  const cycleStatus = async (task) => {
    if (saving) return
    const next = STATUS_CYCLE[task.status] || 'todo'
    setSaving(task.id)
    try {
      await updateTaskStatus(a.id, task.id, next)
    } finally {
      setSaving(null)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="rp">
        {/* Header */}
        <div className="rp-hdr">
          <div className="rp-eyebrow"><span className="rp-eyebrow-txt">Optimization Roadmap</span></div>
          <h1 className="rp-title">Your path to ranking for <em>{a.keyword}</em></h1>
          <div className="rp-meta">
            <div className="rp-chip"><Search size={11} strokeWidth={1.8} style={{opacity:.5}} /><span><b>{a.keyword}</b></span></div>
            <div className="rp-chip"><Globe size={11} strokeWidth={1.8} style={{opacity:.5}} /><span><b>{a.url}</b></span></div>
          </div>
        </div>

        {/* Progress banner */}
        <div className="rp-banner">
          <div className="rp-b-top">
            <div>
              <div className="rp-b-hl">Predicted SEO Score</div>
              <div className="rp-b-rank-row">
                <span className="rp-rank-from">{baseScore}</span>
                <ArrowRight size={18} strokeWidth={1.5} style={{color:'var(--faint)'}} />
                <span className="rp-rank-to" style={{ color: projScore >= 70 ? 'var(--green,#34d399)' : projScore >= 40 ? 'var(--teal,#2dd4bf)' : 'var(--indigo,#818cf8)' }}>
                  {projScore}
                </span>
              </div>
              <div className="rp-rank-note">
                {scoreGainDone > 0 ? `+${scoreGainDone.toFixed(1)} pts from completed tasks · ` : ''}up to {maxProjScore} if all done
              </div>
            </div>
            <div className="rp-b-stats">
              <div className="rp-b-stat">
                <div className="rp-b-stat-val" style={{ color:'var(--green,#34d399)' }}>{done}</div>
                <div className="rp-b-stat-lbl">Completed</div>
              </div>
              <div className="rp-b-stat">
                <div className="rp-b-stat-val" style={{ color:'var(--amber,#fbbf24)' }}>{inProg}</div>
                <div className="rp-b-stat-lbl">In Progress</div>
              </div>
              <div className="rp-b-stat">
                <div className="rp-b-stat-val" style={{ color:'var(--muted)' }}>{todo}</div>
                <div className="rp-b-stat-lbl">To Do</div>
              </div>
            </div>
          </div>
          <div className="rp-bar-hdr">
            <span className="rp-bar-lbl">Overall Progress</span>
            <span className="rp-bar-pct">{pct}%</span>
          </div>
          <div className="rp-track"><div className="rp-fill" style={{ width:`${pct}%` }}/></div>
          <div className="rp-disclaimer">* Position estimates are projections based on ML signals, not guarantees.</div>
        </div>

        {/* Summary cards */}
        <div className="rp-sum-row">
          {[
            { lbl:'Total Tasks',   val: tasks.length,    sub:'in your roadmap',     color:'var(--text,rgba(255,255,255,.88))' },
            { lbl:'Quick Wins',    val: tasks.filter(t=>t.effort==='Easy').length, sub:'easy effort', color:'var(--green,#34d399)' },
            { lbl:'Score Gain Est.',val: `+${scoreGainAll.toFixed(1)}`, sub:'points possible', color:'var(--teal,#2dd4bf)' },
            { lbl:'Critical',      val: tasks.filter(t=>t.priority==='critical').length, sub:'high-priority fixes', color:'var(--red,#f87171)' },
          ].map(s => (
            <div key={s.lbl} className="rp-sum">
              <div className="rp-sum-lbl">{s.lbl}</div>
              <div className="rp-sum-val" style={{ color: s.color }}>{s.val}</div>
              <div className="rp-sum-sub" style={{ color:'var(--muted,rgba(255,255,255,.38))' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Generated Schema Card- shown when page has no schema and we detected a type */}
        {a.generatedSchema && !a.hasSchema && (
          <div className="rp-schema-card">
            <div className="rp-schema-hdr">
              <div className="rp-schema-title-row">
                <div className="rp-schema-bar"/>
                <span className="rp-schema-title">Generated Schema Markup</span>
                <span className="rp-schema-type">{a.generatedSchema.type}</span>
              </div>
            </div>
            <p className="rp-schema-desc">
              Your page has no structured data. Paste this <em>{a.generatedSchema.type}</em> schema into your{' '}
              <em>{'<head>'}</em>. Replace <em>{'<!-- ... -->'}</em> comments with your real values.
            </p>
            <div className="rp-schema-code-wrap">
              <pre className="rp-schema-code">{`<script type="application/ld+json">\n${a.generatedSchema.json_ld}\n</script>`}</pre>
              <button className={`rp-copy-btn${copied ? ' copied' : ''}`} onClick={copySchema}>
                {copied ? <><Check size={12} strokeWidth={2} /> COPIED</> : 'COPY'}
              </button>
            </div>
            <div className="rp-schema-hint">
              Fields marked with comments are placeholders- fill them in before publishing.
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="rp-filters">
          {[
            { label:'All',         cls:'f-all',  val:'all'      },
            { label:'To Do',       cls:'f-todo', val:'todo'     },
            { label:'In Progress', cls:'f-prog', val:'in_progress' },
            { label:'Done',        cls:'f-done', val:'done'     },
          ].map(f => (
            <button key={f.val} className={`rp-fbtn ${f.cls}${statusFilter === f.val ? ' active' : ''}`} onClick={() => setStatusF(f.val)}>
              {f.label}
            </button>
          ))}
          <div className="rp-fsep"/>
          {CATS.map(cat => (
            <button key={cat} className={`rp-fbtn f-cat${catFilter === cat ? ' active' : ''}`} onClick={() => setCatF(cat)}>
              {cat}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="rp-tasks">
          {filtered.length === 0
            ? <div className="rp-empty">No tasks match your current filters.</div>
            : filtered.map(task => (
              <div key={task.id} className={`rp-task${task.status === 'done' ? ' done' : ''}`}>
                {/* Accent */}
                <div className="rp-accent">
                  <div className="rp-ppip" style={{ background: PRIORITIES[task.priority] || '#fff' }}/>
                  <button
                    className={`rp-status-btn ${statusCls(task.status)}`}
                    onClick={() => cycleStatus(task)}
                    disabled={saving === task.id}
                    title={`Click to mark as ${STATUS_CYCLE[task.status] || 'todo'}`}
                  >
                    {task.status === 'done' && (
                      <Check size={11} strokeWidth={3} color="var(--green,#34d399)" />
                    )}
                    {task.status === 'in_progress' && (
                      <div style={{ width:7,height:7,borderRadius:2,background:'var(--amber,#fbbf24)' }}/>
                    )}
                  </button>
                  <span className={`rp-status-txt ${statusCls(task.status)}`}>
                    {task.status === 'todo' ? 'todo' : task.status === 'in_progress' ? 'wip' : 'done'}
                  </span>
                </div>

                {/* Body */}
                <div className="rp-body">
                  <div className="rp-body-top">
                    <span className={`rp-pri-badge pri-${task.priority}`}>{task.priority}</span>
                    <h3 className="rp-task-title">{task.title}</h3>
                  </div>
                  <p className="rp-task-desc">{task.desc}</p>
                  {task.competitiveGap && (
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', margin:'0 0 9px', fontFamily:"'DM Mono',monospace", fontSize:10.5, color:'var(--muted)' }}>
                      <span style={{ color:'var(--teal,#2dd4bf)', textTransform:'uppercase', letterSpacing:'.4px', fontSize:9 }}>vs competitors</span>
                      <span>{task.competitiveGap.label}: <b style={{ color:'var(--text)' }}>{Number(task.competitiveGap.your_value).toLocaleString()}</b> → <b style={{ color:'var(--teal,#2dd4bf)' }}>{Number(task.competitiveGap.target_value).toLocaleString()}</b></span>
                      <span style={{ opacity:.7 }}>· their average {Number(task.competitiveGap.competitor_avg).toLocaleString()}</span>
                      <span style={{ opacity:.7 }}>· ahead of {Math.round(task.competitiveGap.percentile_before)}% → {Math.round(task.competitiveGap.percentile_after)}% of them</span>
                    </div>
                  )}
                  <div className="rp-tags">
                    <span className={`rp-tag tag-${task.category.toLowerCase()}`}>{task.category}</span>
                    <span className={`rp-tag tag-${task.effort.toLowerCase()}`}>{task.effort} effort</span>
                    <span className="rp-tag" style={{ color:'var(--muted)',borderColor:'var(--border)',background:'transparent', display:'inline-flex', alignItems:'center', gap:4 }}>
                      <Clock size={11} strokeWidth={1.8} /> {task.time}
                    </span>
                  </div>
                </div>

                {/* Right */}
                <div className="rp-right">
                  <div>
                    <div className="rp-impact-lbl">Score gain</div>
                    <div className="rp-impact-val" style={{ color: task.impactPct >= 70 ? 'var(--red,#f87171)' : task.impactPct >= 40 ? 'var(--amber,#fbbf24)' : 'var(--muted,rgba(255,255,255,.4))' }}>
                      {task.scoreDelta != null ? `+${task.scoreDelta.toFixed(1)} pts` : `+${task.impactPct}%`}
                    </div>
                  </div>
                  <div>
                    <div className="rp-bar-mini">
                      <div className="rp-bar-mini-fill" style={{
                        width:`${task.impactPct}%`,
                        background: task.impactPct >= 70 ? 'linear-gradient(90deg,#ef4444,#f87171)' : task.impactPct >= 40 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'rgba(255,255,255,.2)'
                      }}/>
                    </div>
                    <div className="rp-effort-note">{task.scoreDelta != null ? 'predicted score gain' : 'relative impact'}</div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </>
  )
}
