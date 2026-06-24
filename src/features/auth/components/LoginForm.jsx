import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService.js'
import TextField from '../../../shared/components/TextField'
import SocialLoginButton, { SocialLoginContainer } from './SocialLoginButton'
import { Mail, Lock, ArrowRight, Settings } from 'lucide-react'

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
        <SocialLoginButton provider="google" />
        <SocialLoginButton provider="github" />
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
        leadingIcon={<Mail size={13} strokeWidth={1.8} />}
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
        leadingIcon={<Lock size={13} strokeWidth={1.8} />}
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
            <Settings size={13} strokeWidth={2} style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} />
            {' Signing in…'}
          </>
        ) : (
          <>
            Sign In to Dashboard{' '}
            <ArrowRight size={13} strokeWidth={2.5} />
          </>
        )}
      </button>
    </div>
  )
}
