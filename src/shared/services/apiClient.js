/**
 * apiClient.js
 * ─────────────────────────────────────────────────────────────
 * Central API abstraction layer.
 *
 * SWITCHING TO REAL FASTAPI BACKEND:
 *   In your .env file, set:
 *     VITE_USE_MOCK_API=false
 *     VITE_API_BASE_URL=http://localhost:8000
 *
 * All service files (authService, auditService, etc.) call
 * functions from here- you NEVER need to change the service
 * files when switching backends.
 * ─────────────────────────────────────────────────────────────
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'
const BASE_URL  = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

import { useAuthStore } from '../../store/authSlice.js'
import { normalizeAudit } from '../utils/normalizeAudit.js'
import * as authService from '../../features/auth/services/authService.js'
import { supabase } from '../../lib/supabase.js'

/* ─── Storage helpers ─────────────────────────────────────── */
const storage = {
  get: (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : fallback
    } catch { return fallback }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  },
}

/* ─── Simulated network delay (50-200ms) ─────────────────── */
const delay = (ms = 120) => new Promise(r => setTimeout(r, ms + Math.random() * 80))

/* ─── Get a fresh token from Supabase (auto-refreshes if expired) ── */
async function getFreshToken() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) return storage.get('rankly.token')
    // Keep localStorage in sync with whatever Supabase has
    if (session.access_token !== storage.get('rankly.token')) {
      storage.set('rankly.token', session.access_token)
    }
    return session.access_token
  } catch {
    return storage.get('rankly.token')
  }
}

/* ─── Real HTTP helper ───────────────────────────────────── */
async function http(method, path, body) {
  const token = await getFreshToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    if (res.status === 401) {
      // Try once to force-refresh the Supabase session before giving up
      try {
        const { data: { session } } = await supabase.auth.refreshSession()
        if (session?.access_token) {
          storage.set('rankly.token', session.access_token)
          // Retry the original request with the new token
          const retry = await fetch(`${BASE_URL}${path}`, {
            method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: body ? JSON.stringify(body) : undefined,
          })
          if (retry.ok) return retry.json()
        }
      } catch { /* refresh failed- fall through to logout */ }

      storage.set('rankly.token', null)
      storage.set('rankly.currentUser', null)
      useAuthStore.getState().logout()
      window.location.href = '/login?expired=true'
      throw new Error('Session expired')
    }
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    // 403 with a quota code → throw a typed error so the UI shows the upgrade modal
    if (res.status === 403 && err.detail?.code) {
      const quotaError = new Error(err.detail.detail || 'Monthly audit limit reached.')
      quotaError.isQuotaError = true
      quotaError.limit        = err.detail.usage?.limit ?? 3
      throw quotaError
    }
    const msg = typeof err.detail === 'string' ? err.detail : err.detail?.detail || `HTTP ${res.status}`
    const error = new Error(msg)
    if (res.status === 403) error.isAccessDenied = true
    throw error
  }
  return res.json()
}

/* ═══════════════════════════════════════════════════════════
   AUTH
   ═══════════════════════════════════════════════════════════ */

async function mockLogin({ email, password }) {
  await delay()
  const users = storage.get('rankly.users', {})
  const user  = users[email]
  if (!user) throw new Error('No account found with this email. Please register.')
  if (user.password !== password) throw new Error('Incorrect password.')
  const token = `mock_token_${Date.now()}`
  storage.set('rankly.token', token)
  storage.set('rankly.currentUser', { email, name: user.name, initials: user.initials })
  return { token, user: { email, name: user.name, initials: user.initials } }
}

async function mockRegister({ email, password, firstName, lastName }) {
  await delay()
  const users = storage.get('rankly.users', {})
  if (users[email]) throw new Error('An account with this email already exists.')
  const name     = `${firstName} ${lastName}`.trim()
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  users[email]   = { password, name, initials }
  storage.set('rankly.users', users)
  const token = `mock_token_${Date.now()}`
  storage.set('rankly.token', token)
  storage.set('rankly.currentUser', { email, name, initials })
  return { token, user: { email, name, initials } }
}

async function mockLogout() {
  await delay(30)
  storage.set('rankly.token', null)
  storage.set('rankly.currentUser', null)
}

async function mockGetCurrentUser() {
  await delay(40)
  const token = storage.get('rankly.token')
  if (!token) throw new Error('Not authenticated')
  return storage.get('rankly.currentUser')
}

/* ═══════════════════════════════════════════════════════════
   AUDITS
   ═══════════════════════════════════════════════════════════ */

