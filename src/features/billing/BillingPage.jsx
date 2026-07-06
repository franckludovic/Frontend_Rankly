import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/authSlice'
import { notify } from '../../store/notificationSlice.js'
import { Check, Zap, Rocket, ArrowRight, ExternalLink, AlertCircle, Code2, Lock } from 'lucide-react'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const PLANS = [
  {
    id: 'free', name: 'Free', price: 0, xaf: null,
    color: '#94a3b8',
    icon: <Zap size={18} strokeWidth={1.8} />,
    desc: 'Everything you need to audit and fix a page.',
    limit: 5,
    features: ['5 audits / month', 'SEO score + keyword difficulty', 'Top-10 competitor analysis', 'On-page roadmap + A/B title scorer', 'PDF export + schema generator', 'Browser extension'],
  },
  {
    id: 'pro', name: 'Pro', price: 14, xaf: '8,400',
    color: '#0d9488',
    icon: <Rocket size={18} strokeWidth={1.8} />,
    desc: 'Automation, monitoring, and AI content tools.',
    limit: 50,
    features: ['50 audits / month', 'Bulk sitemap audits', 'Scheduled automatic audits', 'Competitor change alerts', 'AI content briefs', 'Internal link AI suggestions'],
    popular: true,
  },
]

const css = `
.bl-page { padding: 32px 28px; max-width: 1080px; margin: 0 auto; }
.bl-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--text); letter-spacing: -.4px; margin-bottom: 4px; }
.bl-sub   { font-family: 'Outfit', sans-serif; font-size: 13.5px; color: var(--muted); margin-bottom: 32px; }

/* Current plan card */
.bl-current { background: var(--bg2); border: 1px solid var(--border2); border-radius: 16px; padding: 22px 26px; margin-bottom: 32px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.bl-plan-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 100px; font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; border: 1px solid; }
.bl-plan-info { flex: 1; }
.bl-plan-name { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: var(--text); }
.bl-plan-renew { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--muted); margin-top: 3px; }
.bl-usage-row { display: flex; align-items: center; gap: 12px; margin-top: 14px; }
.bl-usage-label { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: .4px; white-space: nowrap; }
.bl-usage-track { flex: 1; height: 6px; background: var(--bg3); border-radius: 3px; overflow: hidden; max-width: 260px; }
.bl-usage-fill  { height: 100%; border-radius: 3px; transition: width .5s ease; }
.bl-usage-count { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted); white-space: nowrap; }
.bl-portal-btn { display: inline-flex; align-items: center; gap: 6px; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600; color: var(--teal); background: var(--teal-d); border: 1px solid var(--teal-b); border-radius: 8px; padding: 8px 16px; cursor: pointer; transition: all .18s; white-space: nowrap; }
.bl-portal-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
.bl-portal-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

/* Plan grid */
.bl-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; max-width: 640px; }
.bl-card { border-radius: 14px; padding: 24px 20px; border: 1px solid var(--border); background: var(--bg2); display: flex; flex-direction: column; position: relative; transition: border-color .2s, transform .2s; }
.bl-card:hover { border-color: var(--border2); transform: translateY(-3px); }
.bl-card.bl-popular { border-color: rgba(13,148,136,.35); box-shadow: 0 0 0 1px rgba(13,148,136,.1); }
.bl-card.bl-current-plan { border-color: rgba(13,148,136,.5); }
.bl-pop-badge { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #0d9488, #0f766e); color: #fff; font-family: 'DM Mono', monospace; font-size: 8.5px; letter-spacing: .8px; text-transform: uppercase; padding: 3px 12px; border-radius: 100px; white-space: nowrap; }
.bl-card-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; border: 1px solid; }
.bl-card-tier { font-family: 'DM Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 6px; }
.bl-card-price { font-family: 'Syne', sans-serif; font-size: 34px; font-weight: 800; color: var(--text); line-height: 1; margin-bottom: 3px; letter-spacing: -1px; }
.bl-card-price em { font-size: 18px; font-weight: 600; font-style: normal; color: var(--muted); }
.bl-card-period { font-family: 'DM Mono', monospace; font-size: 9.5px; color: var(--muted); margin-bottom: 14px; }
.bl-card-desc { font-family: 'Outfit', sans-serif; font-size: 12.5px; color: var(--muted); line-height: 1.55; margin-bottom: 16px; }
.bl-card-list { display: flex; flex-direction: column; gap: 7px; margin-bottom: 20px; flex: 1; }
.bl-card-item { display: flex; align-items: flex-start; gap: 7px; font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted); line-height: 1.4; }
.bl-item-check { flex-shrink: 0; margin-top: 1px; }
.bl-card-btn { width: 100%; padding: 10px; border-radius: 9px; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .18s; display: flex; align-items: center; justify-content: center; gap: 6px; }
.bl-btn-solid { background: linear-gradient(135deg, #0d9488, #0f766e); color: #fff; box-shadow: 0 4px 14px rgba(13,148,136,.25); }
.bl-btn-solid:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(13,148,136,.35); }
.bl-btn-outline { background: transparent; border: 1px solid var(--border2); color: var(--muted); }
.bl-btn-outline:hover { border-color: var(--text); color: var(--text); background: var(--bg3); }
.bl-btn-current { background: var(--teal-d); border: 1px solid var(--teal-b); color: var(--teal); font-size: 12px; cursor: default; }
.bl-card-btn:disabled { opacity: .55; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

/* Error banner */
.bl-error { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: var(--red-d); border: 1px solid var(--red-b); border-radius: 10px; font-family: 'Outfit', sans-serif; font-size: 13px; color: var(--red); margin-bottom: 20px; }

/* Developer Add-on */
.bl-addon-wrap { margin-top: 28px; }
.bl-addon-label { font-family: 'DM Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 10px; }
.bl-addon-card { border-radius: 14px; padding: 22px 24px; border: 1px solid rgba(129,140,248,.25); background: linear-gradient(135deg, rgba(129,140,248,.06) 0%, rgba(99,102,241,.04) 100%); display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
.bl-addon-card.bl-addon-active { border-color: rgba(52,211,153,.3); background: linear-gradient(135deg, rgba(52,211,153,.06) 0%, rgba(13,148,136,.04) 100%); }
.bl-addon-card.bl-addon-locked { border-color: var(--border); background: var(--bg2); opacity: .65; }
.bl-addon-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(129,140,248,.3); background: rgba(129,140,248,.1); color: #818cf8; }
.bl-addon-icon.active { border-color: rgba(52,211,153,.3); background: rgba(52,211,153,.1); color: var(--green,#34d399); }
.bl-addon-info { flex: 1; min-width: 200px; }
.bl-addon-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.bl-addon-desc { font-family: 'Outfit', sans-serif; font-size: 12.5px; color: var(--muted); line-height: 1.5; }
.bl-addon-feats { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 8px; }
.bl-addon-feat { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--muted); display: flex; align-items: center; gap: 5px; }
.bl-addon-price { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: var(--text); letter-spacing: -.5px; white-space: nowrap; }
.bl-addon-price em { font-size: 14px; font-weight: 500; font-style: normal; color: var(--muted); }
.bl-addon-period { font-family: 'DM Mono', monospace; font-size: 9.5px; color: var(--muted); }
.bl-addon-btn { padding: 10px 22px; border-radius: 9px; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all .18s; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.bl-addon-btn-add { background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; box-shadow: 0 4px 14px rgba(99,102,241,.25); }
.bl-addon-btn-add:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(99,102,241,.35); }
.bl-addon-btn-add:disabled { opacity: .5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
.bl-addon-btn-portal { background: transparent; border: 1px solid rgba(52,211,153,.3); color: var(--green,#34d399); }
.bl-addon-btn-portal:hover { background: rgba(52,211,153,.08); }
.bl-addon-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 100px; font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; }

@media(max-width:860px){ .bl-grid{ grid-template-columns: 1fr 1fr; } }
@media(max-width:680px){ .bl-addon-card{ flex-direction: column; align-items: flex-start; } }
@media(max-width:540px){ .bl-grid{ grid-template-columns: 1fr; } .bl-current{ flex-direction: column; align-items: flex-start; } }
`

