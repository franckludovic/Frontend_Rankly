import { useState, useEffect } from 'react'
import { ArrowLeftRight, ArrowRight } from 'lucide-react'
import { api } from '../../../shared/services/apiClient.js'

const css = `
.lw{background:var(--bg2);border:1px solid var(--border);border-radius:16px;overflow:hidden;}
.lw-hdr{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 14px;border-bottom:1px solid var(--border);}
.lw-hdr-left{display:flex;align-items:center;gap:10px;}
.lw-icon{width:30px;height:30px;border-radius:8px;background:rgba(129,140,248,.1);border:1px solid rgba(129,140,248,.2);display:flex;align-items:center;justify-content:center;font-size:14px;}
.lw-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:var(--text);}
.lw-badge{font-family:'DM Mono',monospace;font-size:8px;padding:2px 8px;border-radius:4px;background:rgba(129,140,248,.1);color:var(--indigo,#818cf8);border:1px solid rgba(129,140,248,.2);text-transform:uppercase;letter-spacing:.4px;}
.lw-body{padding:0;}
.lw-empty{padding:22px 20px;font-family:'DM Mono',monospace;font-size:11px;color:var(--faint);text-align:center;line-height:1.6;}
.lw-loading{display:flex;align-items:center;justify-content:center;height:90px;gap:10px;font-family:'DM Mono',monospace;font-size:11px;color:var(--faint);}
.lw-spin{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--indigo,#818cf8);border-radius:50%;animation:lw-spin .8s linear infinite;}
@keyframes lw-spin{to{transform:rotate(360deg);}}
.lw-list{display:flex;flex-direction:column;}
.lw-item{padding:14px 20px;border-bottom:1px solid var(--border);transition:background .15s;}
.lw-item:last-child{border-bottom:none;}
.lw-item:hover{background:rgba(255,255,255,.02);}
.lw-pair{display:flex;align-items:center;gap:10px;margin-bottom:7px;flex-wrap:wrap;}
.lw-url{font-family:'DM Mono',monospace;font-size:10px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;}
.lw-arrow{font-size:12px;color:var(--indigo,#818cf8);flex-shrink:0;}
.lw-sim{font-family:'DM Mono',monospace;font-size:9px;padding:2px 7px;border-radius:4px;flex-shrink:0;}
.lw-sim.high{background:rgba(52,211,153,.1);color:var(--green,#34d399);border:1px solid rgba(52,211,153,.2);}
.lw-sim.mid{background:rgba(251,191,36,.08);color:var(--amber,#fbbf24);border:1px solid rgba(251,191,36,.18);}
.lw-sim.low{background:rgba(129,140,248,.08);color:var(--indigo,#818cf8);border:1px solid rgba(129,140,248,.18);}
.lw-rec{font-family:'Outfit',sans-serif;font-size:11px;color:var(--muted);line-height:1.45;}
.lw-footer{padding:10px 20px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
.lw-ft-txt{font-family:'DM Mono',monospace;font-size:9.5px;color:var(--faint);}
`

function shortUrl(url) {
  try { const u = new URL(url); return (u.pathname === '/' ? u.hostname : u.pathname).slice(0, 32) }
  catch { return url.slice(0, 32) }
}

export default function LinkingWidget({ audits = [] }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)

  // Find the most common domain among recent audits
  const domain = (() => {
    if (!audits.length) return null
    const counts = {}
    for (const a of audits) {
      try { const h = new URL(a.url).hostname.replace(/^www\./, ''); counts[h] = (counts[h] || 0) + 1 } catch {}
    }
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    return top && top[1] >= 2 ? top[0] : null
  })()

  useEffect(() => {
    if (!domain) return
    setLoading(true)
    api.getLinkingSuggestions(domain)
      .then(setData)
      .catch(() => setData({ suggestions: [], page_count: 0 }))
      .finally(() => setLoading(false))
  }, [domain])

  if (!domain) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="lw">
        <div className="lw-hdr">
          <div className="lw-hdr-left">
            <div className="lw-icon"><ArrowLeftRight size={14} strokeWidth={1.8} color="#818cf8" /></div>
            <span className="lw-title">Internal Linking Opportunities</span>
          </div>
          <span className="lw-badge">{domain}</span>
        </div>
        <div className="lw-body">
          {loading ? (
            <div className="lw-loading"><div className="lw-spin" /> Analysing {data?.page_count ?? '…'} pages…</div>
          ) : !data || data.suggestions.length === 0 ? (
            <div className="lw-empty">
              {data?.page_count < 2
                ? `Audit at least 2 pages on ${domain} to see linking suggestions.`
                : 'No high-similarity page pairs found- your pages cover distinct topics.'}
            </div>
          ) : (
            <>
              <div className="lw-list">
                {data.suggestions.slice(0, 5).map((s, i) => {
                  const simClass = s.similarity >= 70 ? 'high' : s.similarity >= 55 ? 'mid' : 'low'
                  return (
                    <div key={i} className="lw-item">
                      <div className="lw-pair">
                        <span className="lw-url" title={s.source_url}>{shortUrl(s.source_url)}</span>
                        <ArrowRight size={11} strokeWidth={2} color="var(--indigo,#818cf8)" className="lw-arrow" />
                        <span className="lw-url" title={s.target_url}>{shortUrl(s.target_url)}</span>
                        <span className={`lw-sim ${simClass}`}>{s.similarity}% match</span>
                      </div>
                      <div className="lw-rec">{s.recommendation}</div>
                    </div>
                  )
                })}
              </div>
              <div className="lw-footer">
                <span className="lw-ft-txt">{data.page_count} pages analysed · {data.suggestions.length} opportunities found</span>
                {data.suggestions.length > 5 && <span className="lw-ft-txt">+{data.suggestions.length - 5} more</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