/* Fixed sample data for the canonical demo keyword */
const SAMPLE_AUDIT_DATA = {
  seoScore: 68,
  quality: 'MEDIUM',
  predictedRank: 34,
  keywordCoverage: 2,
  technicalScore: 3,
  issuesFound: 3,
  checksPassed: 24,
  wordCount: 1250,
  keywordDensity: 1.2,
  paragraphs: 14,
  readabilityScore: 65,
  altCoverage: 74,
  internalLinks: 45,
  externalLinks: 12,
  hasSchema: false,
  pageTitle: 'Buy Laptops Today | Best Deals',
  metaDescription: 'Looking for the best laptops? Click here for amazing deals and fast shipping.',
  h1: 'Buy Laptops Today',
  h2Count: 5,
  h3Count: 12,
  canonical: 'example.com/laptops',
  indexStatus: 'index, follow',
  titleHasKw: false,
  metaHasKw: false,
  h1HasKw: false,
  altHasKw: true,
  bodyHasKw: true,
  competitors: [
    {rank:1, domain:'amazon.com', wordCount:3240, keywordDensity:2.1, keywordSignal:4, technicalScore:4, altCoverage:91, internalLinks:312, externalLinks:8, hasSchema:true, titleHasKw:true, metaHasKw:true, h1HasKw:true, altHasKw:true, bodyHasKw:true, searchPresence:94, h2Count:12, h3Count:28},
    {rank:2, domain:'bestbuy.com', wordCount:2880, keywordDensity:1.9, keywordSignal:4, technicalScore:4, altCoverage:88, internalLinks:248, externalLinks:5, hasSchema:true, titleHasKw:true, metaHasKw:true, h1HasKw:true, altHasKw:true, bodyHasKw:true, searchPresence:87, h2Count:10, h3Count:22},
    {rank:3, domain:'walmart.com', wordCount:2100, keywordDensity:1.7, keywordSignal:3, technicalScore:4, altCoverage:82, internalLinks:196, externalLinks:6, hasSchema:true, titleHasKw:true, metaHasKw:true, h1HasKw:true, altHasKw:false, bodyHasKw:true, searchPresence:81, h2Count:8, h3Count:16},
    {rank:4, domain:'notebookcheck.net', wordCount:4100, keywordDensity:2.3, keywordSignal:3, technicalScore:3, altCoverage:77, internalLinks:88, externalLinks:24, hasSchema:false, titleHasKw:true, metaHasKw:true, h1HasKw:true, altHasKw:false, bodyHasKw:true, searchPresence:62, h2Count:18, h3Count:34},
    {rank:5, domain:'rtings.com', wordCount:3650, keywordDensity:2.0, keywordSignal:4, technicalScore:4, altCoverage:95, internalLinks:124, externalLinks:12, hasSchema:true, titleHasKw:true, metaHasKw:true, h1HasKw:true, altHasKw:true, bodyHasKw:true, searchPresence:71, h2Count:14, h3Count:26},
    {rank:6, domain:'tomsguide.com', wordCount:3200, keywordDensity:1.8, keywordSignal:4, technicalScore:4, altCoverage:89, internalLinks:142, externalLinks:18, hasSchema:true, titleHasKw:true, metaHasKw:true, h1HasKw:true, altHasKw:true, bodyHasKw:true, searchPresence:68, h2Count:11, h3Count:20},
    {rank:7, domain:'techradar.com', wordCount:2600, keywordDensity:1.6, keywordSignal:3, technicalScore:3, altCoverage:71, internalLinks:98, externalLinks:15, hasSchema:false, titleHasKw:true, metaHasKw:false, h1HasKw:true, altHasKw:false, bodyHasKw:true, searchPresence:55, h2Count:9, h3Count:14},
    {rank:8, domain:'cnet.com', wordCount:2900, keywordDensity:1.7, keywordSignal:4, technicalScore:4, altCoverage:86, internalLinks:168, externalLinks:22, hasSchema:true, titleHasKw:true, metaHasKw:true, h1HasKw:true, altHasKw:true, bodyHasKw:true, searchPresence:78, h2Count:10, h3Count:18},
    {rank:9, domain:'laptopmag.com', wordCount:2400, keywordDensity:1.5, keywordSignal:3, technicalScore:3, altCoverage:68, internalLinks:76, externalLinks:14, hasSchema:false, titleHasKw:true, metaHasKw:false, h1HasKw:true, altHasKw:false, bodyHasKw:true, searchPresence:48, h2Count:8, h3Count:12},
    {rank:10, domain:'pcmag.com', wordCount:2200, keywordDensity:1.4, keywordSignal:3, technicalScore:3, altCoverage:72, internalLinks:82, externalLinks:16, hasSchema:false, titleHasKw:true, metaHasKw:false, h1HasKw:true, altHasKw:false, bodyHasKw:true, searchPresence:51, h2Count:7, h3Count:10},
  ],
  generated_schema: {
    type: 'Product',
    json_ld: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Buy Laptops Today | Best Deals",
      "description": "Find the best cheap laptops with amazing deals and fast shipping.",
      "url": "https://example.com/laptops",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": "<!-- ADD PRICE -->",
        "availability": "https://schema.org/InStock",
        "url": "https://example.com/laptops"
      }
    }, null, 2),
    script_tag: '<script type="application/ld+json">\n{ "@type": "Product" }\n</script>',
  },
  serpFeatures: [
    {
      feature: 'Featured Snippet', icon: 'snippet', present: true, traffic_impact: 'high',
      recommendation: 'Add a direct-answer paragraph immediately after your first H2. Answer concisely in 40–60 words, then expand with detail. Use a definition, list, or table format.',
    },
    {
      feature: 'People Also Ask', icon: 'paa', present: true, traffic_impact: 'high',
      recommendation: 'Add an FAQ section answering these exact questions. Mark it up with FAQPage schema so your answers can appear directly inside the PAA box without a click.',
      details: { questions: ['What is the best cheap laptop?', 'Is a $300 laptop good enough?', 'What should I look for in a budget laptop?', 'Which cheap laptop has the best battery?'] },
    },
    {
      feature: 'Image Pack', icon: 'images', present: true, traffic_impact: 'medium',
      recommendation: 'Add 3–5 high-quality images with descriptive filenames (keyword-phrase.jpg) and alt text containing the keyword. Submit an image sitemap.',
    },
    {
      feature: 'Paid Ads', icon: 'ads', present: true, traffic_impact: 'info',
      recommendation: '4 paid ads occupy the top of SERP. High commercial intent- your organic content must offer more depth than ads. Consider a comparison or "best of" page.',
    },
  ],
  suggestions: [
    {rank:1, impact:'high', pct:92, fix:'Add your target keyword to the meta description', why:"Your meta description doesn't mention the keyword and is too short at 78 characters. A keyword-rich description of 120–160 chars improves click-through rate."},
    {rank:2, impact:'high', pct:85, fix:'Include your target keyword in the page title', why:"The title doesn't contain the exact phrase. Placing the keyword early in the title is one of the strongest on-page signals."},
    {rank:3, impact:'med',  pct:68, fix:'Expand your page content to at least 2,000 words', why:'At 1,250 words you\'re below the typical threshold. Top-ranking pages for this query average 2,000+ words.'},
    {rank:4, impact:'med',  pct:54, fix:'Add structured data (schema markup) to your page', why:'No schema is detected. Adding Product or Article schema enables rich results in Google Search.'},
  ],
  roadmapTasks: [
    {id:1, priority:'critical', category:'Metadata', effort:'Easy', time:'~10 min', posGain:{min:5,max:9}, impactPct:95, title:'Add your keyword to the meta description', desc:"Your meta description doesn't mention the keyword and is only 78 characters- well below the 120–160 char target. Rewrite it to include the keyword naturally.", status:'todo'},
    {id:2, priority:'critical', category:'Metadata', effort:'Easy', time:'~5 min', posGain:{min:4,max:7}, impactPct:88, title:'Place your keyword in the page title', desc:"Your title does not contain the target keyword. Rewrite it to include the phrase and aim for 50–60 characters.", status:'todo'},
    {id:3, priority:'high', category:'Structure', effort:'Easy', time:'~5 min', posGain:{min:3,max:6}, impactPct:78, title:'Add your keyword to the H1 heading', desc:"Your H1 doesn't include the exact phrase. A small rewrite places the keyword in the most prominent on-page signal.", status:'todo'},
    {id:4, priority:'high', category:'Content', effort:'Hard', time:'2–3 hours', posGain:{min:4,max:8}, impactPct:82, title:'Expand your content to at least 2,000 words', desc:"At 1,250 words you are below the competitive threshold for this keyword. Add depth: buying guides, comparison tables, FAQs.", status:'todo'},
    {id:5, priority:'high', category:'Technical', effort:'Medium', time:'~1 hour', posGain:{min:3,max:5}, impactPct:72, title:'Add JSON-LD structured data (Product schema)', desc:'No schema markup is detected. Adding Product or Article schema unlocks rich results in Google Search.', status:'todo'},
    {id:6, priority:'high', category:'Structure', effort:'Easy', time:'~15 min', posGain:{min:2,max:4}, impactPct:62, title:'Weave your keyword into at least 2 subheadings', desc:'0 out of 5 H2 subheadings contain the target keyword. Naturally incorporating the phrase reinforces topic relevance.', status:'todo'},
    {id:7, priority:'medium', category:'Content', effort:'Easy', time:'~15 min', posGain:{min:1,max:3}, impactPct:48, title:'Add alt text to 4 images that are missing it', desc:'4 of your 18 images have no alt attribute. Alt text improves accessibility and gives keyword placement opportunities.', status:'todo'},
    {id:8, priority:'medium', category:'Links', effort:'Medium', time:'~30 min', posGain:{min:2,max:4}, impactPct:52, title:'Build internal links from other pages to this one', desc:'Strong pages on your site should link here using anchor text that includes the target keyword.', status:'todo'},
    {id:9, priority:'medium', category:'Metadata', effort:'Easy', time:'~5 min', posGain:{min:1,max:2}, impactPct:35, title:'Fix the page title length (currently 43 characters)', desc:"Your title is 43 chars- Google starts truncating below 50 characters. Expanding it maximises SERP display space.", status:'todo'},
    {id:10, priority:'medium', category:'Links', effort:'Easy', time:'~20 min', posGain:{min:1,max:2}, impactPct:38, title:'Add 3–5 relevant external links to authoritative sources', desc:'Linking out to high-authority sources signals topical trustworthiness to search engines.', status:'todo'},
    {id:11, priority:'low', category:'Content', effort:'Medium', time:'~45 min', posGain:{min:0,max:2}, impactPct:22, title:'Improve readability- break up dense text blocks', desc:'Readability score is 65/100. Breaking long paragraphs and using subheadings reduces bounce rate.', status:'todo'},
    {id:12, priority:'low', category:'Structure', effort:'Easy', time:'~15 min', posGain:{min:0,max:1}, impactPct:15, title:'Review heading hierarchy for logical flow', desc:'You have 12 H3 elements under 5 H2s. Ensure each H3 logically sits under its parent H2 topic.', status:'todo'},
  ]
}

