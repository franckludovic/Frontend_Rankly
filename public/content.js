/**
 * content.js- injected into every page the user visits.
 *
 * Responsibility: read the current page's SEO signals and send them
 * to the extension popup via chrome.runtime.sendMessage.
 *
 * Currently returns a mock payload so the popup works immediately.
 * Replace the MOCK block with real DOM scraping when you're ready.
 */

;(function () {
  // Guard: don't run more than once per page
  if (window.__RanklyInjected) return
  window.__RanklyInjected = true

  function scrapePageData(keyword) {
    const title       = document.title || ''
    const metaDesc    = document.querySelector('meta[name="description"]')?.content || ''
    const h1Elements  = Array.from(document.querySelectorAll('h1'))
    const h1          = h1Elements[0]?.innerText || ''
    const canonical   = document.querySelector('link[rel="canonical"]')?.href || ''
    const hasSchema   = !!document.querySelector('script[type="application/ld+json"]')
    
    const bodyText    = document.body?.innerText || document.body?.textContent || ''
    let wordCount   = bodyText.split(/\s+/).filter(Boolean).length || 0
    const isHttps     = location.protocol === 'https:'
    const viewport    = !!document.querySelector('meta[name="viewport"]')
    const url         = location.href

    // On dev / minimal pages, compose text from all visible elements for a baseline
    let gatheredText = bodyText
    if (wordCount < 50) {
      gatheredText = [
        document.title,
        metaDesc,
        ...Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, a, td, th, blockquote, figcaption, dt, dd, span'))
          .map(el => el.textContent || '')
      ].filter(Boolean).join(' ')
      if (gatheredText.split(/\s+/).filter(Boolean).length > wordCount) {
        wordCount = gatheredText.split(/\s+/).filter(Boolean).length
      }
    }

    // 1. Structural headings
    const h1_count = h1Elements.length
    const h2_count = document.querySelectorAll('h2').length
    const h3_count = document.querySelectorAll('h3').length
    const total_heading_count = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length

    // 2. Images & media
    const images = Array.from(document.querySelectorAll('img'))
    const image_count = images.length
    const has_images = image_count > 0 ? 1 : 0
    const images_with_alt_count = images.filter(img => img.alt && img.alt.trim().length > 0).length

    // 3. Document sizing & statistics
    const rawHtml = document.documentElement.outerHTML || ''
    const raw_html_size_kb = parseFloat((rawHtml.length / 1024).toFixed(2))
    const total_dom_elements = document.getElementsByTagName('*').length
    const js_files_count = document.querySelectorAll('script').length
    const css_files_count = document.querySelectorAll('link[rel="stylesheet"]').length
    const has_og_tags = document.querySelector('meta[property^="og:"]') ? 1 : 0
    const has_robots_meta = document.querySelector('meta[name="robots"]') ? 1 : 0
    const text_to_html_ratio = rawHtml.length > 0 ? parseFloat((bodyText.length / rawHtml.length).toFixed(4)) : 0

    // 4. Link counts (internal vs external)
    const currentOrigin = location.origin
    const links = Array.from(document.querySelectorAll('a[href]'))
    let internal_link_count = 0
    let external_link_count = 0
    links.forEach(link => {
      try {
        const linkUrl = new URL(link.href, location.href)
        if (linkUrl.origin === currentOrigin) {
          internal_link_count++
        } else {
          external_link_count++
        }
      } catch (e) {
        // Ignored or self-contained links
      }
    })

    // 5. Paragraph count
    const paragraph_count = document.querySelectorAll('p').length || 0

    // 6. Keyword analysis
    let title_has_keyword = 0
    let keyword_position_in_title = 0
    let meta_desc_has_keyword = 0
    let h1_has_keyword = 0
    let keyword_frequency = 0
    let keyword_density = 0
    let alt_has_keyword = 0
    let keyword_word_count = 0
    let is_long_tail = 0
    let keyword_exact_match = 0
    let keyword_exact_match_count = 0
    let keyword_in_first_100_words = 0
    let keyword_proximity_score = 0
    let keyword_variations_count = 0
    let query_intent = 0
    let tfidf_relevance = 0

    if (keyword) {
      const kwClean = keyword.trim().toLowerCase()
      const kwWords = kwClean.split(/\s+/).filter(Boolean)
      keyword_word_count = kwWords.length
      is_long_tail = keyword_word_count >= 3 ? 1 : 0

      const kwEscaped = kwClean.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      const kwRegex = new RegExp('\\b' + kwEscaped + '\\b', 'gi')

      title_has_keyword = title.toLowerCase().includes(kwClean) ? 1 : 0
      if (title_has_keyword) {
        const pos = title.toLowerCase().indexOf(kwClean)
        keyword_position_in_title = pos >= 0 ? pos : 0
      }

      meta_desc_has_keyword = metaDesc.toLowerCase().includes(kwClean) ? 1 : 0
      h1_has_keyword = h1.toLowerCase().includes(kwClean) ? 1 : 0

      const searchText = gatheredText.length > bodyText.length ? gatheredText : bodyText
      const matches = searchText.match(kwRegex)
      keyword_frequency = matches ? matches.length : 0
      keyword_density = wordCount > 0 ? parseFloat(((keyword_frequency / wordCount) * 100).toFixed(2)) : 0

      alt_has_keyword = images.some(img => img.alt && img.alt.toLowerCase().includes(kwClean)) ? 1 : 0

      keyword_exact_match = keyword_frequency > 0 ? 1 : 0
      keyword_exact_match_count = keyword_frequency

      const bodyLower = searchText.toLowerCase()
      const first100 = bodyLower.split(/\s+/).filter(Boolean).slice(0, 100).join(' ')
      keyword_in_first_100_words = first100.includes(kwClean) ? 1 : 0

      if (kwWords.length > 1) {
        let firstIdx = -1, lastIdx = -1
        for (const w of kwWords) {
          const idx = bodyLower.indexOf(w)
          if (idx >= 0 && (firstIdx < 0 || idx < firstIdx)) firstIdx = idx
          const lIdx = bodyLower.lastIndexOf(w)
          if (lIdx > lastIdx) lastIdx = lIdx
        }
        if (firstIdx >= 0 && lastIdx > firstIdx) {
          const span = (lastIdx - firstIdx) / Math.max(bodyLower.length, 1)
          keyword_proximity_score = parseFloat((1 - span).toFixed(4))
        }
      }

      keyword_variations_count = kwWords.length > 0
        ? kwWords.filter(w => bodyLower.includes(w)).length
        : 0

      if (/\b(buy|purchase|order|price|deal|discount|cheap|best|top|review|coupon|sale|shop|store)\b/.test(kwClean)) {
        query_intent = 2
      } else if (/\b(login|sign.?in|account|dashboard|official|homepage|contact|download|register)\b/.test(kwClean)) {
        query_intent = 1
      }

      tfidf_relevance = wordCount > 0
        ? parseFloat((keyword_frequency / Math.log(wordCount + 1)).toFixed(4))
        : 0
    }

    return {
      url, title, metaDesc, h1, canonical, hasSchema, wordCount, isHttps, viewport,
      h1_count, h2_count, h3_count, total_heading_count,
      has_images, image_count, images_with_alt_count,
      paragraph_count,
      internal_link_count, external_link_count,
      raw_html_size_kb, total_dom_elements,
      js_files_count, css_files_count,
      has_og_tags, has_robots_meta,
      text_to_html_ratio,
      title_has_keyword, keyword_position_in_title,
      meta_desc_has_keyword, h1_has_keyword,
      keyword_frequency, keyword_density,
      alt_has_keyword, keyword_word_count, is_long_tail,
      keyword_exact_match, keyword_exact_match_count,
      keyword_in_first_100_words, keyword_proximity_score,
      keyword_variations_count, query_intent, tfidf_relevance
    }
  }

  // Listen for requests from the popup
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'GET_PAGE_DATA') {
      sendResponse({ ok: true, data: scrapePageData(msg.keyword) })
    }
    return true // keep channel open for async response
  })
})()
