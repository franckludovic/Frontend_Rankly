import React from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo)
  }

  handleReset = () => {
    // Clear potentially corrupted transient stores
    try {
      localStorage.removeItem('rankly.currentAudit')
    } catch {}
    // Reload app to dashboard
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#16171d',
          color: '#9ca3af',
          fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
          padding: '24px',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Glowing orbs backgrounds */}
          <div style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            opacity: 0.25
          }}>
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '15%',
              width: '400px',
              height: '400px',
              backgroundColor: 'rgba(239, 68, 68, 0.18)',
              borderRadius: '50%',
              filter: 'blur(120px)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '10%',
              right: '15%',
              width: '400px',
              height: '400px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              borderRadius: '50%',
              filter: 'blur(120px)'
            }} />
          </div>

          {/* Error Card Container */}
          <div style={{
            width: '100%',
            maxWidth: '560px',
            backgroundColor: 'rgba(30, 32, 40, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: 'rgba(0, 0, 0, 0.4) 0px 30px 60px -12px',
            backdropFilter: 'blur(12px)',
            position: 'relative',
            zIndex: 10
          }}>
            {/* Warning Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <AlertTriangle size={28} strokeWidth={2} color="#f87171" />
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '28px',
              fontWeight: 800,
              color: '#f3f4f6',
              margin: '0 0 12px',
              letterSpacing: '-0.5px'
            }}>
              Something went wrong
            </h1>

            {/* Description */}
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#9ca3af',
              margin: '0 0 28px'
            }}>
              Rankly encountered an unexpected error. This might be due to outdated browser session cache or a temporary service interruption.
            </p>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginBottom: '28px'
            }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'transparent',
                  color: '#e5e7eb',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)' }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                Reload Page
              </button>
              
              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#c084fc',
                  color: '#16171d',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#d8b4fe' }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#c084fc' }}
              >
                Return to Dashboard
              </button>
            </div>

            {/* Collapsible Error Logs (Development Support) */}
            {this.state.error && (
              <details style={{
                textAlign: 'left',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                paddingTop: '20px'
              }}>
                <summary style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#a78bfa',
                  cursor: 'pointer',
                  userSelect: 'none',
                  outline: 'none'
                }}>
                  Show error details
                </summary>
                
                <div style={{
                  marginTop: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '16px',
                  overflowX: 'auto',
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: '11px',
                  lineHeight: '1.5',
                  color: '#f87171',
                  maxHeight: '180px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