/* Generate randomized audit for any other keyword */
function generateMockAudit(url, keyword) {
  const score = Math.floor(Math.random() * 45) + 35
  const rank  = Math.floor(Math.random() * 60) + 10
  const words = Math.floor(Math.random() * 1800) + 500
  const density = (Math.random() * 2 + 0.5).toFixed(1)
  return {
    seoScore: score,
    quality: score >= 70 ? 'HIGH' : score >= 50 ? 'MEDIUM' : 'LOW',
    predictedRank: rank,
    keywordCoverage: Math.floor(Math.random() * 3) + 1,
    technicalScore: Math.floor(Math.random() * 2) + 2,
    issuesFound: Math.floor(Math.random() * 5) + 1,
    checksPassed: Math.floor(Math.random() * 15) + 10,
    wordCount: words,
    keywordDensity: parseFloat(density),
    paragraphs: Math.floor(Math.random() * 12) + 4,
    readabilityScore: Math.floor(Math.random() * 40) + 45,
    altCoverage: Math.floor(Math.random() * 50) + 40,
    internalLinks: Math.floor(Math.random() * 80) + 20,
    externalLinks: Math.floor(Math.random() * 20) + 5,
    hasSchema: Math.random() > 0.6,
    pageTitle: `${keyword} | Your Site`,
    metaDescription: `Learn more about ${keyword}. We offer comprehensive guides and resources.`,
    h1: `Learn About ${keyword}`,
    h2Count: Math.floor(Math.random() * 8) + 2,
    h3Count: Math.floor(Math.random() * 15) + 3,
    canonical: url,
    indexStatus: 'index, follow',
    titleHasKw: Math.random() > 0.4,
    metaHasKw: Math.random() > 0.5,
    h1HasKw: Math.random() > 0.4,
    altHasKw: Math.random() > 0.3,
    bodyHasKw: true,
    competitors: SAMPLE_AUDIT_DATA.competitors.map(c => ({
      ...c,
      wordCount: Math.floor(c.wordCount * (0.7 + Math.random() * 0.6)),
    })),
    suggestions: SAMPLE_AUDIT_DATA.suggestions,
    roadmapTasks: SAMPLE_AUDIT_DATA.roadmapTasks.map(t => ({ ...t, status: 'todo' })),
    serpFeatures: [],
  }
}

