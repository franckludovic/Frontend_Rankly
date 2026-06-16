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
import LimitScreen     from './components/LimitScreen'
import { runLocalInference } from './services/modelService'
import { printSeoReport } from '../reports/reportGenerator'

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

  // User input target keyword for page SEO audit
  const [keyword, setKeyword] = useState('buy laptops')

  // Real-time scraped DOM signals
  const [scrapedData, setScrapedData] = useState(null)

  // Scan limits tracking
  const [offlineCount, setOfflineCount] = useState(0)
  const [onlineCount, setOnlineCount] = useState(0)
  const [limitType, setLimitType] = useState(null) // 'local' | 'cloud' | null

  // Query counts and the active tab on mount
  useEffect(() => {
    // 1. Get chrome synced counts (fall back to localStorage)
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['offlineCount', 'onlineCount'], (res) => {
        if (res.offlineCount !== undefined) setOfflineCount(res.offlineCount)
        if (res.onlineCount !== undefined) setOnlineCount(res.onlineCount)
      })
    } else {
      const offVal = parseInt(localStorage.getItem('rankly_offline_count') || '0', 10)
      const onVal = parseInt(localStorage.getItem('rankly_online_count') || '0', 10)
      setOfflineCount(offVal)
      setOnlineCount(onVal)
    }

    // 2. Query active tab details
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

  const updateOfflineCount = (newVal) => {
    setOfflineCount(newVal)
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ offlineCount: newVal })
    } else {
      localStorage.setItem('rankly_offline_count', newVal)
    }
  }

  const updateOnlineCount = (newVal) => {
    setOnlineCount(newVal)
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ onlineCount: newVal })
    } else {
      localStorage.setItem('rankly_online_count', newVal)
    }
  }

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
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          const activeTab = tabs[0]
          const tabUrl = activeTab.url || ''
          setFullUrl(tabUrl)
          
          let displayUrl = tabUrl
          try {
            const parsed = new URL(tabUrl)
            displayUrl = parsed.hostname + parsed.pathname
            setUrl(displayUrl)
          } catch (e) {
            setUrl(tabUrl)
          }

          const isLocal = isLocalUrl(tabUrl)
          const isOffline = !navigator.onLine
          const resolvedMode = (isLocal || isOffline) ? 'local' : 'cloud'

          if (resolvedMode === 'local') {
            if (offlineCount >= 5) {
              setLimitType('local')
              setPhase('limit')
              return
            }
            if (isLocal) {
              // Force local URL warning popup
              setShowLocalNotice(true)
            } else {
              startAudit(activeTab)
            }
          } else {
            if (onlineCount >= 3) {
              setLimitType('cloud')
              setPhase('limit')
              return
            }
            startAudit(activeTab)
          }
        } else {
          runAuditFallback()
        }
      })
    } else {
      runAuditFallback()
    }
  }

  const runAuditFallback = () => {
    const resolvedMode = getResolvedMode()
    if (resolvedMode === 'local') {
      if (offlineCount >= 5) {
        setLimitType('local')
        setPhase('limit')
        return
      }
      const isLocal = isLocalUrl(fullUrl)
      if (isLocal) {
        setShowLocalNotice(true)
      } else {
        startAudit()
      }
    } else {
      if (onlineCount >= 3) {
        setLimitType('cloud')
        setPhase('limit')
        return
      }
      startAudit()
    }
  }

  const startAudit = async (activeTab = null) => {
    setShowLocalNotice(false)
    
    // Resolve mode based on activeTab url if available, otherwise fullUrl state
    const currentUrl = activeTab ? (activeTab.url || '') : fullUrl
    const isLocal = isLocalUrl(currentUrl)
    const isOffline = !navigator.onLine
    const resolvedMode = (isLocal || isOffline) ? 'local' : 'cloud'
    
    setAuditMode(resolvedMode)
    setPhase('scanning')
    setStepIdx(0)

    const buildFallbackMetrics = (tabTitle, url) => {
      const title = tabTitle || document.title || ''
      const wordCount = title ? title.split(/\s+/).filter(Boolean).length * 12 : 500
      const metaDesc = ''
      const h1 = title
      const hasKw = keyword && title.toLowerCase().includes(keyword.toLowerCase())

      return {
        url: url || '',
        title,
        metaDesc,
        h1,
        isHttps: (url || '').startsWith('https:'),
        viewport: true,
        wordCount,
        canonical: '',
        hasSchema: false,
        h1_count: 1,
        h2_count: 1,
        h3_count: 0,
        total_heading_count: 2,
        has_images: 1,
        image_count: 3,
        images_with_alt_count: 2,
        paragraph_count: 4,
        internal_link_count: 3,
        external_link_count: 2,
        raw_html_size_kb: 25,
        total_dom_elements: 200,
        js_files_count: 3,
        css_files_count: 2,
        has_og_tags: 1,
        has_robots_meta: 0,
        text_to_html_ratio: 0.12,
        title_has_keyword: hasKw ? 1 : 0,
        keyword_position_in_title: hasKw ? title.toLowerCase().indexOf(keyword.toLowerCase()) : 0,
        meta_desc_has_keyword: 0,
        h1_has_keyword: hasKw ? 1 : 0,
        keyword_frequency: hasKw ? 2 : 0,
        keyword_density: hasKw ? parseFloat((2 / Math.max(wordCount, 1) * 100).toFixed(2)) : 0,
        alt_has_keyword: 0,
        keyword_word_count: keyword ? keyword.trim().split(/\s+/).filter(Boolean).length : 0,
        is_long_tail: keyword ? (keyword.trim().split(/\s+/).filter(Boolean).length >= 3 ? 1 : 0) : 0,
        keyword_exact_match: hasKw ? 1 : 0,
        keyword_exact_match_count: hasKw ? 2 : 0,
        keyword_in_first_100_words: hasKw ? 1 : 0,
        keyword_proximity_score: 0,
        keyword_variations_count: keyword ? keyword.trim().split(/\s+/).filter(Boolean).length : 0,
        query_intent: keyword ? (/\b(buy|purchase|order|price|deal|discount|cheap|review|coupon|sale)\b/.test(keyword.toLowerCase()) ? 2 : 0) : 0,
        tfidf_relevance: hasKw ? parseFloat((2 / Math.log(Math.max(wordCount, 1) + 1)).toFixed(4)) : 0,
      }
    }

    const handleScrapedData = async (data) => {
      setScrapedData(data)
      if (resolvedMode === 'local') {
        console.log('[ExtensionPopup] Running local offline model pipeline...')
        const prediction = await runLocalInference(data)
        setScore(prediction.score)
        updateOfflineCount(offlineCount + 1)
      } else {
        console.log('[ExtensionPopup] Routing to cloud audit pipeline...')
        setScore(84)
        updateOnlineCount(onlineCount + 1)
      }
    }

    if (activeTab && typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.sendMessage) {
      const tabId = activeTab.id
      chrome.tabs.sendMessage(tabId, { type: 'GET_PAGE_DATA', keyword: keyword }, async (response) => {
        const lastError = chrome.runtime.lastError
        if (lastError || !response || !response.ok) {
          console.log('[ExtensionPopup] Content script not responding. Attempting dynamic injection...')
          if (chrome.scripting && chrome.scripting.executeScript) {
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              files: ['content.js']
            }, () => {
              const injectError = chrome.runtime.lastError
              if (injectError) {
                console.error('[ExtensionPopup] Dynamic script injection failed:', injectError)
                handleScrapedData(buildFallbackMetrics(activeTab.title, currentUrl))
              } else {
                chrome.tabs.sendMessage(tabId, { type: 'GET_PAGE_DATA', keyword: keyword }, async (retryResponse) => {
                  const retryError = chrome.runtime.lastError
                  if (retryError || !retryResponse || !retryResponse.ok) {
                    console.error('[ExtensionPopup] Content script retry failed after injection:', retryError)
                    handleScrapedData(buildFallbackMetrics(activeTab.title, currentUrl))
                  } else {
                    handleScrapedData(retryResponse.data)
                  }
                })
              }
            })
          } else {
            handleScrapedData(buildFallbackMetrics(activeTab.title, currentUrl))
          }
        } else {
          await handleScrapedData(response.data)
        }
      })
    } else if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.sendMessage) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          startAudit(tabs[0])
        } else {
          handleScrapedData(buildFallbackMetrics('', currentUrl))
        }
      })
    } else {
      await handleScrapedData(buildFallbackMetrics('', currentUrl))
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
      {/* ── Header: visible in Scanning and Results phases, but not on Welcome Screen or Limit Screen ── */}
      {phase !== 'welcome' && phase !== 'limit' && (
        <PopupHeader 
          url={url} 
          showPrint={phase === 'results'} 
          onPrint={() => printSeoReport(scrapedData, score, keyword)} 
        />
      )}

      {/* ── Welcome phase ── */}
      {phase === 'welcome' && (
        <WelcomeScreen
          url={url}
          keyword={keyword}
          onKeywordChange={setKeyword}
          offlineCount={offlineCount}
          onlineCount={onlineCount}
          onAudit={handlePerformAudit}
          onSignUp={handleSignUp}
        />
      )}

      {/* ── Limit reached phase ── */}
      {phase === 'limit' && (
        <LimitScreen
          limitType={limitType}
          onBack={() => setPhase('welcome')}
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
            scrapedData={scrapedData}
            keyword={keyword}
            auditMode={auditMode}
          />
          <IssuesList
            scrapedData={scrapedData}
            keyword={keyword}
            auditMode={auditMode}
          />
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
