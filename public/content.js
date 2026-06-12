/**
 * content.js — injected into every page the user visits.
 *
 * Responsibility: read the current page's SEO signals and send them
 * to the extension popup via chrome.runtime.sendMessage.
 *
 * Currently returns a mock payload so the popup works immediately.
 * Replace the MOCK block with real DOM scraping when you're ready.
 */

;(function () {
  // Guard: don't run more than once per page
  if (window.__seoInsightInjected) return
  window.__seoInsightInjected = true

  function scrapePageData() {
    const title       = document.title || ''
    const metaDesc    = document.querySelector('meta[name="description"]')?.content || ''
    const h1          = document.querySelector('h1')?.innerText || ''
    const canonical   = document.querySelector('link[rel="canonical"]')?.href || ''
    const hasSchema   = !!document.querySelector('script[type="application/ld+json"]')
    const wordCount   = document.body?.innerText?.split(/\s+/).filter(Boolean).length || 0
    const isHttps     = location.protocol === 'https:'
    const viewport    = !!document.querySelector('meta[name="viewport"]')
    const url         = location.href

    return { url, title, metaDesc, h1, canonical, hasSchema, wordCount, isHttps, viewport }
  }

  // Listen for requests from the popup
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'GET_PAGE_DATA') {
      sendResponse({ ok: true, data: scrapePageData() })
    }
    return true // keep channel open for async response
  })
})()
