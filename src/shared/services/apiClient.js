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
 * functions from here — you NEVER need to change the service
 * files when switching backends.
 * ─────────────────────────────────────────────────────────────
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'
const BASE_URL  = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

import { useAuthStore } from '../../store/authSlice.js'

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

/* ─── Real HTTP helper ───────────────────────────────────── */
async function http(method, path, body) {
  const token = storage.get('rankly.token')
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
      storage.set('rankly.token', null)
      storage.set('rankly.currentUser', null)
      useAuthStore.getState().logout()
      window.location.href = '/login?expired=true'
      throw new Error('Session expired')
    }
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `HTTP ${res.status}`)
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
  suggestions: [
    {rank:1, impact:'high', pct:92, fix:'Add your target keyword to the meta description', why:"Your meta description doesn't mention the keyword and is too short at 78 characters. A keyword-rich description of 120–160 chars improves click-through rate."},
    {rank:2, impact:'high', pct:85, fix:'Include your target keyword in the page title', why:"The title doesn't contain the exact phrase. Placing the keyword early in the title is one of the strongest on-page signals."},
    {rank:3, impact:'med',  pct:68, fix:'Expand your page content to at least 2,000 words', why:'At 1,250 words you\'re below the typical threshold. Top-ranking pages for this query average 2,000+ words.'},
    {rank:4, impact:'med',  pct:54, fix:'Add structured data (schema markup) to your page', why:'No schema is detected. Adding Product or Article schema enables rich results in Google Search.'},
  ],
  roadmapTasks: [
    {id:1, priority:'critical', category:'Metadata', effort:'Easy', time:'~10 min', posGain:{min:5,max:9}, impactPct:95, title:'Add your keyword to the meta description', desc:"Your meta description doesn't mention the keyword and is only 78 characters — well below the 120–160 char target. Rewrite it to include the keyword naturally.", status:'todo'},
    {id:2, priority:'critical', category:'Metadata', effort:'Easy', time:'~5 min', posGain:{min:4,max:7}, impactPct:88, title:'Place your keyword in the page title', desc:"Your title does not contain the target keyword. Rewrite it to include the phrase and aim for 50–60 characters.", status:'todo'},
    {id:3, priority:'high', category:'Structure', effort:'Easy', time:'~5 min', posGain:{min:3,max:6}, impactPct:78, title:'Add your keyword to the H1 heading', desc:"Your H1 doesn't include the exact phrase. A small rewrite places the keyword in the most prominent on-page signal.", status:'todo'},
    {id:4, priority:'high', category:'Content', effort:'Hard', time:'2–3 hours', posGain:{min:4,max:8}, impactPct:82, title:'Expand your content to at least 2,000 words', desc:"At 1,250 words you are below the competitive threshold for this keyword. Add depth: buying guides, comparison tables, FAQs.", status:'todo'},
    {id:5, priority:'high', category:'Technical', effort:'Medium', time:'~1 hour', posGain:{min:3,max:5}, impactPct:72, title:'Add JSON-LD structured data (Product schema)', desc:'No schema markup is detected. Adding Product or Article schema unlocks rich results in Google Search.', status:'todo'},
    {id:6, priority:'high', category:'Structure', effort:'Easy', time:'~15 min', posGain:{min:2,max:4}, impactPct:62, title:'Weave your keyword into at least 2 subheadings', desc:'0 out of 5 H2 subheadings contain the target keyword. Naturally incorporating the phrase reinforces topic relevance.', status:'todo'},
    {id:7, priority:'medium', category:'Content', effort:'Easy', time:'~15 min', posGain:{min:1,max:3}, impactPct:48, title:'Add alt text to 4 images that are missing it', desc:'4 of your 18 images have no alt attribute. Alt text improves accessibility and gives keyword placement opportunities.', status:'todo'},
    {id:8, priority:'medium', category:'Links', effort:'Medium', time:'~30 min', posGain:{min:2,max:4}, impactPct:52, title:'Build internal links from other pages to this one', desc:'Strong pages on your site should link here using anchor text that includes the target keyword.', status:'todo'},
    {id:9, priority:'medium', category:'Metadata', effort:'Easy', time:'~5 min', posGain:{min:1,max:2}, impactPct:35, title:'Fix the page title length (currently 43 characters)', desc:"Your title is 43 chars — Google starts truncating below 50 characters. Expanding it maximises SERP display space.", status:'todo'},
    {id:10, priority:'medium', category:'Links', effort:'Easy', time:'~20 min', posGain:{min:1,max:2}, impactPct:38, title:'Add 3–5 relevant external links to authoritative sources', desc:'Linking out to high-authority sources signals topical trustworthiness to search engines.', status:'todo'},
    {id:11, priority:'low', category:'Content', effort:'Medium', time:'~45 min', posGain:{min:0,max:2}, impactPct:22, title:'Improve readability — break up dense text blocks', desc:'Readability score is 65/100. Breaking long paragraphs and using subheadings reduces bounce rate.', status:'todo'},
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
   PUBLIC API — the only interface service files call
   ═══════════════════════════════════════════════════════════ */
export const api = {
  /* --- Auth --- */
  login:          USE_MOCK ? mockLogin          : async (p) => {
    const res = await http('POST', '/api/auth/login', p)
    if (res.token) {
      storage.set('rankly.token', res.token)
      storage.set('rankly.currentUser', res.user)
    }
    return res
  },
  register:       USE_MOCK ? mockRegister       : async (p) => {
    const res = await http('POST', '/api/auth/register', p)
    if (res.token) {
      storage.set('rankly.token', res.token)
      storage.set('rankly.currentUser', res.user)
    }
    return res
  },
  logout:         USE_MOCK ? mockLogout         : async () => {
    try {
      await http('POST', '/api/auth/logout')
    } finally {
      storage.set('rankly.token', null)
      storage.set('rankly.currentUser', null)
    }
  },
  getCurrentUser: USE_MOCK ? mockGetCurrentUser : ()  => http('GET',  '/api/auth/me'),

  /* --- Audits --- */
  generateAudit:  USE_MOCK ? mockGenerateAudit  : (p) => http('POST', '/api/audit/generate', p),
  getAudit:       USE_MOCK ? mockGetAudit        : (id) => http('GET', `/api/audit/${id}`),

  /* --- History --- */
  getHistory:     USE_MOCK ? mockGetHistory      : ()   => http('GET', '/api/history'),
  deleteAudit:    USE_MOCK ? mockDeleteAudit     : (id) => http('DELETE', `/api/audit/${id}`),

  /* --- Roadmap --- */
  updateTaskStatus: USE_MOCK
    ? mockUpdateTaskStatus
    : (auditId, taskId, status) => http('PATCH', `/api/roadmap/${auditId}/task/${taskId}`, { status }),

  /* --- Storage helpers --- */
  _storage: storage,
}