async function mockGenerateAudit({ url, keyword }) {
  await delay(2000) // simulate ML pipeline
  const isDemo = keyword.toLowerCase().includes('cheap laptop') || keyword.toLowerCase().includes('buy cheap laptop')
  const data   = isDemo ? { ...SAMPLE_AUDIT_DATA } : generateMockAudit(url, keyword)
  const audit  = {
    id:        `audit_${Date.now()}`,
    url,
    keyword,
    createdAt: new Date().toISOString(),
    ...data,
  }
  const audits = storage.get('rankly.audits', {})
  audits[audit.id] = audit
  storage.set('rankly.audits', audits)
  return audit
}

async function mockGetAudit(id) {
  await delay(60)
  const audits = storage.get('rankly.audits', {})
  const audit  = audits[id]
  if (!audit) throw new Error(`Audit ${id} not found`)
  return audit
}

async function mockGetHistory() {
  await delay(80)
  const audits = storage.get('rankly.audits', {})
  return Object.values(audits).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

async function mockDeleteAudit(id) {
  await delay(40)
  const audits = storage.get('rankly.audits', {})
  delete audits[id]
  storage.set('rankly.audits', audits)
}

async function mockGetCannibalization() {
  await delay(60)
  const audits = Object.values(storage.get('rankly.audits', {}))
  const byKw = {}
  for (const a of audits) {
    const kw = (a.keyword || '').toLowerCase().trim()
    if (!byKw[kw]) byKw[kw] = []
    byKw[kw].push(a)
  }
  const conflicts = []
  for (const group of Object.values(byKw)) {
    const urlBest = {}
    for (const a of group) {
      if (!urlBest[a.url]) urlBest[a.url] = a
    }
    if (Object.keys(urlBest).length < 2) continue
    conflicts.push({
      keyword: group[0].keyword,
      pages: Object.values(urlBest).map(a => ({
        id: a.id, url: a.url,
        quality: a.quality || 'Unknown',
        score: a.seoScore || 0,
      }))
    })
  }
  return { conflicts, count: conflicts.length }
}

async function mockAbScore(auditId, variants) {
  await delay(1400)
  const audits  = storage.get('rankly.audits', {})
  const audit   = audits[auditId] || {}
  const keyword = (audit.keyword || '').toLowerCase()

  const results = variants
    .filter(v => v.title || v.meta_description)
    .map((v, i) => {
      const title   = (v.title || audit.pageTitle || '').trim()
      const meta    = (v.meta_description || audit.metaDescription || '').trim()
      const tKw     = keyword && title.toLowerCase().includes(keyword)
      const mKw     = keyword && meta.toLowerCase().includes(keyword)
      const optT    = title.length >= 50 && title.length <= 60
      const optM    = meta.length >= 120 && meta.length <= 160
      const signals = [tKw, mKw, optT, optM].filter(Boolean).length
      const quality = signals >= 3 ? 'HIGH' : signals >= 2 ? 'MEDIUM' : 'LOW'
      const base    = quality === 'HIGH' ? 5 : quality === 'MEDIUM' ? 22 : 45
      const rank    = base + Math.floor(Math.random() * 10)
      return {
        variant: String.fromCharCode(65 + i), title, meta_description: meta,
        quality, predicted_rank: rank,
        title_length: title.length, meta_length: meta.length,
        title_has_kw: tKw, meta_has_kw: mKw,
        optimal_title: optT, optimal_meta: optM,
      }
    })
    .sort((a, b) => {
      const qr = { HIGH: 0, MEDIUM: 1, LOW: 2 }
      return (qr[a.quality] ?? 2) - (qr[b.quality] ?? 2) || a.predicted_rank - b.predicted_rank
    })

  return { results, keyword: audit.keyword || '' }
}

async function mockStartBulkAudit({ keyword, sitemap_url, urls }) {
  await delay(300)
  const list = (urls || []).slice(0, 50)
  if (sitemap_url) {
    list.unshift(sitemap_url.replace(/sitemap.*\.xml.*$/, ''), sitemap_url.replace(/sitemap.*$/, 'about'), sitemap_url.replace(/sitemap.*$/, 'contact'))
  }
  const jobId = `job_${Math.random().toString(36).slice(2, 9)}`
  const total = Math.max(list.length, 3)
  // Simulate progress over time using shared state
  const job = { job_id: jobId, keyword, total, completed: 0, failed: 0, done: false, results: [], errors: [] }
  _bulkJobs[jobId] = job
  // Kick off async simulation
  ;(async () => {
    const qualities = ['HIGH', 'MEDIUM', 'LOW', 'MEDIUM', 'HIGH']
    const fakeUrls  = list.length >= 3 ? list : [
      'https://example.com/', 'https://example.com/about', 'https://example.com/blog',
      'https://example.com/contact', 'https://example.com/services',
    ]
    for (let i = 0; i < total; i++) {
      await new Promise(r => setTimeout(r, 900 + Math.random() * 600))
      const q = qualities[i % qualities.length]
      const score = q === 'HIGH' ? 80 + Math.floor(Math.random() * 15) : q === 'MEDIUM' ? 55 + Math.floor(Math.random() * 20) : 25 + Math.floor(Math.random() * 25)
      job.results.push({
        url: fakeUrls[i] || `https://example.com/page-${i + 1}`,
        audit_id: null, seo_score: score, quality: q,
        predicted_rank: q === 'HIGH' ? 3 + Math.floor(Math.random() * 10) : q === 'MEDIUM' ? 15 + Math.floor(Math.random() * 20) : 40 + Math.floor(Math.random() * 20),
        issues: Math.floor(Math.random() * 8), word_count: 400 + Math.floor(Math.random() * 1200),
        has_schema: Math.random() > 0.6, title_has_kw: Math.random() > 0.3,
      })
      job.completed = i + 1
    }
    job.done = true
  })()
  return { job_id: jobId, total, keyword }
}

const _bulkJobs = {}

async function mockGetBulkJob(jobId) {
  await delay(80)
  return _bulkJobs[jobId] || { error: 'not found' }
}

async function mockGenerateBrief(auditId) {
  await delay(2800)
  const audit   = storage.get('rankly.audits', {})[auditId] || {}
  const keyword = audit.keyword || 'target keyword'
  const url     = audit.url     || 'https://example.com'
  return {
    keyword, url, model: 'gemini-2.0-flash',
    title_suggestion:       `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}: The Complete Guide for 2026`,
    meta_description:       `Discover everything about ${keyword} in this comprehensive guide. Learn best practices, tips, and strategies to improve your results in 2026.`,
    summary:                `This page targets "${keyword}" and needs deeper topical coverage to compete with top-ranking pages. Focus on answering PAA questions with direct answers and expanding the word count to match competitors. Adding structured FAQ schema will help capture the People Also Ask box.`,
    word_count_target:      1600,
    keyword_density_target: 1.4,
    outline: [
      { level: 'h2', heading: `What is ${keyword}?`, notes: 'Clear definition in the first paragraph. Include keyword in the first 100 words.' },
      { level: 'h3', heading: `Why ${keyword} matters in 2026`, notes: 'Highlight current relevance, statistics, recent changes.' },
      { level: 'h2', heading: `How to get started with ${keyword}`, notes: 'Step-by-step practical guide. Use a numbered list.' },
      { level: 'h3', heading: 'Common mistakes to avoid', notes: 'Address 3–5 mistakes. Great for time-on-page and featured snippet capture.' },
      { level: 'h2', heading: `Best ${keyword} tools and resources`, notes: 'Tool comparison table. Helps capture commercial intent queries.' },
      { level: 'h2', heading: `${keyword} best practices`, notes: 'Actionable checklist format. Good for featured snippet targeting.' },
      { level: 'h2', heading: 'Frequently Asked Questions', notes: 'Answer 4–5 PAA questions with direct concise answers. Add FAQPage schema.' },
      { level: 'h2', heading: 'Summary & Next Steps', notes: 'Brief recap, clear CTA to related content or service.' },
    ],
    entities:    [`${keyword} tools`, 'Google Search', 'SEO strategy', 'content marketing', 'SERP features'],
    questions:   [
      `What is ${keyword} and how does it work?`,
      `How do I improve my ${keyword} results?`,
      `What are the best ${keyword} tools in 2026?`,
      `How long does ${keyword} take to show results?`,
      `Is ${keyword} still worth investing in?`,
    ],
    content_gaps: [
      'Missing comparison table vs alternatives',
      'No case studies or data-backed examples',
      'FAQ section absent- competitors all have it',
    ],
    internal_link_notes: `Link to your main pillar page for "${keyword.split(' ')[0]}" from this article, and link back to this page from any closely related content on the same domain.`,
  }
}

async function mockGetLinkingSuggestions(domain) {
  await delay(900)
  const audits = Object.values(storage.get('rankly.audits', {}))
  const norm   = (u) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return u } }
  const pages  = audits.filter(a => norm(a.url || '') === domain.replace(/^www\./, ''))
  if (pages.length < 2) return { suggestions: [], page_count: pages.length, domain }

  const suggestions = []
  for (let i = 0; i < pages.length; i++) {
    for (let j = i + 1; j < pages.length; j++) {
      const sim = 50 + Math.floor(Math.random() * 40)
      if (sim < 45) continue
      const [src, tgt] = pages[i].internalLinks >= pages[j].internalLinks ? [pages[i], pages[j]] : [pages[j], pages[i]]
      suggestions.push({
        source_url: src.url, source_title: src.pageTitle || src.url, source_keyword: src.keyword,
        target_url: tgt.url, target_title: tgt.pageTitle || tgt.url, target_keyword: tgt.keyword,
        similarity: sim, target_links: tgt.internalLinks || 0,
        recommendation: `${sim}% semantic overlap- add a contextual link from the "${(src.keyword||'source').slice(0,30)}" page to the "${(tgt.keyword||'target').slice(0,30)}" page.`,
      })
    }
  }
  suggestions.sort((a, b) => b.similarity - a.similarity)
  return { suggestions: suggestions.slice(0, 8), page_count: pages.length, domain }
}

