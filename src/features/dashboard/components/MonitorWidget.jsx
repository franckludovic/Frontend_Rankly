import { useState, useEffect } from 'react'
import { api } from '../../../shared/services/apiClient.js'

const css = `
.mw{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:22px 24px;margin-bottom:24px;animation:fadeUp .5s .12s ease both;}
.mw-hdr{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
.mw-bar{width:3px;height:17px;background:var(--amber,#fbbf24);border-radius:2px;flex-shrink:0;}
.mw-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:var(--text);}
.mw-badge{background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.2);border-radius:100px;padding:2px 10px;font-family:'DM Mono',monospace;font-size:9px;color:var(--amber,#fbbf24);margin-left:auto;}
.mw-empty{font-family:'DM Mono',monospace;font-size:11px;color:var(--faint);padding:10px 0;}
.mw-list{display:flex;flex-direction:column;gap:7px;}
.mw-row{display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:9px;transition:border-color .15s;}
.mw-row:hover{border-color:var(--border2);}
.mw-domain{font-family:'Syne',sans-serif;font-size:13px;font-weight:600;color:var(--text);min-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.mw-kw{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;}
.mw-checked{font-family:'DM Mono',monospace;font-size:9px;color:var(--faint);flex-shrink:0;}
.mw-rm{padding:4px 10px;border-radius:6px;border:1px solid rgba(239,68,68,.2);background:none;color:rgba(248,113,113,.5);font-family:'DM Mono',monospace;font-size:9px;cursor:pointer;transition:all .15s;flex-shrink:0;}
.mw-rm:hover{border-color:rgba(239,68,68,.4);color:var(--red,#f87171);}
`

function domain(url) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

function relDate(iso) {
  if (!iso) return 'never'
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86400000)
  return d === 0 ? 'today' : d === 1 ? 'yesterday' : `${d}d ago`
}

export default function MonitorWidget() {
  const [watches,  setWatches]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [removing, setRemoving] = useState({})

  useEffect(() => {
    api.listWatches()
      .then(r => setWatches(r.watches || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const remove = async (id) => {
    setRemoving(p => ({ ...p, [id]: true }))
    try {
      await api.removeWatch(id)
      setWatches(w => w.filter(x => x.id !== id))
    } finally {
      setRemoving(p => ({ ...p, [id]: false }))
    }
  }

  if (!loading && watches.length === 0) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="mw">
        <div className="mw-hdr">
          <div className="mw-bar" />
          <span className="mw-title">Competitor Monitor</span>
          <span className="mw-badge">{loading ? '…' : `${watches.length} watching`}</span>
        </div>
        {loading ? (
          <div className="mw-empty">Loading watches…</div>
        ) : watches.length === 0 ? (
          <div className="mw-empty">No competitors being monitored yet- go to a competitor page and click Watch.</div>
        ) : (
          <div className="mw-list">
            {watches.map(w => (
              <div key={w.id} className="mw-row">
                <div className="mw-domain" title={w.competitor_url}>{domain(w.competitor_url)}</div>
                <div className="mw-kw">"{w.keyword}"</div>
                <div className="mw-checked">checked {relDate(w.last_checked_at)}</div>
                <button
                  className="mw-rm"
                  disabled={removing[w.id]}
                  onClick={() => remove(w.id)}
                >
                  {removing[w.id] ? '…' : 'unwatch'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