export default function BillingPage() {
  const { token, user } = useAuth()
  const navigate = useNavigate()

  const [sub,       setSub]       = useState(null)
  const [usage,     setUsage]     = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [loadingPlan, setLoadingPlan] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [subRes, usageRes] = await Promise.all([
          fetch(`${API}/api/billing/subscription`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/usage/quota`,           { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (subRes.ok)   setSub(await subRes.json())
        if (usageRes.ok) setUsage(await usageRes.json())
      } catch {
        // non-fatal- page still renders with defaults
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const currentPlan = sub?.plan || 'free'
  const hasDevAddon = sub?.dev_addon === true
  // Legacy 'agency'/'business' subscriptions are honoured as Pro in the V2 model.
  const planMeta    = PLANS.find(p => p.id === currentPlan) || (currentPlan && currentPlan !== 'free' ? PLANS[1] : PLANS[0])
  const usedAudits  = usage?.used ?? 0
  const planLimit   = planMeta.limit
  const pct         = Math.min(100, (usedAudits / planLimit) * 100)
  const renewDate   = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
    : null

  async function handleUpgrade(planId) {
    if (planId === currentPlan) return
    setError('')
    setLoadingPlan(planId)
    try {
      const res = await fetch(`${API}/api/billing/checkout`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan: planId, email: user?.email || '' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Checkout failed')
      if (!data.url) throw new Error('Checkout did not return a payment link. Please try again.')
      window.location.href = data.url
    } catch (e) {
      setError(e.message)
      notify.error('Checkout failed', e.message)
      setLoadingPlan('')
    }
  }

  async function handlePortal() {
    setError('')
    setPortalLoading(true)
    try {
      const res = await fetch(`${API}/api/billing/portal`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Portal unavailable')
      window.location.href = data.url
    } catch (e) {
      setError(e.message)
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bl-page">
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div style={{ color:'var(--muted)', fontFamily:"'DM Mono',monospace", fontSize:12, padding:40 }}>Loading billing…</div>
      </div>
    )
  }

  return (
    <div className="bl-page">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="bl-title">Billing &amp; Plan</div>
      <div className="bl-sub">Manage your subscription and usage.</div>

      {error && (
        <div className="bl-error">
          <AlertCircle size={15} strokeWidth={2} style={{ flexShrink:0 }} />
          {error}
        </div>
      )}

      {/* ── Current plan card ── */}
      <div className="bl-current">
        <div className="bl-plan-info">
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
            <span
              className="bl-plan-badge"
              style={{ color:planMeta.color, borderColor:`${planMeta.color}40`, background:`${planMeta.color}12` }}
            >
              {planMeta.icon} {planMeta.name}
            </span>
            {sub?.status && sub.status !== 'active' && (
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'var(--red)', background:'var(--red-d)', border:'1px solid var(--red-b)', borderRadius:6, padding:'2px 8px', textTransform:'uppercase', letterSpacing:'.4px' }}>
                {sub.status}
              </span>
            )}
          </div>
          <div className="bl-plan-renew">
            {renewDate ? `Renews ${renewDate}` : 'Free plan- no billing date'}
          </div>
          <div className="bl-usage-row">
            <div className="bl-usage-label">Audits</div>
            <div className="bl-usage-track">
              <div
                className="bl-usage-fill"
                style={{
                  width: `${pct}%`,
                  background: pct > 85 ? '#f87171' : pct > 60 ? '#fbbf24' : '#0d9488',
                }}
              />
            </div>
            <div className="bl-usage-count">
              {usedAudits} / {planLimit === 10000 ? '∞' : planLimit} this month
            </div>
          </div>
        </div>
        {currentPlan !== 'free' && (
          <button className="bl-portal-btn" onClick={handlePortal} disabled={portalLoading}>
            {portalLoading ? 'Opening…' : <><ExternalLink size={13} strokeWidth={2} /> Manage Subscription</>}
          </button>
        )}
      </div>

      {/* ── Plan cards ── */}
      <div className="bl-grid">
        {PLANS.map(plan => {
          const isCurrent = plan.id === currentPlan
          const isLoading = loadingPlan === plan.id

          return (
            <div
              key={plan.id}
              className={`bl-card${plan.popular ? ' bl-popular' : ''}${isCurrent ? ' bl-current-plan' : ''}`}
            >
              {plan.popular && <div className="bl-pop-badge">Most Popular</div>}

              <div
                className="bl-card-icon"
                style={{ color:plan.color, borderColor:`${plan.color}35`, background:`${plan.color}10` }}
              >
                {plan.icon}
              </div>

              <div className="bl-card-tier">{plan.name}</div>
              <div className="bl-card-price">
                {plan.price === 0 ? 'Free' : (
                  <>
                    <em>$</em>{plan.price}
                    {plan.xaf && (
                      <span style={{fontSize:'12px',fontWeight:500,color:'var(--muted)',fontFamily:"'DM Mono',monospace",marginLeft:5,letterSpacing:0}}>
                        / {plan.xaf} XAF
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="bl-card-period">
                {plan.price === 0 ? 'forever' : '/month'}
              </div>
              <div className="bl-card-desc">{plan.desc}</div>

              <div className="bl-card-list">
                {plan.features.map((f, i) => (
                  <div key={i} className="bl-card-item">
                    <Check className="bl-item-check" size={11} strokeWidth={2.5} style={{ color:plan.color }} />
                    {f}
                  </div>
                ))}
              </div>

              {isCurrent ? (
                <button className="bl-card-btn bl-btn-current">
                  <Check size={13} strokeWidth={2.5} /> Current Plan
                </button>
              ) : plan.id === 'free' ? (
                <button className="bl-card-btn bl-btn-outline" onClick={handlePortal} disabled={currentPlan === 'free'}>
                  Downgrade
                </button>
              ) : (
                <button
                  className="bl-card-btn bl-btn-solid"
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isLoading || !!loadingPlan}
                >
                  {isLoading ? 'Redirecting…' : <>Upgrade <ArrowRight size={13} strokeWidth={2.2} /></>}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Developer Add-on ── */}
      <div className="bl-addon-wrap">
        <div className="bl-addon-label">Add-ons</div>
        {(() => {
          const apiIncluded = currentPlan === 'agency' || currentPlan === 'business'
          const canAdd      = currentPlan === 'pro' && !hasDevAddon
          const isActive    = currentPlan === 'pro' && hasDevAddon
          const needsPro    = currentPlan === 'free'
          const cardClass   = `bl-addon-card${isActive || apiIncluded ? ' bl-addon-active' : needsPro ? ' bl-addon-locked' : ''}`

          return (
            <div className={cardClass}>
              <div className={`bl-addon-icon${isActive || apiIncluded ? ' active' : ''}`}>
                {needsPro ? <Lock size={18} strokeWidth={1.8} /> : <Code2 size={18} strokeWidth={1.8} />}
              </div>

              <div className="bl-addon-info">
                <div className="bl-addon-name">Developer Access</div>
                <div className="bl-addon-desc">Generate API keys and call every Rankly endpoint programmatically from CI/CD, dashboards, or custom tooling.</div>
                <div className="bl-addon-feats">
                  {['REST API access', 'Multiple named keys', 'Bearer token auth', 'Full OpenAPI docs'].map(f => (
                    <span key={f} className="bl-addon-feat">
                      <Check size={10} strokeWidth={2.5} style={{ color: isActive || apiIncluded ? 'var(--green,#34d399)' : '#818cf8' }} />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {apiIncluded ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                  <span className="bl-addon-badge" style={{ background:'rgba(52,211,153,.1)', color:'var(--green,#34d399)', border:'1px solid rgba(52,211,153,.25)' }}>
                    <Check size={11} strokeWidth={2.5} /> Included in {planMeta.name}
                  </span>
                  <button className="bl-addon-btn bl-addon-btn-portal" onClick={handlePortal} disabled={portalLoading}>
                    <ExternalLink size={12} strokeWidth={2} /> Manage
                  </button>
                </div>
              ) : isActive ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                  <span className="bl-addon-badge" style={{ background:'rgba(52,211,153,.1)', color:'var(--green,#34d399)', border:'1px solid rgba(52,211,153,.25)' }}>
                    <Check size={11} strokeWidth={2.5} /> Active
                  </span>
                  <button className="bl-addon-btn bl-addon-btn-portal" onClick={handlePortal} disabled={portalLoading}>
                    <ExternalLink size={12} strokeWidth={2} /> Manage
                  </button>
                </div>
              ) : canAdd ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                  <div style={{ textAlign:'right' }}>
                    <div className="bl-addon-price"><em>$</em>9</div>
                    <div className="bl-addon-period">/month · cancel anytime</div>
                  </div>
                  <button
                    className="bl-addon-btn bl-addon-btn-add"
                    onClick={() => handleUpgrade('dev_addon')}
                    disabled={!!loadingPlan}
                  >
                    {loadingPlan === 'dev_addon' ? 'Redirecting…' : <>Add to Plan <ArrowRight size={13} strokeWidth={2.2} /></>}
                  </button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                  <div style={{ textAlign:'right' }}>
                    <div className="bl-addon-price"><em>$</em>9</div>
                    <div className="bl-addon-period">/month · requires Pro</div>
                  </div>
                  <span className="bl-addon-badge" style={{ background:'var(--bg3)', color:'var(--muted)', border:'1px solid var(--border)' }}>
                    <Lock size={10} strokeWidth={2} /> Upgrade to Pro first
                  </span>
                </div>
              )}
            </div>
          )
        })()}
      </div>

      <div style={{ marginTop:24, fontFamily:"'DM Mono',monospace", fontSize:10, color:'var(--faint)', textAlign:'center' }}>
        Payments are processed securely by Lemon Squeezy. Cancel anytime from the billing portal.
      </div>
    </div>
  )
}