async function mockGetScoreHistory(url, keyword) {
  await delay(50)
  const audits   = Object.values(storage.get('rankly.audits', {}))
  const matching = audits
    .filter(a => a.url === url && (a.keyword || '').toLowerCase() === (keyword || '').toLowerCase())
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

  if (matching.length === 0) {
    // Synthesize a single-point history from the current audit data if nothing stored
    const any = audits.find(a => a.url === url)
    if (any) {
      return {
        history: [{ id: any.id, date: (any.createdAt || new Date().toISOString()).slice(0, 10), seo_score: any.seoScore || 60, quality: any.quality || 'MEDIUM', predicted_rank: any.predictedRank || 25 }],
        count: 1,
      }
    }
    return { history: [], count: 0 }
  }

  return {
    history: matching.map(a => ({
      id:             a.id,
      date:           (a.createdAt || new Date().toISOString()).slice(0, 10),
      seo_score:      a.seoScore || 60,
      quality:        a.quality || 'MEDIUM',
      predicted_rank: a.predictedRank || 25,
    })),
    count: matching.length,
  }
}

const _scheduleStore = {}  // in-memory mock store keyed by `${url}|||${keyword}`

async function mockGetScheduleFor(url, keyword) {
  await delay(40)
  return _scheduleStore[`${url}|||${keyword}`] || {}
}

