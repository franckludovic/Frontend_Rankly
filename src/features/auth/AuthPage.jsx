import { useState } from 'react'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import './style/auth.css'

export default function AuthPage() {
  const [mode, setMode] = useState('login')

  const isLogin  = mode === 'login'
  const isSignup = mode === 'signup'

  return (
    <div className="auth-page">
      {/* ── Animated orbs ── */}
      <div className="auth-orbs">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        <div className="auth-orb auth-orb-4" />
      </div>

      {/* ── Topbar ── */}
      <nav className="auth-nav">
        <div className="auth-nav-logo">
          <img 
            src="/images/Rankly_Dark.png" 
            alt="Rankly Logo" 
            style={{ height: '22px', width: 'auto', display: 'block' }} 
          />
        </div>
      </nav>

      {/* ── Main body ── */}
      <div className="auth-body">
        {/* Left copy */}
        <div className="auth-left">
          <h1 className="auth-headline">
            <span className="hl-white">Data-Driven SEO.</span>
            <span className="hl-green">Powered by AI.</span>
          </h1>
          <p className="auth-sub">
            Stop guessing. Start ranking. Let our engine analyse your competitors
            and give you the exact fixes you need to reach page one.
          </p>
        </div>

        {/* Right: fixed-height card */}
        <div className="auth-right">
          <div className="auth-card">
            {/* Tabs */}
            <div className="auth-tabs">
              <button
                className={`auth-tab${isLogin ? ' active' : ''}`}
                onClick={() => setMode('login')}
              >
                Log In
              </button>
              <button
                className={`auth-tab${isSignup ? ' active' : ''}`}
                onClick={() => setMode('signup')}
              >
                Create Account
              </button>
            </div>

            {/* Active Form */}
            {isLogin ? <LoginForm /> : <RegisterForm />}
          </div>

          {/* Below card link */}
          <div className="auth-below-card">
            {isLogin ? (
              <>
                Don&apos;t have an account?{' '}
                <a onClick={() => setMode('signup')}>Start your free trial</a>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <a onClick={() => setMode('login')}>Sign in here</a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="auth-footer">
        <div className="auth-footer-txt">
          © 2026 Rankly · Built for developers · VITE_USE_MOCK_API={import.meta.env.VITE_USE_MOCK_API ?? 'true'}
        </div>
      </footer>
    </div>
  )
}
