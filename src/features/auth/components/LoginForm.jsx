import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService.js'
import TextField from '../../../shared/components/TextField'
import SocialLoginButton, { SocialLoginContainer } from './SocialLoginButton'

export default function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [error, setError]       = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('expired') === 'true' ? 'Your session has expired. Please log in again.' : ''
  })

  const validate = () => {
    const errs = {}
    if (!email) {
      errs.email = 'Email address is required.'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address.'
    }

    if (!password) {
      errs.password = 'Password is required.'
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters.'
    }

    setValidationErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    setError('')
    setValidationErrors({})
    if (!validate()) return

    setLoading(true)
    try {
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="auth-card-body">
      <div className="auth-card-title" style={{ fontFamily: "'Syne',sans-serif" }}>
        Welcome Back
      </div>
      <div className="auth-card-sub">
        Enter your credentials to access your SEO dashboard.
      </div>

      {/* OAuth */}
      <SocialLoginContainer>
        <SocialLoginButton provider="google" onClick={() => console.log('Google login')} />
        <SocialLoginButton provider="github" onClick={() => console.log('GitHub login')} />
      </SocialLoginContainer>

      <div className="auth-divider">
        <div className="auth-divider-line" />
        <div className="auth-divider-txt">or</div>
        <div className="auth-divider-line" />
      </div>

      {/* Email */}
      <TextField
        id="auth-email"
        type="email"
        size="sm"
        label="Email Address"
        placeholder="name@company.com"
        value={email}
        onChange={e => {
          setEmail(e.target.value)
          if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: '' }))
        }}
        onKeyDown={handleKey}
        error={validationErrors.email}
        leadingIcon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        }
      />

      {/* Password */}
      <TextField
        id="auth-password"
        isPasswordField={true}
        size="sm"
        label="Password"
        placeholder="••••••••"
        value={password}
        onChange={e => {
          setPassword(e.target.value)
          if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: '' }))
        }}
        onKeyDown={handleKey}
        error={validationErrors.password}
        headerRight={<button type="button" className="auth-forgot" onClick={() => console.log('Forgot password clicked')}>Forgot Password?</button>}
        leadingIcon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        }
      />

      {/* Error */}
      {error && <div className="auth-error">{error}</div>}

      {/* Spacer pushes button to bottom */}
      <div className="auth-spacer" />

      {/* Submit */}
      <button
        id="auth-submit"
        className="auth-submit"
        disabled={loading}
        onClick={handleSubmit}
      >
        {loading ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙</span>
            {' Signing in…'}
          </>
        ) : (
          <>
            Sign In to Dashboard{' '}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </div>
  )
}
