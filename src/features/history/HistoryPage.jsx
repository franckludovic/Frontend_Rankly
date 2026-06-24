import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getHistory, deleteAudit } from './services/historyService.js'
import { useAuditStore } from '../../store/auditSlice.js'
import { Search, Trash2, ArrowDown, ArrowUp, FileText } from 'lucide-react'

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;}
.hp{padding:30px 28px 52px;min-width:0;font-family:'Outfit',sans-serif;color:var(--text);}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}

/* header */
.hp-hdr{margin-bottom:24px;animation:fadeUp .5s ease both;}
.hp-eyebrow{display:inline-flex;align-items:center;gap:6px;background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border2,rgba(255,255,255,.12));border-radius:6px;padding:4px 11px;margin-bottom:10px;}
.hp-eyebrow-txt{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.1px;text-transform:uppercase;color:var(--muted,rgba(255,255,255,.4));}
.hp-title{font-family:'Syne',sans-serif;font-size:clamp(18px,2.3vw,26px);font-weight:800;letter-spacing:-.5px;margin-bottom:8px;}

/* stats bar */
.hp-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:22px;animation:fadeUp .5s .05s ease both;}
.hp-stat{background:var(--bg2);border:1px solid var(--border);border-radius:11px;padding:14px 16px;}
.hp-stat-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.7px;color:var(--faint,rgba(255,255,255,.18));margin-bottom:5px;}
.hp-stat-val{font-family:'Syne',sans-serif;font-size:26px;font-weight:700;line-height:1;}
.hp-stat-sub{font-family:'DM Mono',monospace;font-size:8.5px;margin-top:3px;color:var(--muted,rgba(255,255,255,.38));}

