import { useState, useEffect, useRef } from 'react'
import { api } from '../../shared/services/apiClient.js'
import { AlertTriangle, Check } from 'lucide-react'

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}

.dv{padding:32px 28px 72px;max-width:900px;margin:0 auto;font-family:'Outfit',sans-serif;color:var(--text);}
.dv-hdr{margin-bottom:28px;animation:fadeUp .4s ease both;}
.dv-eyebrow{display:inline-flex;align-items:center;gap:6px;background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border2,rgba(255,255,255,.11));border-radius:6px;padding:4px 11px;margin-bottom:10px;}
.dv-eyebrow-txt{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.1px;text-transform:uppercase;color:var(--muted);}
.dv-title{font-family:'Syne',sans-serif;font-size:clamp(22px,2.6vw,30px);font-weight:800;letter-spacing:-.5px;margin-bottom:8px;}
.dv-title em{color:var(--teal,#2dd4bf);font-style:normal;}
.dv-sub{font-family:'Outfit',sans-serif;font-size:13.5px;color:var(--muted);max-width:560px;line-height:1.6;}

/* cards */
.dv-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:26px 28px;margin-bottom:20px;animation:fadeUp .4s ease both;}
.dv-sec-hdr{display:flex;align-items:center;gap:9px;margin-bottom:18px;}
.dv-sec-bar{width:3px;height:17px;border-radius:2px;flex-shrink:0;}
.dv-sec-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:var(--text);}