async function mockCreateSchedule(url, keyword, frequency) {
  await delay(60)
  const id   = `sched_${Math.random().toString(36).slice(2, 9)}`
  const days = frequency === 'weekly' ? 7 : 30
  const next = new Date(Date.now() + days * 86400000).toISOString()
  const sched = { id, url, keyword, frequency, next_run_at: next, enabled: true }
  _scheduleStore[`${url}|||${keyword}`] = sched
  return sched
}

async function mockDeleteSchedule(id) {
  await delay(40)
  for (const k of Object.keys(_scheduleStore)) {
    if (_scheduleStore[k]?.id === id) { delete _scheduleStore[k]; break }
  }
  return { ok: true }
}

/* ─── Competitor watch mocks ──────────────────────────────────────── */
const _watchStore = {}  // key: `${url}|||${keyword}` → watch object

async function mockListWatches(keyword) {
  await delay(50)
  const all = Object.values(_watchStore)
  return { watches: keyword ? all.filter(w => w.keyword === keyword) : all }
}

async function mockCheckWatch(url, keyword) {
  await delay(35)
  const key   = `${url}|||${keyword}`
  const watch = _watchStore[key] || null
  return { watching: !!watch, watch }
}

async function mockAddWatch({ url, keyword, source_audit_id, initial_title, initial_word_count }) {
  await delay(60)
  const key = `${url}|||${keyword}`
  if (_watchStore[key]) return { watch: _watchStore[key] }
  const watch = {
    id:               `w_${Math.random().toString(36).slice(2, 9)}`,
    competitor_url:   url,
    keyword,
    source_audit_id:  source_audit_id || null,
    last_title:       initial_title || null,
    last_word_count:  initial_word_count || null,
    last_checked_at:  new Date().toISOString(),
    created_at:       new Date().toISOString(),
  }
  _watchStore[key] = watch
  return { watch }
}

