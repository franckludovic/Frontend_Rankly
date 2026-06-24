import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export default function CheckoutSuccess() {
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => navigate('/billing'), 4000)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg)', gap: 20, padding: 24,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'rgba(13,148,136,.12)', border: '1px solid rgba(13,148,136,.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CheckCircle size={36} strokeWidth={1.6} color="#0d9488" />
      </div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing:'-.4px' }}>
        You're all set!
      </div>
      <div style={{ fontFamily:"'Outfit',sans-serif", fontSize: 15, color: 'var(--muted)', textAlign:'center', maxWidth: 340 }}>
        Your subscription is now active. Redirecting you to the billing page…
      </div>
      <button
        onClick={() => navigate('/billing')}
        style={{
          marginTop: 8, background: 'linear-gradient(135deg,#0d9488,#0f766e)', color:'#fff',
          border: 'none', borderRadius: 10, padding: '11px 28px',
          fontFamily:"'Outfit',sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}
      >
        Go to Billing
      </button>
    </div>
  )
}
