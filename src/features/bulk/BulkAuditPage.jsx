import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../shared/services/apiClient.js'
import { Play, Check, Download, ArrowLeft } from 'lucide-react'

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes bar{from{width:0;}to{width:var(--pct,0%);}}

.bk{padding:32px 28px 64px;max-width:1100px;margin:0 auto;font-family:'Outfit',sans-serif;color:var(--text);}
.bk-hdr{margin-bottom:28px;animation:fadeUp .4s ease both;}
.bk-eyebrow{display:inline-flex;align-items:center;gap:6px;background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border2,rgba(255,255,255,.11));border-radius:6px;padding:4px 11px;margin-bottom:10px;}
.bk-eyebrow-txt{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.1px;text-transform:uppercase;color:var(--muted);}
.bk-title{font-family:'Syne',sans-serif;font-size:clamp(22px,2.6vw,30px);font-weight:800;letter-spacing:-.5px;margin-bottom:8px;}
.bk-title em{color:var(--teal,#2dd4bf);font-style:normal;}
.bk-sub{font-family:'Outfit',sans-serif;font-size:13.5px;color:var(--muted);max-width:560px;line-height:1.6;}

/* form card */
.bk-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:28px;margin-bottom:20px;animation:fadeUp .4s .08s ease both;}
.bk-tabs{display:flex;gap:4px;margin-bottom:22px;border-bottom:1px solid var(--border);padding-bottom:0;}
.bk-tab{padding:7px 16px;border-radius:8px 8px 0 0;border:none;background:none;font-family:'DM Mono',monospace;font-size:10.5px;color:var(--muted);cursor:pointer;transition:all .15s;position:relative;top:1px;border:1px solid transparent;border-bottom:none;}
.bk-tab.active{color:var(--teal,#2dd4bf);background:var(--bg2);border-color:var(--border);border-bottom-color:var(--bg2);}
.bk-label{font-family:'DM Mono',monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:6px;display:block;}
.bk-input{width:100%;background:var(--bg3,rgba(255,255,255,.03));border:1px solid var(--border2);border-radius:9px;padding:11px 14px;font-family:'DM Mono',monospace;font-size:12px;color:var(--text);outline:none;transition:border-color .15s;}
.bk-input:focus{border-color:var(--teal-b,rgba(20,184,166,.35));}
.bk-textarea{width:100%;min-height:110px;resize:vertical;}
.bk-hint{font-family:'DM Mono',monospace;font-size:9px;color:var(--faint);margin-top:5px;}
.bk-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;}
.bk-field{display:flex;flex-direction:column;margin-bottom:16px;}
.bk-btn{padding:12px 28px;border-radius:10px;border:none;background:linear-gradient(135deg,#0d9488,#0f766e);color:white;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:8px;}
.bk-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(13,148,136,.3);}
.bk-btn:disabled{opacity:.45;cursor:not-allowed;}
.bk-spin{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:spin .8s linear infinite;}
.bk-error{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:8px;padding:10px 14px;font-family:'DM Mono',monospace;font-size:11px;color:var(--red,#f87171);margin-bottom:16px;}

/* progress */
.bk-prog{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:20px;animation:fadeUp .4s ease both;}
.bk-prog-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.bk-prog-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:var(--text);}
.bk-prog-count{font-family:'DM Mono',monospace;font-size:13px;color:var(--teal,#2dd4bf);}
.bk-bar-track{height:8px;background:var(--border);border-radius:4px;overflow:hidden;margin-bottom:12px;}
.bk-bar-fill{height:100%;background:linear-gradient(90deg,#2dd4bf,#0d9488);border-radius:4px;transition:width .4s ease;}
.bk-prog-kw{font-family:'DM Mono',monospace;font-size:10px;color:var(--faint);}

/* activity feed */
.bk-feed{display:flex;flex-direction:column;gap:5px;max-height:140px;overflow-y:auto;margin-top:14px;}
.bk-feed-item{display:flex;align-items:center;gap:10px;padding:6px 10px;background:var(--bg3,rgba(255,255,255,.025));border-radius:7px;font-family:'DM Mono',monospace;font-size:10px;}
.bk-feed-ok{color:var(--green,#34d399);}
.bk-feed-err{color:var(--red,#f87171);}
.bk-feed-url{color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;}
.bk-feed-score{font-family:'Syne',sans-serif;font-size:12px;font-weight:700;margin-left:auto;flex-shrink:0;}

/* results */
.bk-res{animation:fadeUp .4s ease both;}
.bk-res-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px;}
.bk-res-title{font-family:'Syne',sans-serif;font-size:17px;font-weight:700;}
.bk-res-actions{display:flex;gap:8px;}
.bk-sort-row{display:flex;align-items:center;gap:6px;margin-bottom:12px;flex-wrap:wrap;}
.bk-sort-lbl{font-family:'DM Mono',monospace;font-size:9px;color:var(--faint);text-transform:uppercase;letter-spacing:.5px;}
.bk-sort-btn{padding:4px 12px;border-radius:6px;border:1px solid var(--border2);background:none;font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);cursor:pointer;transition:all .15s;}
.bk-sort-btn.active{border-color:var(--teal-b,rgba(20,184,166,.3));background:rgba(20,184,166,.08);color:var(--teal,#2dd4bf);}
.bk-csv-btn{padding:7px 14px;border-radius:8px;border:1px solid var(--border2);background:none;font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);cursor:pointer;transition:all .15s;}
.bk-csv-btn:hover{border-color:var(--teal-b);color:var(--teal,#2dd4bf);}

/* table */
.bk-table{width:100%;border-collapse:collapse;}
.bk-th{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.6px;color:var(--faint);padding:8px 12px;text-align:left;border-bottom:1px solid var(--border);white-space:nowrap;}
.bk-th:first-child{padding-left:0;}
.bk-tr{border-bottom:1px solid var(--border);transition:background .12s;}
.bk-tr:hover{background:rgba(255,255,255,.02);}
.bk-tr:last-child{border-bottom:none;}
.bk-td{padding:11px 12px;font-family:'Outfit',sans-serif;font-size:12.5px;color:var(--muted);vertical-align:middle;}
.bk-td:first-child{padding-left:0;}
.bk-td-url{font-family:'DM Mono',monospace;font-size:10.5px;color:var(--text);max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bk-score{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;}
.bk-score.high{color:var(--green,#34d399);}
.bk-score.med{color:var(--amber,#fbbf24);}
.bk-score.low{color:var(--red,#f87171);}
.bk-qual{font-family:'DM Mono',monospace;font-size:8.5px;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:.4px;}
.q-high{background:rgba(52,211,153,.1);color:var(--green,#34d399);border:1px solid rgba(52,211,153,.2);}
.q-med{background:rgba(251,191,36,.08);color:var(--amber,#fbbf24);border:1px solid rgba(251,191,36,.18);}
.q-low{background:rgba(239,68,68,.08);color:var(--red,#f87171);border:1px solid rgba(239,68,68,.18);}
.bk-view{padding:4px 10px;border-radius:6px;border:1px solid var(--teal-b,rgba(20,184,166,.25));background:rgba(20,184,166,.06);color:var(--teal,#2dd4bf);font-family:'DM Mono',monospace;font-size:9.5px;cursor:pointer;transition:all .15s;white-space:nowrap;}
.bk-view:hover{background:rgba(20,184,166,.14);}
.bk-view:disabled{opacity:.35;cursor:default;}
.bk-empty-res{padding:28px 0;text-align:center;font-family:'DM Mono',monospace;font-size:11px;color:var(--faint);}

@media(max-width:700px){.bk-row{grid-template-columns:1fr;}.bk-td-url{max-width:160px;}}
`

const SORT_OPTIONS = [
  { key: 'seo_score',      label: 'Score',   dir: -1 },
  { key: 'predicted_rank', label: 'Rank',    dir:  1 },
  { key: 'issues',         label: 'Issues',  dir: -1 },
  { key: 'quality',        label: 'Quality', dir: -1 },
]

const QUALITY_ORDER = { HIGH: 2, MEDIUM: 1, LOW: 0 }

export default function BulkAuditPage() {
  const navigate = useNavigate()

  const [tab,       setTab]       = useState('sitemap')   // 'sitemap' | 'urls'
  const [sitemapUrl,setSitemapUrl]= useState('')
  const [urlsText,  setUrlsText]  = useState('')
  const [keyword,   setKeyword]   = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  const [jobId,     setJobId]     = useState(null)
  const [job,       setJob]       = useState(null)
  const [sortKey,   setSortKey]   = useState('seo_score')
  const intervalRef = useRef(null)

  // Poll job status
  useEffect(() => {
    if (!jobId) return
    intervalRef.current = setInterval(async () => {
      try {
        const j = await api.getBulkJob(jobId)
        setJob(j)
        if (j.done) clearInterval(intervalRef.current)
      } catch {}
    }, 1500)
    return () => clearInterval(intervalRef.current)
  }, [jobId])

  const handleStart = useCallback(async () => {
    setError('')
    const kw = keyword.trim()
    if (!kw) { setError('Keyword is required.'); return }

    const urls = tab === 'urls'
      ? urlsText.split('\n').map(s => s.trim()).filter(Boolean)
      : []

    if (tab === 'urls' && urls.length === 0) { setError('Paste at least one URL.'); return }
    if (tab === 'sitemap' && !sitemapUrl.trim()) { setError('Enter a sitemap URL.'); return }

    setLoading(true)
    try {
      const res = await api.startBulkAudit({
        keyword: kw,
        sitemap_url: tab === 'sitemap' ? sitemapUrl.trim() : undefined,
        urls: tab === 'urls' ? urls : undefined,
      })
      setJobId(res.job_id)
      setJob({ job_id: res.job_id, keyword: kw, total: res.total, completed: 0, failed: 0, done: false, results: [], errors: [] })
    } catch (e) {
      setError(e?.message || 'Failed to start bulk audit.')
    } finally {
      setLoading(false)
    }
  }, [tab, sitemapUrl, urlsText, keyword])

  const handleReset = () => {
    clearInterval(intervalRef.current)
    setJobId(null); setJob(null); setError('')
  }

  const exportCsv = () => {
    if (!job?.results?.length) return
    const header = 'URL,SEO Score,Quality,Predicted Rank,Issues,Word Count,Has Schema,Title Has KW'
    const rows   = job.results.map(r =>
      `"${r.url}",${r.seo_score},${r.quality},${r.predicted_rank},${r.issues},${r.word_count},${r.has_schema ? 'Yes' : 'No'},${r.title_has_kw ? 'Yes' : 'No'}`
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `bulk-audit-${job.keyword?.replace(/\s+/g, '-') || 'results'}.csv`
    a.click()
  }

  const sorted = [...(job?.results || [])].sort((a, b) => {
    const opt = SORT_OPTIONS.find(o => o.key === sortKey)
    if (!opt) return 0
    const av = sortKey === 'quality' ? (QUALITY_ORDER[a.quality] ?? 0) : (a[sortKey] ?? 0)
    const bv = sortKey === 'quality' ? (QUALITY_ORDER[b.quality] ?? 0) : (b[sortKey] ?? 0)
    return opt.dir * (bv - av)
  })

  const pct        = job?.total > 0 ? Math.round((job.completed / job.total) * 100) : 0
  const isRunning  = !!jobId && !job?.done
  const hasResults = (job?.results?.length || 0) > 0

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="bk">
        {/* Header */}
        <div className="bk-hdr">
          <div className="bk-eyebrow"><span className="bk-eyebrow-txt">Bulk Analysis</span></div>
          <h1 className="bk-title">Bulk URL <em>&amp; Sitemap</em> Audit</h1>
          <p className="bk-sub">Audit up to 50 pages in parallel. Paste URLs directly or point to a sitemap.xml- results are saved to your history.</p>
        </div>

        {/* Input form- hide once a job is running */}
        {!jobId && (
          <div className="bk-card">
            <div className="bk-tabs">
              <button className={`bk-tab${tab === 'sitemap' ? ' active' : ''}`} onClick={() => setTab('sitemap')}>Sitemap URL</button>
              <button className={`bk-tab${tab === 'urls'    ? ' active' : ''}`} onClick={() => setTab('urls')}>Paste URLs</button>
            </div>

            {error && <div className="bk-error">{error}</div>}

            <div className="bk-row">
              <div className="bk-field">
                <label className="bk-label">{tab === 'sitemap' ? 'Sitemap URL' : 'URLs (one per line)'}</label>
                {tab === 'sitemap' ? (
                  <>
                    <input className="bk-input" value={sitemapUrl} onChange={e => setSitemapUrl(e.target.value)}
                      placeholder="https://example.com/sitemap.xml" />
                    <span className="bk-hint">Supports sitemap index files · capped at 50 URLs</span>
                  </>
                ) : (
                  <>
                    <textarea className="bk-input bk-textarea" value={urlsText} onChange={e => setUrlsText(e.target.value)}
                      placeholder={"https://example.com/page-1\nhttps://example.com/page-2\nhttps://example.com/page-3"} />
                    <span className="bk-hint">{urlsText.split('\n').filter(s => s.trim()).length} / 50 URLs</span>
                  </>
                )}
              </div>
              <div className="bk-field">
                <label className="bk-label">Target Keyword</label>
                <input className="bk-input" value={keyword} onChange={e => setKeyword(e.target.value)}
                  placeholder="e.g. SEO audit tool" />
                <span className="bk-hint">Applied to all pages in this batch</span>
              </div>
            </div>

            <button className="bk-btn" onClick={handleStart} disabled={loading}>
              {loading ? <><span className="bk-spin" /> Starting…</> : <><Play size={14} strokeWidth={1.8} /> Start Bulk Audit</>}
            </button>
          </div>
        )}

        {/* Progress */}
        {job && (
          <div className="bk-prog">
            <div className="bk-prog-hdr">
              <span className="bk-prog-title">{job.done ? 'Audit Complete' : 'Auditing pages…'}</span>
              <span className="bk-prog-count">{job.completed} / {job.total}</span>
            </div>
            <div className="bk-bar-track">
              <div className="bk-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="bk-prog-kw">Keyword: {job.keyword} · {job.failed > 0 ? `${job.failed} errors` : 'no errors'}</div>
            {isRunning && job.results.length > 0 && (
              <div className="bk-feed">
                {[...job.results].reverse().slice(0, 6).map((r, i) => (
                  <div key={i} className="bk-feed-item">
                    <Check size={12} strokeWidth={2.5} className="bk-feed-ok" />
                    <span className="bk-feed-url">{r.url}</span>
                    <span className={`bk-feed-score ${r.quality === 'HIGH' ? 'high' : r.quality === 'MEDIUM' ? 'med' : 'low'}`}>{r.seo_score}</span>
                  </div>
                ))}
              </div>
            )}
            {job.done && <button className="bk-csv-btn" style={{ marginTop: 12 }} onClick={handleReset}><ArrowLeft size={13} strokeWidth={1.8} /> New Bulk Audit</button>}
          </div>
        )}

        {/* Results table */}
        {hasResults && (
          <div className="bk-res">
            <div className="bk-res-hdr">
              <span className="bk-res-title">Results ({sorted.length} pages)</span>
              <div className="bk-res-actions">
                <button className="bk-csv-btn" onClick={exportCsv}><Download size={13} strokeWidth={1.8} /> Export CSV</button>
              </div>
            </div>
            <div className="bk-sort-row">
              <span className="bk-sort-lbl">Sort by:</span>
              {SORT_OPTIONS.map(o => (
                <button key={o.key} className={`bk-sort-btn${sortKey === o.key ? ' active' : ''}`} onClick={() => setSortKey(o.key)}>{o.label}</button>
              ))}
            </div>
            <table className="bk-table">
              <thead>
                <tr>
                  <th className="bk-th">URL</th>
                  <th className="bk-th">Score</th>
                  <th className="bk-th">Quality</th>
                  <th className="bk-th">Rank</th>
                  <th className="bk-th">Issues</th>
                  <th className="bk-th">Words</th>
                  <th className="bk-th"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => (
                  <tr key={i} className="bk-tr">
                    <td className="bk-td"><span className="bk-td-url" title={r.url}>{r.url}</span></td>
                    <td className="bk-td">
                      <span className={`bk-score ${r.quality === 'HIGH' ? 'high' : r.quality === 'MEDIUM' ? 'med' : 'low'}`}>{r.seo_score}</span>
                    </td>
                    <td className="bk-td">
                      <span className={`bk-qual ${r.quality === 'HIGH' ? 'q-high' : r.quality === 'MEDIUM' ? 'q-med' : 'q-low'}`}>{r.quality}</span>
                    </td>
                    <td className="bk-td">#{r.predicted_rank}</td>
                    <td className="bk-td">{r.issues}</td>
                    <td className="bk-td">{r.word_count?.toLocaleString()}</td>
                    <td className="bk-td">
                      <button className="bk-view" disabled={!r.audit_id} onClick={() => r.audit_id && navigate(`/audit/${r.audit_id}`)}>
                        {r.audit_id ? 'View →' : 'Pending'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sorted.length === 0 && <div className="bk-empty-res">No results yet- audit in progress…</div>}
          </div>
        )}
      </div>
    </>
  )
}