async function mockRemoveWatch(id) {
  await delay(40)
  for (const k of Object.keys(_watchStore)) {
    if (_watchStore[k]?.id === id) { delete _watchStore[k]; break }
  }
  return { deleted: id }
}

/* ─── Developer API key mocks ─────────────────────────────────────── */
const _apiKeyStore = {}   // id → key record

async function mockListApiKeys() {
  await delay(50)
  return { keys: Object.values(_apiKeyStore) }
}

async function mockCreateApiKey({ name }) {
  await delay(80)
  const id  = `kid_${Math.random().toString(36).slice(2, 9)}`
  const key = `rkly_${Array.from({length:40},()=>'0123456789abcdef'[Math.floor(Math.random()*16)]).join('')}`
  const record = {
    id,
    name:         name || 'My API Key',
    key_prefix:   key.slice(0, 12),
    created_at:   new Date().toISOString(),
    last_used_at: null,
    revoked:      false,
  }
  _apiKeyStore[id] = record
  return { key, record, note: 'Store this key securely- it will not be shown again.' }
}

async function mockRevokeApiKey(id) {
  await delay(40)
  delete _apiKeyStore[id]
  return { revoked: id }
}

async function mockUpdateTaskStatus(auditId, taskId, status) {
  await delay(30)
  const audits = storage.get('rankly.audits', {})
  const audit  = audits[auditId]
  if (!audit) throw new Error(`Audit ${auditId} not found`)
  audit.roadmapTasks = audit.roadmapTasks.map(t =>
    t.id === taskId ? { ...t, status } : t
  )
  audits[auditId] = audit
  storage.set('rankly.audits', audits)
  return audit
}