/* controls */
.hp-controls{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;animation:fadeUp .5s .08s ease both;}
.hp-search-wrap{display:flex;align-items:center;gap:8px;background:var(--bg-input,rgba(255,255,255,.04));border:1px solid var(--border,rgba(255,255,255,.07));border-radius:9px;padding:0 12px;flex:1;min-width:200px;transition:all .2s;}
.hp-search-wrap:focus-within{border-color:rgba(20,184,166,.35);background:rgba(20,184,166,.04);}
.hp-search{flex:1;background:none;border:none;outline:none;padding:10px 0;font-family:'DM Mono',monospace;font-size:12px;color:var(--text);}
.hp-search::placeholder{color:var(--faint,rgba(255,255,255,.18));}
.hp-sort{background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border,rgba(255,255,255,.07));border-radius:9px;padding:9px 12px;font-family:'DM Mono',monospace;font-size:11px;color:var(--muted,rgba(255,255,255,.4));cursor:pointer;transition:all .15s;}
.hp-sort:hover{border-color:var(--border2,rgba(255,255,255,.12));color:rgba(255,255,255,.7);}
.hp-sort.active{background:var(--teal-d,rgba(20,184,166,.12));border-color:var(--teal-b,rgba(20,184,166,.25));color:var(--teal,#2dd4bf);}

/* filter pills */
.hp-filter-group{display:flex;gap:5px;flex-wrap:wrap;}
.hp-fpill{padding:5px 11px;border-radius:7px;border:1px solid var(--border,rgba(255,255,255,.07));background:none;font-family:'DM Mono',monospace;font-size:10px;color:var(--muted,rgba(255,255,255,.4));cursor:pointer;transition:all .15s;white-space:nowrap;}
.hp-fpill:hover{border-color:var(--border2,rgba(255,255,255,.12));color:rgba(255,255,255,.7);}
.hp-fpill.active.all{background:rgba(255,255,255,.06);border-color:var(--border2,rgba(255,255,255,.12));color:white;}
.hp-fpill.active.high{background:var(--green-d,rgba(52,211,153,.08));border-color:var(--green-b,rgba(52,211,153,.2));color:var(--green,#34d399);}
.hp-fpill.active.medium{background:var(--amber-d,rgba(245,158,11,.1));border-color:var(--amber-b,rgba(245,158,11,.22));color:var(--amber,#fbbf24);}
.hp-fpill.active.low{background:var(--red-d,rgba(239,68,68,.08));border-color:var(--red-b,rgba(239,68,68,.2));color:var(--red,#f87171);}

/* table */
.hp-table{background:var(--bg2);border:1px solid var(--border);border-radius:13px;overflow:hidden;animation:fadeUp .5s .12s ease both;}
.hp-thead{display:grid;grid-template-columns:2fr 2fr 80px 80px 80px 44px;padding:10px 16px;border-bottom:1px solid var(--border,rgba(255,255,255,.07));background:rgba(255,255,255,.015);}
.hp-th{font-family:'DM Mono',monospace;font-size:8.5px;text-transform:uppercase;letter-spacing:.6px;color:var(--faint,rgba(255,255,255,.18));font-weight:500;}
.hp-row{display:grid;grid-template-columns:2fr 2fr 80px 80px 80px 44px;padding:14px 16px;border-bottom:1px solid var(--border,rgba(255,255,255,.07));align-items:center;cursor:pointer;transition:all .2s;}
.hp-row:last-child{border-bottom:none;}
.hp-row:hover{background:var(--bg-hover);}
.hp-url{font-family:'DM Mono',monospace;font-size:12px;font-weight:500;color:var(--teal,#2dd4bf);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:12px;}
.hp-kw{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted,rgba(255,255,255,.38));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:8px;}
.hp-badge{font-family:'DM Mono',monospace;font-size:9px;font-weight:600;letter-spacing:.5px;padding:3px 7px;border-radius:5px;}
.hp-badge.high{background:rgba(52,211,153,.12);color:#34d399;border:1px solid rgba(52,211,153,.22);}
.hp-badge.medium{background:rgba(245,158,11,.12);color:#fbbf24;border:1px solid rgba(245,158,11,.22);}
.hp-badge.low{background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.22);}
.hp-rank{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:var(--indigo,#818cf8);}
.hp-time{font-family:'DM Mono',monospace;font-size:10px;color:var(--faint,rgba(255,255,255,.18));}
.hp-del-btn{width:28px;height:28px;background:none;border:1px solid transparent;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--faint,rgba(255,255,255,.18));transition:all .15s;}
.hp-del-btn:hover{background:var(--red-d,rgba(239,68,68,.08));border-color:var(--red-b,rgba(239,68,68,.18));color:var(--red,#f87171);}

/* empty */
.hp-empty{text-align:center;padding:60px 24px;}
.hp-empty-icon{font-size:40px;margin-bottom:14px;}
.hp-empty-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:var(--text,white);margin-bottom:8px;}
.hp-empty-sub{font-family:'Outfit',sans-serif;font-size:13px;color:var(--muted,rgba(255,255,255,.35));max-width:320px;margin:0 auto 20px;}
.hp-empty-btn{padding:11px 22px;background:var(--teal-d,rgba(20,184,166,.12));border:1px solid var(--teal-b,rgba(20,184,166,.25));color:var(--teal,#2dd4bf);border-radius:9px;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;}
.hp-empty-btn:hover{background:rgba(20,184,166,.2);}

.hp-loading{display:flex;align-items:center;justify-content:center;padding:60px;gap:14px;font-family:'DM Mono',monospace;font-size:12px;color:var(--muted,rgba(255,255,255,.38));}
.hp-spin{width:24px;height:24px;border:2px solid rgba(255,255,255,.08);border-top-color:var(--teal,#2dd4bf);border-radius:50%;animation:spin 1s linear infinite;}

@media(max-width:900px){.hp-thead,.hp-row{grid-template-columns:2fr 2fr 70px 60px 36px;}.hp-rank{display:none;}}
@media(max-width:640px){.hp{padding:20px 16px 40px;}.hp-stats{grid-template-columns:1fr 1fr;}.hp-thead,.hp-row{grid-template-columns:1fr 80px 36px;}.hp-kw{display:none;}.hp-time{display:none;}}
`

function timeAgo(isoStr) {
  const s = Math.floor((Date.now() - new Date(isoStr)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

export default function HistoryPage() {
  const navigate     = useNavigate()
  const setAudit     = useAuditStore(s => s.setAudit)
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('all')
  const [sortDesc, setSortDesc] = useState(true)

  useEffect(() => {
    getHistory()
      .then(setAudits)
      .catch(() => setAudits([]))
      .finally(() => setLoading(false))
  }, [])

  const handleOpen = (audit) => {
    setAudit(audit)
    navigate(`/audit/${audit.id}`)
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    await deleteAudit(id)
    setAudits(prev => prev.filter(a => a.id !== id))
  }

  const filtered = audits
    .filter(a => {
      const q = search.toLowerCase()
      if (!a.url.toLowerCase().includes(q) && !a.keyword.toLowerCase().includes(q)) return false
      if (filter === 'all') return true
      return a.quality.toLowerCase() === filter
    })
    .sort((a, b) => sortDesc
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt)
    )

  const high   = audits.filter(a => a.quality === 'HIGH').length
  const medium = audits.filter(a => a.quality === 'MEDIUM').length
  const low    = audits.filter(a => a.quality === 'LOW').length

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="hp">
        {/* Header */}
        <div className="hp-hdr">
          <div className="hp-eyebrow"><span className="hp-eyebrow-txt">Audit History</span></div>
          <h1 className="hp-title" style={{ fontFamily:"'Syne',sans-serif" }}>All Past Audits</h1>
        </div>

        {/* Stats */}
        <div className="hp-stats">
          <div className="hp-stat">
            <div className="hp-stat-lbl">Total Audits</div>
            <div className="hp-stat-val">{audits.length}</div>
            <div className="hp-stat-sub">across all domains</div>
          </div>
          <div className="hp-stat">
            <div className="hp-stat-lbl">High Quality</div>
            <div className="hp-stat-val" style={{ color:'var(--green,#34d399)' }}>{high}</div>
            <div className="hp-stat-sub">{audits.length ? Math.round(high/audits.length*100) : 0}% of total</div>
          </div>
          <div className="hp-stat">
            <div className="hp-stat-lbl">Need Improvement</div>
            <div className="hp-stat-val" style={{ color:'var(--red,#f87171)' }}>{low}</div>
            <div className="hp-stat-sub">{medium} medium quality</div>
          </div>
        </div>

        {/* Controls */}
        <div className="hp-controls">
          <div className="hp-search-wrap">
            <Search size={13} strokeWidth={1.8} color="rgba(255,255,255,.25)" />
            <input
              className="hp-search"
              placeholder="Search by URL or keyword…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="hp-filter-group">
            {['all','high','medium','low'].map(f => (
              <button key={f} className={`hp-fpill ${f}${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
          <button className={`hp-sort${sortDesc ? '' : ' active'}`} onClick={() => setSortDesc(p => !p)}>
            {sortDesc ? <><ArrowDown size={11} strokeWidth={1.8} /> Newest first</> : <><ArrowUp size={11} strokeWidth={1.8} /> Oldest first</>}
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="hp-loading"><div className="hp-spin"/><span>Loading history…</span></div>
        ) : filtered.length === 0 ? (
          <div className="hp-empty">
            <div className="hp-empty-icon"><FileText size={40} strokeWidth={1.4} /></div>
            <div className="hp-empty-title">{search || filter !== 'all' ? 'No matching audits' : 'No audits yet'}</div>
            <div className="hp-empty-sub">
              {search || filter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Run your first audit from the dashboard and it will appear here.'}
            </div>
            <button className="hp-empty-btn" onClick={() => navigate('/dashboard')}>
              Run Your First Audit
            </button>
          </div>
        ) : (
          <div className="hp-table">
            <div className="hp-thead">
              <div className="hp-th">URL</div>
              <div className="hp-th">Keyword</div>
              <div className="hp-th">Quality</div>
              <div className="hp-th">Rank Est.</div>
              <div className="hp-th">Date</div>
              <div className="hp-th"></div>
            </div>
            {filtered.map(audit => (
              <div key={audit.id} className="hp-row" onClick={() => handleOpen(audit)}>
                <div className="hp-url">{audit.url}</div>
                <div className="hp-kw">{audit.keyword}</div>
                <div><span className={`hp-badge ${(audit.quality||'LOW').toLowerCase()}`}>{audit.quality}</span></div>
                <div className="hp-rank">#{audit.predictedRank}</div>
                <div className="hp-time">{timeAgo(audit.createdAt)}</div>
                <div>
                  <button className="hp-del-btn" onClick={e => handleDelete(e, audit.id)} title="Delete">
                    <Trash2 size={11} strokeWidth={2.5} />
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
