import { useState, useEffect } from 'react'
import './components/popup.css'
import PopupHeader     from './components/PopupHeader'
import WelcomeScreen   from './components/WelcomeScreen'
import LocalHostNotice from './components/LocalHostNotice'
import ScanningView, { SCAN_STEPS } from './components/ScanningView'
import ResultsView     from './components/ResultsView'
import IssuesList      from './components/IssuesList'
import CtaSection      from './components/CtaSection'
import ScrollIndicator from './components/ScrollIndicator'
import { runLocalInference } from './services/modelService'

/* Helper function to check if a URL is running on a local development server or not deployed */
function isLocalUrl(urlStr) {
  if (!urlStr) return false
  try {
    const u = new URL(urlStr)
    const hostname = u.hostname.toLowerCase()

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
      return true
    }
    if (hostname.endsWith('.local') || hostname.endsWith('.test') || hostname.endsWith('.localhost')) {
      return true
    }
    if (u.protocol === 'file:') {
      return true
    }
    const parts = hostname.split('.')
    if (parts.length === 4) {
      const first = parseInt(parts[0], 10)
      const second = parseInt(parts[1], 10)
      if (first === 10) return true
      if (first === 192 && second === 168) return true
      if (first === 172 && second >= 16 && second <= 31) return true
    }
    return false
  } catch (e) {
    const lower = urlStr.toLowerCase()
    return lower.includes('localhost') || lower.includes('127.0.0.1') || lower.startsWith('file:///')
  }
}

export default function ExtensionPopup() {
  const [phase, setPhase] = useState('welcome') // 'welcome' | 'scanning' | 'results'
  const [stepIdx, setStepIdx] = useState(0)
  
  // URL displayed in header/welcome screen
  const [url, setUrl] = useState('example.com/laptops')
  // Full raw URL used for local deployment checks
  const [fullUrl, setFullUrl] = useState('https://example.com/laptops')
  
  // State to toggle the warning sheet overlay
  const [showLocalNotice, setShowLocalNotice] = useState(false)

  // Audit mode: 'cloud' | 'local'
  const [auditMode, setAuditMode] = useState('cloud')
  
  // Dynamic score returned by the pipeline/model
  const [score, setScore] = useState(68)

  // Query the active tab on mount
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          const tabUrl = tabs[0].url || ''
          setFullUrl(tabUrl)
          try {
            const parsed = new URL(tabUrl)
            setUrl(parsed.hostname + parsed.pathname)
          } catch (e) {
            setUrl(tabUrl)
          }
        }
      })
    }
  }, [])

  /* Simulate progressive scan steps then reveal results */
  useEffect(() => {
    if (phase !== 'scanning') return
    if (stepIdx < SCAN_STEPS.length - 1) {
      const t = setTimeout(() => setStepIdx(i => i + 1), 600)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setPhase('results'), 800)
      return () => clearTimeout(t)
    }
  }, [stepIdx, phase])

  // Resolve audit mode based on current URL and network online status
  const getResolvedMode = () => {
    const isLocal = isLocalUrl(fullUrl)
    const isOffline = !navigator.onLine
    return (isLocal || isOffline) ? 'local' : 'cloud'
  }

  const handlePerformAudit = () => {
    const isLocal = isLocalUrl(fullUrl)
    if (isLocal) {
      // Force local URL warning popup
      setShowLocalNotice(true)
    } else {
      startAudit()
    }
  }

  const startAudit = async () => {
    setShowLocalNotice(false)
    const resolvedMode = getResolvedMode()
    setAuditMode(resolvedMode)
    setPhase('scanning')
    setStepIdx(0)

    if (resolvedMode === 'local') {
      // Offline/Local URL Mode: Extract DOM features and run the local inference engine
      console.log('[ExtensionPopup] Running local offline model pipeline...')
      
      // Default fallback mock features
      let metrics = {
        title: 'Laptops',
        metaDesc: 'Cheap laptops for sale',
        h1: 'Welcome',
        isHttps: fullUrl.startsWith('https:'),
        viewport: true
      }

      // Query content script for real-time DOM signals
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.sendMessage) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_PAGE_DATA' }, async (response) => {
              if (response && response.ok && response.data) {
                metrics = response.data
              }
              // Run model inference with fetched metrics
              const prediction = await runLocalInference(metrics)
              setScore(prediction.score)
            })
          }
        })
      } else {
        // Fallback for development server/testing environment
        const prediction = await runLocalInference(metrics)
        setScore(prediction.score)
      }
    } else {
      // Cloud Pipeline: Set the default cloud prediction score
      console.log('[ExtensionPopup] Routing to cloud audit pipeline...')
      setScore(68)
    }
  }

  const handleSignUp = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: 'https://rankly-seo.com/signup' })
    } else {
      window.open('https://rankly-seo.com/signup', '_blank')
    }
  }

  return (
    <div className="popup">
      {/* ── Header: visible in Scanning and Results phases, but not on Welcome Screen ── */}
      {phase !== 'welcome' && (
        <PopupHeader url={url} />
      )}

      {/* ── Welcome phase ── */}
      {phase === 'welcome' && (
        <WelcomeScreen
          url={url}
          onAudit={handlePerformAudit}
          onSignUp={handleSignUp}
        />
      )}

      {/* ── Scanning phase ── */}
      {phase === 'scanning' && (
        <ScanningView stepIdx={stepIdx} auditMode={auditMode} />
      )}

      {/* ── Results phase ── */}
      {phase === 'results' && (
        <>
          <ResultsView
            score={score}
            keyword="buy cheap laptops"
            auditMode={auditMode}
          />
          <IssuesList auditMode={auditMode} />
          <CtaSection auditMode={auditMode} />
        </>
      )}

      {/* ── Localhost warning sheet overlay ── */}
      {showLocalNotice && (
        <LocalHostNotice
          url={url}
          onConfirm={startAudit}
          onCancel={() => setShowLocalNotice(false)}
        />
      )}

      {/* ── Scroll indicator (glassy circle + fade) — always mounted ── */}
      <ScrollIndicator />
    </div>
  )
}