/* ═══════════════════════════════════════════════════════════
   PUBLIC API- the only interface service files call
   ═══════════════════════════════════════════════════════════ */
export const api = {
  /* --- Auth --- */
  login:          USE_MOCK ? mockLogin          : authService.login,
  register:       USE_MOCK ? mockRegister       : authService.register,
  logout:         USE_MOCK ? mockLogout         : authService.logout,
  getCurrentUser: USE_MOCK ? mockGetCurrentUser : () => storage.get('rankly.currentUser'),

  /* --- Audits --- */
  generateAudit:  USE_MOCK ? mockGenerateAudit  : async (p) => {
    const res = await http('POST', '/api/audit/generate', p)
    return normalizeAudit(res)
  },
  getAudit:       USE_MOCK ? mockGetAudit        : async (id) => {
    const res = await http('GET', `/api/audit/${id}`)
    return normalizeAudit(res)
  },

  /* --- History --- */
  getHistory:     USE_MOCK ? mockGetHistory      : async () => {
    const res = await http('GET', '/api/history')
    return res.map(normalizeAudit)
  },
  deleteAudit:          USE_MOCK ? mockDeleteAudit         : (id) => http('DELETE', `/api/audit/${id}`),
  getCannibalization:   USE_MOCK ? mockGetCannibalization  : () => http('GET', '/api/audit/cannibalization'),
  abScore:             USE_MOCK ? mockAbScore              : (id, variants) => http('POST', `/api/audit/${id}/ab-score`, { variants }),

  /* --- Bulk Audit --- */
  startBulkAudit: USE_MOCK ? mockStartBulkAudit : (body) => http('POST', '/api/audit/bulk', body),
  getBulkJob:     USE_MOCK ? mockGetBulkJob      : (id)   => http('GET',  `/api/audit/bulk/${id}`),

  /* --- Content Brief --- */
  generateBrief: USE_MOCK ? mockGenerateBrief : (id) => http('POST', `/api/audit/${id}/brief`),

  /* --- Internal Linking --- */
  getLinkingSuggestions: USE_MOCK ? mockGetLinkingSuggestions : (domain) => http('GET', `/api/domain/linking-suggestions?domain=${encodeURIComponent(domain)}`),

  /* --- Score Timeline & Scheduling --- */
  getScoreHistory:  USE_MOCK ? mockGetScoreHistory  : (url, kw)    => http('GET', `/api/audit/score-history?url=${encodeURIComponent(url)}&keyword=${encodeURIComponent(kw)}`),
  getScheduleFor:   USE_MOCK ? mockGetScheduleFor   : (url, kw)    => http('GET', `/api/audit/schedule/for?url=${encodeURIComponent(url)}&keyword=${encodeURIComponent(kw)}`),
  createSchedule:   USE_MOCK ? mockCreateSchedule   : (url, kw, f) => http('POST', '/api/audit/schedule', { url, keyword: kw, frequency: f }),
  deleteSchedule:   USE_MOCK ? mockDeleteSchedule   : (id)         => http('DELETE', `/api/audit/schedule/${id}`),

  /* --- Developer API Keys --- */
  listApiKeys:   USE_MOCK ? mockListApiKeys   : ()       => http('GET',    '/api/developer/keys'),
  createApiKey:  USE_MOCK ? mockCreateApiKey  : (body)   => http('POST',   '/api/developer/keys', body),
  revokeApiKey:  USE_MOCK ? mockRevokeApiKey  : (id)     => http('DELETE', `/api/developer/keys/${id}`),

  /* --- Competitor Watch --- */
  listWatches:   USE_MOCK ? mockListWatches  : (keyword) => http('GET', `/api/competitors/watch${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}`),
  checkWatch:    USE_MOCK ? mockCheckWatch   : (url, kw) => http('GET', `/api/competitors/watch/check?url=${encodeURIComponent(url)}&keyword=${encodeURIComponent(kw)}`),
  addWatch:      USE_MOCK ? mockAddWatch     : (body)    => http('POST', '/api/competitors/watch', body),
  removeWatch:   USE_MOCK ? mockRemoveWatch  : (id)      => http('DELETE', `/api/competitors/watch/${id}`),

  /* --- Roadmap --- */
  updateTaskStatus: USE_MOCK
    ? mockUpdateTaskStatus
    : async (auditId, taskId, status) => {
        // PATCH returns the updated task directly- no second round-trip needed
        return http('PATCH', `/api/roadmap/${auditId}/task/${taskId}`, { status })
      },

  /* --- Storage helpers --- */
  _storage: storage,
}
