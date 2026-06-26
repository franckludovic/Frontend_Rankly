import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, LayoutGrid, Globe } from 'lucide-react'
import { usePlanStore } from '../../store/planSlice.js'
import { FEATURE_PLAN, PLAN_LABELS } from '../config/planFeatures.js'

const css = `
@keyframes fgIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}

.fg-page{display:flex;flex-direction:column;align-items:center;padding:48px 24px 60px;min-height:400px;animation:fgIn .35s ease both;}
.fg-page-eyebrow{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.8px;text-transform:uppercase;padding:4px 12px;border-radius:20px;margin-bottom:22px;}
.fg-page-title{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:var(--text);letter-spacing:-.5px;text-align:center;margin-bottom:10px;max-width:540px;}
.fg-page-sub{font-family:'Outfit',sans-serif;font-size:14px;color:var(--muted);text-align:center;line-height:1.65;max-width:460px;margin-bottom:36px;}
.fg-page-perks{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:36px;}
.fg-perk{display:flex;align-items:center;gap:8px;padding:10px 16px;border-radius:10px;border:1px solid;font-family:'Outfit',sans-serif;font-size:13px;font-weight:500;color:var(--text);}
.fg-perk-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.fg-page-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:center;}
.fg-page-btn{display:inline-flex;align-items:center;gap:8px;padding:11px 28px;border-radius:10px;border:none;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .18s;}
.fg-page-btn:hover{transform:translateY(-1px);}
.fg-page-link{font-family:'Outfit',sans-serif;font-size:13px;color:var(--muted);cursor:pointer;text-decoration:underline;text-underline-offset:3px;background:none;border:none;padding:6px;}
.fg-page-link:hover{color:var(--text);}
`

// What to highlight per plan
const PLAN_PERKS = {
  pro: [
    'AI-generated content briefs',
    'Auto re-audit scheduling',
    'PDF report export',
    'A/B title & meta scorer',
    'Competitor monitoring',
    '50 audits / month',
  ],
  agency: [
    'Bulk sitemap audits (50 URLs)',
    'Keyword cannibalization',
    'Internal link AI',
    '500 audits / month',
    'Everything in Pro',
  ],
  business: [
    '10,000 audits / month',
    'Priority processing',
    'Everything in Agency',
  ],
}

const PLAN_PRICE = { pro: '$14', agency: '$39', business: '$99' }

// mode: "page" | "widget"  (widget is kept for any remaining inline uses)
export default function FeatureGate({ feature, children, mode = 'page', label }) {
  const can      = usePlanStore(s => s.can)
  const navigate = useNavigate()

  if (can(feature)) return children

  const requiredPlan  = FEATURE_PLAN[feature] || 'pro'
  const meta          = PLAN_LABELS[requiredPlan] || PLAN_LABELS.pro
  const featureLabel  = label || feature
  const perks         = PLAN_PERKS[requiredPlan] || PLAN_PERKS.pro
  const price         = PLAN_PRICE[requiredPlan] || '$14'

  if (mode === 'widget') {
    // Compact inline — just show children with a soft overlay banner
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div style={{ position:'relative', borderRadius:13, overflow:'hidden' }}>
          {children}
          <div
            onClick={() => navigate('/billing')}
            style={{
              position:'absolute', inset:0, borderRadius:13,
              background:`linear-gradient(to bottom, transparent 30%, ${meta.color}22 100%)`,
              display:'flex', alignItems:'flex-end', justifyContent:'center',
              paddingBottom:16, cursor:'pointer',
              backdropFilter:'blur(1px)',
            }}
          >
            <span style={{
              fontFamily:"'Outfit',sans-serif", fontSize:12, fontWeight:600,
              color:'#fff', background: meta.color, borderRadius:20,
              padding:'5px 16px', display:'flex', alignItems:'center', gap:6,
              boxShadow:`0 4px 12px ${meta.color}50`,
            }}>
              Unlock with {meta.name} <ArrowRight size={11} strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </>
    )
  }

  // mode === "page" — inviting upsell page, not a wall
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="fg-page">
        <span
          className="fg-page-eyebrow"
          style={{ background:`${meta.color}15`, color: meta.color, border:`1px solid ${meta.color}30` }}
        >
          {meta.name} Feature
        </span>

        <div className="fg-page-title">
          Unlock {featureLabel}
        </div>

        <div className="fg-page-sub">
          Get more out of your SEO workflow. Upgrade to <strong style={{ color: meta.color }}>{meta.name}</strong> starting
          at <strong style={{ color: meta.color }}>{price}/mo</strong> and unlock everything below — plus your first
          audit stays free.
        </div>

        <div className="fg-page-perks">
          {perks.map(perk => (
            <div
              key={perk}
              className="fg-perk"
              style={{ borderColor:`${meta.color}25`, background:`${meta.color}08` }}
            >
              <span className="fg-perk-dot" style={{ background: meta.color }} />
              {perk}
            </div>
          ))}
        </div>

        <div className="fg-page-actions">
          <button
            className="fg-page-btn"
            style={{
              background:`linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
              color:'#fff',
              boxShadow:`0 4px 18px ${meta.color}45`,
            }}
            onClick={() => navigate('/billing')}
          >
            <Zap size={14} fill="white" strokeWidth={0} />
            Upgrade to {meta.name} — {price}/mo
          </button>
          <button className="fg-page-link" onClick={() => navigate('/billing')}>
            Compare all plans →
          </button>
        </div>
      </div>
    </>
  )
}
