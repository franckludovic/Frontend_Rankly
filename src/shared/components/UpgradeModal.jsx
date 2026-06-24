import { useNavigate } from 'react-router-dom'
import { X, Zap, CheckCircle2, BarChart3, FileText, Bot } from 'lucide-react'

const css = `
.um-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(6, 12, 26, .72);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  animation: umFadeIn .18s ease;
}
@keyframes umFadeIn { from { opacity:0 } to { opacity:1 } }

.um-box {
  position: relative;
  background: var(--surface, #0f1729);
  border: 1px solid rgba(45, 212, 191, .2);
  border-radius: 18px;
  padding: 36px 32px 32px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 32px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(45,212,191,.06);
  animation: umSlideUp .22s cubic-bezier(.34,1.3,.64,1);
}
@keyframes umSlideUp { from { transform:translateY(28px); opacity:0 } to { transform:translateY(0); opacity:1 } }

.um-close {
  position: absolute; top: 14px; right: 14px;
  background: rgba(255,255,255,.06); border: none; border-radius: 8px;
  color: var(--muted, rgba(255,255,255,.35)); cursor: pointer;
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s, color .15s;
}
.um-close:hover { background: rgba(255,255,255,.1); color: var(--text, #f0f8ff); }

.um-icon-wrap {
  width: 52px; height: 52px; border-radius: 14px;
  background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.22);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px; color: #ef4444;
}

.um-title {
  font-family: 'Syne', sans-serif;
  font-size: 20px; font-weight: 800;
  color: var(--text, #f0f8ff);
  letter-spacing: -.3px; margin: 0 0 8px;
}
.um-sub {
  font-size: 13.5px; color: var(--muted, rgba(226,232,240,.45));
  line-height: 1.6; margin: 0 0 24px;
}

.um-badge {
  display: inline-block;
  background: rgba(45,212,191,.1); border: 1px solid rgba(45,212,191,.2);
  border-radius: 6px; padding: 2px 9px;
  font-family: 'DM Mono', monospace; font-size: 10px;
  letter-spacing: .8px; text-transform: uppercase;
  color: #2dd4bf; margin-bottom: 6px;
}

.um-perks {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 12px; padding: 16px 18px;
  margin-bottom: 24px;
  display: flex; flex-direction: column; gap: 10px;
}
.um-perk {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; color: var(--text-2, rgba(226,232,240,.7));
}
.um-perk svg { color: #2dd4bf; flex-shrink: 0; }

.um-cta {
  width: 100%;
  background: linear-gradient(135deg, #0d9488, #0f766e);
  color: #fff; border: none; border-radius: 10px;
  padding: 13px 20px; font-size: 14px; font-weight: 700;
  cursor: pointer; letter-spacing: -.1px;
  transition: opacity .15s, transform .1s;
}
.um-cta:hover { opacity: .9; transform: translateY(-1px); }
.um-cta:active { transform: translateY(0); }

.um-later {
  margin-top: 12px; width: 100%; background: none; border: none;
  font-size: 12px; color: var(--muted, rgba(226,232,240,.35));
  cursor: pointer; transition: color .15s;
}
.um-later:hover { color: var(--muted-hover, rgba(226,232,240,.6)); }
`

export default function UpgradeModal({ limit = 3, onClose }) {
  const navigate = useNavigate()

  function goToBilling() {
    onClose()
    navigate('/billing')
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="um-overlay" onClick={onClose}>
        <div className="um-box" onClick={e => e.stopPropagation()}>
          <button className="um-close" onClick={onClose} aria-label="Close">
            <X size={14} strokeWidth={2} />
          </button>

          <div className="um-icon-wrap">
            <Zap size={24} strokeWidth={2} />
          </div>

          <div className="um-badge">Free plan</div>
          <h2 className="um-title">You've used all {limit} free audits</h2>
          <p className="um-sub">
            Your monthly limit resets at the start of next month.
            Upgrade now to keep running audits without waiting.
          </p>

          <div className="um-perks">
            <div className="um-perk">
              <CheckCircle2 size={15} strokeWidth={2} />
              <span><strong style={{color:'var(--text,#f0f8ff)'}}>50 audits/month</strong> on Pro- 17× more</span>
            </div>
            <div className="um-perk">
              <FileText size={15} strokeWidth={2} />
              <span>PDF export + white-label reports</span>
            </div>
            <div className="um-perk">
              <Bot size={15} strokeWidth={2} />
              <span>AI content briefs powered by Gemini</span>
            </div>
            <div className="um-perk">
              <BarChart3 size={15} strokeWidth={2} />
              <span>Weekly score timeline + competitor alerts</span>
            </div>
          </div>

          <button className="um-cta" onClick={goToBilling}>
            See plans- upgrade takes 60 seconds →
          </button>
          <button className="um-later" onClick={onClose}>
            Maybe next month
          </button>
        </div>
      </div>
    </>
  )
}
