import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../services/authService.js'
import TextField from '../../../shared/components/TextField'
import SocialLoginButton, { SocialLoginContainer } from './SocialLoginButton'

export default function RegisterForm() {
  const navigate = useNavigate()
  const [first, setFirst]       = useState('')
  const [last, setLast]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [validationErrors, setValidationErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!first.trim()) {
      errs.first = 'First name is required.'
    }
    if (!last.trim()) {
      errs.last = 'Last name is required.'
    }

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

    if (!agreed) {
      errs.agreed = 'You must agree to the Terms of Service and Privacy Policy.'
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
      await register({ email, password, firstName: first, lastName: last })
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      if (agreed) handleSubmit()
    }
  }

  return (
    <div className="auth-card-body">
      <div className="auth-card-title" style={{ fontFamily: "'Syne',sans-serif" }}>
        Create Your Account
      </div>
      <div className="auth-card-sub">
        Start your free account and run your first audit today.
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

      {/* Name Row */}
      <div className="auth-name-row">
        <TextField
          label="First Name"
          size="sm"
          placeholder="Ada"
          value={first}
          onChange={e => {
            setFirst(e.target.value)
            if (validationErrors.first) setValidationErrors(prev => ({ ...prev, first: '' }))
          }}
          onKeyDown={handleKey}
          error={validationErrors.first}
          leadingIcon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />
        <TextField
          label="Last Name"
          size="sm"
          placeholder="Lovelace"
          value={last}
          onChange={e => {
            setLast(e.target.value)
            if (validationErrors.last) setValidationErrors(prev => ({ ...prev, last: '' }))
          }}
          onKeyDown={handleKey}
          error={validationErrors.last}
          leadingIcon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />
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
        leadingIcon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        }
      />

      {/* Terms Checkbox */}
      <div className="auth-terms-row">
        <button
          type="button"
          className={`auth-terms-box${agreed ? ' on' : ''}`}
          onClick={() => setAgreed(p => !p)}
        >
          {agreed && (
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        <div className="auth-terms-txt">
          I agree to the <a>Terms of Service</a> and <a>Privacy Policy</a>
        </div>
      </div>

      {/* Error */}
      {error && <div className="auth-error">{error}</div>}

      {/* Spacer pushes button to bottom */}
      <div className="auth-spacer" />

      {/* Submit */}
      <button
        id="auth-submit"
        className="auth-submit"
        disabled={loading || !agreed}
        onClick={handleSubmit}
      >
        {loading ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙</span>
            {' Creating account…'}
          </>
        ) : (
          <>
            Create Free Account{' '}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </div>
  )
}
