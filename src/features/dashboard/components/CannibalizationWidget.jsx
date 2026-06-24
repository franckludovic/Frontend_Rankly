import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../shared/services/apiClient.js'
import { AlertTriangle, Check, ChevronDown } from 'lucide-react'

const css = `
.cw{background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border,rgba(255,255,255,.07));border-radius:13px;padding:20px 22px;animation:fadeUp .5s ease both;}
.cw.warn{border-color:var(--amber-b,rgba(245,158,11,.22));background:rgba(245,158,11,.04);}
.cw.ok{border-color:var(--green-b,rgba(16,185,129,.2));background:rgba(16,185,129,.03);}

.cw-hdr{display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none;}
.cw-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.cw-icon.warn{background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.2);}
.cw-icon.ok{background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.18);}
.cw-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:600;color:var(--text);flex:1;}
.cw-badge{font-family:'DM Mono',monospace;font-size:10px;font-weight:600;letter-spacing:.6px;padding:2px 8px;border-radius:5px;}
.cw-badge.warn{background:rgba(245,158,11,.12);color:var(--amber,#f59e0b);border:1px solid rgba(245,158,11,.22);}
.cw-badge.ok{background:rgba(16,185,129,.1);color:var(--green,#10b981);border:1px solid rgba(16,185,129,.2);}
.cw-chevron{color:var(--muted);transition:transform .2s;flex-shrink:0;}
.cw-chevron.open{transform:rotate(180deg);}
.cw-sub{font-family:'DM Mono',monospace;font-size:10.5px;color:var(--muted);margin-top:2px;}

.cw-body{margin-top:16px;display:flex;flex-direction:column;gap:12px;}
.cw-conflict{background:var(--bg-input,rgba(255,255,255,.04));border:1px solid var(--border,rgba(255,255,255,.07));border-radius:9px;padding:14px 16px;}
.cw-kw{font-family:'DM Mono',monospace;font-size:11px;color:var(--teal,#2dd4bf);background:rgba(45,212,191,.07);border:1px solid rgba(45,212,191,.15);border-radius:5px;display:inline-block;padding:2px 8px;margin-bottom:10px;}
.cw-pages{display:flex;flex-direction:column;gap:6px;}
.cw-page{display:flex;align-items:center;gap:8px;}
.cw-pg-url{font-family:'DM Mono',monospace;font-size:11px;color:var(--text);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;transition:color .15s;}
.cw-pg-url:hover{color:var(--teal,#2dd4bf);text-decoration:underline;}
.cw-pg-badge{font-family:'DM Mono',monospace;font-size:9.5px;font-weight:600;letter-spacing:.5px;padding:2px 6px;border-radius:4px;flex-shrink:0;}
.cw-pg-badge.high{background:var(--green-d,rgba(16,185,129,.1));color:var(--green,#10b981);border:1px solid var(--green-b,rgba(16,185,129,.2));}
.cw-pg-badge.medium{background:var(--amber-d,rgba(245,158,11,.1));color:var(--amber,#f59e0b);border:1px solid var(--amber-b,rgba(245,158,11,.2));}
.cw-pg-badge.low{background:var(--red-d,rgba(239,68,68,.1));color:var(--red,#f87171);border:1px solid var(--red-b,rgba(239,68,68,.2));}
.cw-pg-badge.unknown{background:rgba(255,255,255,.05);color:var(--muted);border:1px solid var(--border);}
.cw-winner-dot{width:6px;height:6px;border-radius:50%;background:var(--green,#10b981);flex-shrink:0;}
.cw-loser-dot{width:6px;height:6px;border-radius:50%;background:var(--border,rgba(255,255,255,.12));flex-shrink:0;}
.cw-rec{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);margin-top:10px;padding-top:10px;border-top:1px solid var(--border,rgba(255,255,255,.06));line-height:1.5;}
.cw-rec strong{color:var(--amber,#f59e0b);}
`

const QUALITY_RANK = { High: 0, MEDIUM: 1, Medium: 1, LOW: 2, Low: 2 }

function qualityClass(q = '') {
  const m = { High: 'high', HIGH: 'high', Medium: 'medium', MEDIUM: 'medium', Low: 'low', LOW: 'low' }
  return m[q] || 'unknown'
}

function shortUrl(url = '') {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').slice(0, 55)
}

export default function CannibalizationWidget() {
  const navigate = useNavigate()
  const [conflicts, setConflicts] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [open,      setOpen]      = useState(false)

  useEffect(() => {
    api.getCannibalization()
      .then(r => {
        setConflicts(r.conflicts || [])
        if ((r.conflicts || []).length > 0) setOpen(true)
      })
      .catch(() => setConflicts([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  const hasConflicts = conflicts.length > 0
  const tone = hasConflicts ? 'warn' : 'ok'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className={`cw ${tone}`}>
        <div className="cw-hdr" onClick={() => setOpen(o => !o)}>
          <div className={`cw-icon ${tone}`}>
            {hasConflicts
              ? <AlertTriangle size={15} strokeWidth={2.2} color="#f59e0b" />
              : <Check size={15} strokeWidth={2.2} color="#10b981" />
            }
          </div>
          <div>
            <div className="cw-title">Keyword Cannibalization</div>
            <div className="cw-sub">
              {hasConflicts
                ? `${conflicts.length} keyword conflict${conflicts.length > 1 ? 's' : ''} detected`
                : 'No conflicts detected'}
            </div>
          </div>
          <span className={`cw-badge ${tone}`}>
            {hasConflicts ? `${conflicts.length} CONFLICT${conflicts.length > 1 ? 'S' : ''}` : 'CLEAN'}
          </span>
          {hasConflicts && (
            <ChevronDown size={14} strokeWidth={2} className={`cw-chevron ${open ? 'open' : ''}`} />
          )}
        </div>

        {open && hasConflicts && (
          <div className="cw-body">
            {conflicts.map((c, ci) => (
              <div key={ci} className="cw-conflict">
                <div className="cw-kw">{c.keyword}</div>
                <div className="cw-pages">
                  {c.pages.map((p, pi) => (
                    <div key={p.id} className="cw-page">
                      {pi === 0
                        ? <div className="cw-winner-dot" title="Best performing page" />
                        : <div className="cw-loser-dot" />
                      }
                      <span
                        className="cw-pg-url"
                        onClick={() => navigate(`/audit/${p.id}`)}
                        title={p.url}
                      >
                        {shortUrl(p.url)}
                      </span>
                      <span className={`cw-pg-badge ${qualityClass(p.quality)}`}>
                        {(p.quality || 'Unknown').toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="cw-rec">
                  <strong>Fix:</strong> Pick one canonical page for "{c.keyword}"- redirect or noindex the others,
                  or rewrite them to target different keywords.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
