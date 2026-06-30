import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useNotifications } from '../../store/notificationSlice.js'

/*
  Themed toast notifications.

  Motion (per design spec):
   - anchored top-left, drops DOWN into view while zooming in slightly (professional, ~0.92 -> 1)
   - holds for `duration` (default 3s)
   - then shrinks + rises back UP and fades away

  Theming uses the app's CSS variables so it tracks the active light/dark theme.
*/

const css = `
.nh-wrap{
  position:fixed; top:18px; left:18px; z-index:6000;
  display:flex; flex-direction:column; gap:10px;
  pointer-events:none; max-width:min(360px,calc(100vw - 36px));
}
@keyframes nh-in{
  0%  { opacity:0; transform:translateY(-26px) scale(.8); }
  100%{ opacity:1; transform:translateY(0) scale(1); }
}
@keyframes nh-out{
  0%  { opacity:1; transform:translateY(0) scale(1); }
  100%{ opacity:0; transform:translateY(-26px) scale(.8); }
}
.nh-toast{
  pointer-events:auto;
  display:flex; align-items:flex-start; gap:11px;
  background:var(--bg2); border:1px solid var(--border2);
  border-left:3px solid var(--nh-accent);
  border-radius:12px; padding:13px 14px 13px 13px;
  box-shadow:0 12px 34px rgba(0,0,0,.34), 0 2px 8px rgba(0,0,0,.18);
  font-family:'Outfit',sans-serif;
  transform-origin:top left;
  animation:nh-in .34s cubic-bezier(.16,.84,.34,1) both;
  will-change:transform,opacity;
}
.nh-toast.nh-leaving{
  animation:nh-out .3s cubic-bezier(.4,0,.7,.2) forwards;
}
.nh-icon{ flex-shrink:0; margin-top:1px; color:var(--nh-accent); display:flex; }
.nh-body{ flex:1; min-width:0; }
.nh-title{
  font-family:'Syne',sans-serif; font-size:13px; font-weight:700;
  color:var(--text); letter-spacing:-.2px; line-height:1.3;
}
.nh-msg{
  font-size:12px; color:var(--muted); line-height:1.5; margin-top:2px;
  word-break:break-word;
}
.nh-close{
  flex-shrink:0; width:20px; height:20px; border-radius:6px; border:none;
  background:none; color:var(--faint); cursor:pointer; display:flex;
  align-items:center; justify-content:center; transition:color .15s,background .15s;
}
.nh-close:hover{ color:var(--text); background:var(--bg-hover); }
.nh-bar{
  position:absolute; left:0; bottom:0; height:2px; border-radius:0 0 0 12px;
  background:var(--nh-accent); opacity:.5;
  animation:nh-bar linear forwards;
}
@keyframes nh-bar{ from{width:100%;} to{width:0%;} }
`

const ACCENT = {
  success: 'var(--green,#34d399)',
  error:   'var(--red,#f87171)',
  warning: 'var(--amber,#fbbf24)',
  info:    'var(--teal,#2dd4bf)',
}

function Icon({ type }) {
  const p = { size: 17, strokeWidth: 2 }
  if (type === 'success') return <CheckCircle2 {...p} />
  if (type === 'error')   return <AlertCircle {...p} />
  if (type === 'warning') return <AlertTriangle {...p} />
  return <Info {...p} />
}

function Toast({ toast, onClose }) {
  const [leaving, setLeaving] = useState(false)
  const duration = toast.duration ?? 3000

  useEffect(() => {
    const hold = setTimeout(() => setLeaving(true), duration)
    return () => clearTimeout(hold)
  }, [duration])

  // Remove from store only after the exit animation has finished.
  const handleAnimEnd = (e) => {
    if (leaving && e.animationName === 'nh-out') onClose()
  }

  return (
    <div
      className={`nh-toast${leaving ? ' nh-leaving' : ''}`}
      style={{ '--nh-accent': ACCENT[toast.type] || ACCENT.info, position: 'relative', overflow: 'hidden' }}
      onAnimationEnd={handleAnimEnd}
      role="status"
    >
      <span className="nh-icon"><Icon type={toast.type} /></span>
      <div className="nh-body">
        {toast.title && <div className="nh-title">{toast.title}</div>}
        {toast.message && <div className="nh-msg">{toast.message}</div>}
      </div>
      <button className="nh-close" aria-label="Dismiss" onClick={() => setLeaving(true)}>
        <X size={13} strokeWidth={2.2} />
      </button>
      {!leaving && <span className="nh-bar" style={{ animationDuration: `${duration}ms` }} />}
    </div>
  )
}

export default function NotificationHost() {
  const toasts  = useNotifications((s) => s.toasts)
  const dismiss = useNotifications((s) => s.dismiss)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="nh-wrap" aria-live="polite">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </>
  )
}