/* create form */
.dv-create-row{display:flex;gap:10px;align-items:flex-end;}
.dv-label{font-family:'DM Mono',monospace;font-size:9.5px;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:6px;display:block;}
.dv-input{flex:1;background:var(--bg3,rgba(255,255,255,.03));border:1px solid var(--border2);border-radius:9px;padding:11px 14px;font-family:'DM Mono',monospace;font-size:12px;color:var(--text);outline:none;transition:border-color .15s;}
.dv-input:focus{border-color:var(--teal-b,rgba(20,184,166,.35));}
.dv-create-btn{padding:11px 22px;border-radius:9px;border:none;background:linear-gradient(135deg,#0d9488,#0f766e);color:white;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap;display:inline-flex;align-items:center;gap:7px;}
.dv-create-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(13,148,136,.28);}
.dv-create-btn:disabled{opacity:.4;cursor:not-allowed;}
.dv-spin{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:white;border-radius:50%;animation:spin .8s linear infinite;}

/* new key reveal */
.dv-reveal{background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.25);border-radius:10px;padding:14px 16px;margin-bottom:16px;}
.dv-reveal-lbl{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.6px;color:var(--green,#34d399);margin-bottom:8px;}
.dv-reveal-row{display:flex;gap:8px;align-items:center;}
.dv-reveal-key{font-family:'DM Mono',monospace;font-size:11.5px;color:var(--text);flex:1;word-break:break-all;line-height:1.5;}
.dv-copy-btn{padding:6px 14px;border-radius:7px;border:1px solid rgba(52,211,153,.3);background:rgba(52,211,153,.08);color:var(--green,#34d399);font-family:'DM Mono',monospace;font-size:10px;cursor:pointer;transition:all .15s;white-space:nowrap;flex-shrink:0;}
.dv-copy-btn:hover{background:rgba(52,211,153,.15);}
.dv-copy-btn.copied{background:rgba(52,211,153,.18);border-color:rgba(52,211,153,.5);}
.dv-reveal-warn{font-family:'DM Mono',monospace;font-size:9.5px;color:rgba(251,191,36,.8);margin-top:8px;}

/* keys table */
.dv-table{width:100%;border-collapse:collapse;}
.dv-th{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.6px;color:var(--faint);padding:7px 10px;text-align:left;border-bottom:1px solid var(--border);}
.dv-tr{border-bottom:1px solid var(--border);transition:background .12s;}
.dv-tr:hover{background:rgba(255,255,255,.015);}
.dv-tr:last-child{border-bottom:none;}
.dv-td{padding:11px 10px;font-family:'Outfit',sans-serif;font-size:12.5px;color:var(--muted);vertical-align:middle;}
.dv-name{font-family:'Syne',sans-serif;font-size:13px;font-weight:600;color:var(--text);}
.dv-prefix{font-family:'DM Mono',monospace;font-size:11px;color:var(--teal,#2dd4bf);}
.dv-date{font-family:'DM Mono',monospace;font-size:10px;color:var(--faint);}
.dv-revoke{padding:4px 12px;border-radius:6px;border:1px solid rgba(239,68,68,.2);background:none;color:rgba(248,113,113,.6);font-family:'DM Mono',monospace;font-size:10px;cursor:pointer;transition:all .15s;}
.dv-revoke:hover{border-color:rgba(239,68,68,.45);color:var(--red,#f87171);background:rgba(239,68,68,.06);}
.dv-revoke:disabled{opacity:.35;cursor:default;}
.dv-empty{font-family:'DM Mono',monospace;font-size:11px;color:var(--faint);padding:18px 10px;}

/* docs */
.dv-endpoint-list{display:flex;flex-direction:column;gap:14px;}
.dv-ep{background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border);border-radius:10px;overflow:hidden;}
.dv-ep-hdr{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--border);}
.dv-method{font-family:'DM Mono',monospace;font-size:10px;font-weight:700;padding:3px 8px;border-radius:5px;text-transform:uppercase;flex-shrink:0;}
.m-post{background:rgba(52,211,153,.1);color:var(--green,#34d399);border:1px solid rgba(52,211,153,.2);}
.m-get {background:rgba(99,102,241,.1);color:var(--indigo,#818cf8);border:1px solid rgba(99,102,241,.2);}
.dv-ep-path{font-family:'DM Mono',monospace;font-size:11.5px;color:var(--text);}
.dv-ep-desc{font-family:'Outfit',sans-serif;font-size:11.5px;color:var(--muted);margin-left:auto;}
.dv-code{background:rgba(0,0,0,.25);margin:0;padding:14px 16px;font-family:'DM Mono',monospace;font-size:11px;color:#a5f3fc;line-height:1.65;overflow-x:auto;white-space:pre;}
.dv-code .cm{color:#64748b;}
.dv-code .cs{color:#86efac;}
.dv-base-url{font-family:'DM Mono',monospace;font-size:11.5px;color:var(--teal,#2dd4bf);background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:10px 14px;margin-bottom:14px;}
`

const BASE_URL = import.meta.env.VITE_API_BASE_URL
  || (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : 'https://api.yourserver.com')

const ENDPOINTS = [
  {
    method: 'POST', path: '/api/audit/generate', desc: 'Run a full SEO audit',
    example: `curl -X POST ${BASE_URL}/api/audit/generate \\
  -H "Authorization: Bearer rkly_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com","keyword":"seo tool"}'`,
  },
  {
    method: 'GET', path: '/api/audit/{id}', desc: 'Retrieve an audit by ID',
    example: `curl ${BASE_URL}/api/audit/AUDIT_ID \\
  -H "Authorization: Bearer rkly_YOUR_KEY"`,
  },
  {
    method: 'GET', path: '/api/history', desc: 'List all audits for your account',
    example: `curl ${BASE_URL}/api/history \\
  -H "Authorization: Bearer rkly_YOUR_KEY"`,
  },
  {
    method: 'POST', path: '/api/audit/{id}/brief', desc: 'Generate AI content brief',
    example: `curl -X POST ${BASE_URL}/api/audit/AUDIT_ID/brief \\
  -H "Authorization: Bearer rkly_YOUR_KEY"`,
  },
  {
    method: 'POST', path: '/api/audit/bulk', desc: 'Start a bulk sitemap audit',
    example: `curl -X POST ${BASE_URL}/api/audit/bulk \\
  -H "Authorization: Bearer rkly_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"keyword":"seo tool","sitemap_url":"https://example.com/sitemap.xml"}'`,
  },
]

function relDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
}

export default function DeveloperPage() {
  const [keys,       setKeys]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [name,       setName]       = useState('')
  const [creating,   setCreating]   = useState(false)
  const [newKey,     setNewKey]     = useState(null)
  const [copied,     setCopied]     = useState(false)
  const [revoking,   setRevoking]   = useState({})
  const nameRef = useRef(null)

  useEffect(() => {
    api.listApiKeys()
      .then(r => setKeys(r.keys || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const create = async () => {
    const n = name.trim() || 'My API Key'
    setCreating(true)
    try {
      const res = await api.createApiKey({ name: n })
      setKeys(k => [res.record, ...k])
      setNewKey(res.key)
      setName('')
      nameRef.current?.focus()
    } finally {
      setCreating(false)
    }
  }

  const revoke = async (id) => {
    setRevoking(r => ({ ...r, [id]: true }))
    try {
      await api.revokeApiKey(id)
      setKeys(k => k.filter(x => x.id !== id))
      if (newKey) setNewKey(null)
    } finally {
      setRevoking(r => ({ ...r, [id]: false }))
    }
  }

  const copyKey = () => {
    if (!newKey) return
    navigator.clipboard.writeText(newKey).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="dv">

        {/* Header */}
        <div className="dv-hdr">
          <div className="dv-eyebrow"><span className="dv-eyebrow-txt">Developer Access</span></div>
          <h1 className="dv-title">API <em>Keys</em></h1>
          <p className="dv-sub">Use Rankly from CI/CD pipelines, custom dashboards, or any HTTP client. All existing endpoints accept your API key as a Bearer token.</p>
        </div>

        {/* Key Management */}
        <div className="dv-card">
          <div className="dv-sec-hdr">
            <div className="dv-sec-bar" style={{ background:'var(--teal,#2dd4bf)' }} />
            <span className="dv-sec-title">Your API Keys</span>
          </div>

          {/* Create form */}
          <div className="dv-create-row" style={{ marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label className="dv-label">Key name</label>
              <input
                ref={nameRef}
                className="dv-input"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !creating && create()}
                placeholder="e.g. CI Pipeline, Dashboard, Chrome Extension"
              />
            </div>
            <button className="dv-create-btn" onClick={create} disabled={creating} style={{ marginTop: 25 }}>
              {creating ? <><span className="dv-spin" /> Generating…</> : '+ Generate Key'}
            </button>
          </div>

          {/* New key reveal */}
          {newKey && (
            <div className="dv-reveal">
              <div className="dv-reveal-lbl">New API Key- copy it now</div>
              <div className="dv-reveal-row">
                <div className="dv-reveal-key">{newKey}</div>
                <button className={`dv-copy-btn${copied ? ' copied' : ''}`} onClick={copyKey}>
                  {copied ? <><Check size={12} strokeWidth={2} /> Copied</> : 'Copy'}
                </button>
              </div>
              <div className="dv-reveal-warn"><AlertTriangle size={12} strokeWidth={1.8} style={{display:'inline',verticalAlign:'middle',marginRight:4}} /> This key will not be shown again. Store it in an environment variable.</div>
            </div>
          )}

          {/* Keys table */}
          {loading ? (
            <div className="dv-empty">Loading keys…</div>
          ) : keys.length === 0 ? (
            <div className="dv-empty">No API keys yet. Generate one above to get started.</div>
          ) : (
            <table className="dv-table">
              <thead>
                <tr>
                  <th className="dv-th">Name</th>
                  <th className="dv-th">Key Prefix</th>
                  <th className="dv-th">Created</th>
                  <th className="dv-th">Last Used</th>
                  <th className="dv-th"></th>
                </tr>
              </thead>
              <tbody>
                {keys.map(k => (
                  <tr key={k.id} className="dv-tr">
                    <td className="dv-td"><span className="dv-name">{k.name}</span></td>
                    <td className="dv-td"><span className="dv-prefix">{k.key_prefix}…</span></td>
                    <td className="dv-td"><span className="dv-date">{relDate(k.created_at)}</span></td>
                    <td className="dv-td"><span className="dv-date">{relDate(k.last_used_at)}</span></td>
                    <td className="dv-td">
                      <button className="dv-revoke" disabled={revoking[k.id]} onClick={() => revoke(k.id)}>
                        {revoking[k.id] ? '…' : 'Revoke'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* API Docs */}
        <div className="dv-card" style={{ animationDelay: '.08s' }}>
          <div className="dv-sec-hdr">
            <div className="dv-sec-bar" style={{ background:'var(--indigo,#818cf8)' }} />
            <span className="dv-sec-title">API Reference</span>
          </div>

          <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:13, color:'var(--muted)', marginBottom:16, lineHeight:1.6 }}>
            Every Rankly endpoint supports API key auth. Pass your key as a Bearer token- the same header as session auth.
          </div>

          <div className="dv-base-url">Base URL: {BASE_URL}</div>

          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:'var(--text)', marginBottom:10 }}>
            Authentication header
          </div>
          <pre className="dv-code" style={{ borderRadius:8, marginBottom:20 }}>
{`Authorization: Bearer rkly_YOUR_API_KEY`}
          </pre>

          <div className="dv-endpoint-list">
            {ENDPOINTS.map(ep => (
              <div key={ep.path} className="dv-ep">
                <div className="dv-ep-hdr">
                  <span className={`dv-method ${ep.method === 'POST' ? 'm-post' : 'm-get'}`}>{ep.method}</span>
                  <span className="dv-ep-path">{ep.path}</span>
                  <span className="dv-ep-desc">{ep.desc}</span>
                </div>
                <pre className="dv-code">{ep.example}</pre>
              </div>
            ))}
          </div>

          <div style={{ marginTop:20, padding:'14px 16px', background:'rgba(99,102,241,.06)', border:'1px solid rgba(99,102,241,.18)', borderRadius:10 }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9.5, color:'var(--indigo,#818cf8)', textTransform:'uppercase', letterSpacing:'.6px', marginBottom:6 }}>
              Full OpenAPI Spec
            </div>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontSize:12.5, color:'var(--muted)', lineHeight:1.6 }}>
              Interactive Swagger UI available at{' '}
              <a href={`${BASE_URL}/docs`} target="_blank" rel="noreferrer"
                style={{ color:'var(--indigo,#818cf8)', fontFamily:"'DM Mono',monospace", fontSize:12 }}>
                {BASE_URL}/docs
              </a>{' '}
             - all endpoints, request/response schemas, and try-it-live console.
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
