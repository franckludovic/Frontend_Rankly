import { Zap } from 'lucide-react'

const FIXES = {
  https:         { title: 'Switch to HTTPS',          fix: 'Get a free SSL cert from Let\'s Encrypt and redirect all HTTP traffic.' },
  viewport:      { title: 'Add Viewport Meta Tag',    fix: 'Insert <meta name="viewport" content="width=device-width, initial-scale=1"> in your <head>.' },
  title_missing: { title: 'Add a Page Title',         fix: 'Write a <title> tag (50-60 chars) that starts with your target keyword.' },
  title_kw:      { title: 'Put Keyword in Title',     fix: `Move your target keyword to the beginning of the <title> tag.` },
  meta_missing:  { title: 'Write a Meta Description', fix: 'Add <meta name="description"> - 120-160 chars including your keyword.' },
  meta_kw:       { title: 'Add Keyword to Meta Desc', fix: 'Rewrite your meta description to naturally include your target keyword once.' },
  meta_short:    { title: 'Lengthen Meta Description',fix: 'Expand your meta description to at least 120 characters.' },
  meta_long:     { title: 'Shorten Meta Description', fix: 'Trim your meta description to under 160 characters or Google will cut it.' },
  thin:          { title: 'Expand Thin Content',      fix: 'Aim for 1,000+ words. Cover subtopics your competitors rank for too.' },
  canonical:     { title: 'Add Canonical Tag',        fix: 'Add <link rel="canonical" href="your-url"> to prevent duplicate content penalties.' },
  schema:        { title: 'Add Schema Markup',        fix: 'Add JSON-LD structured data. Use schema.org/Article or schema.org/Product.' },
}

function buildWins(scrapedData, keyword) {
  if (!scrapedData) return []

  const title    = scrapedData.title    ?? ''
  const metaDesc = scrapedData.metaDesc ?? ''
  const isHttps  = scrapedData.isHttps  ?? true
  const viewport = scrapedData.viewport ?? true
  const wordCount= scrapedData.wordCount ?? 0
  const canonical= scrapedData.canonical ?? ''
  const hasSchema= scrapedData.hasSchema ?? false
  const kw       = (keyword || '').toLowerCase()

  const wins = []

  // Critical first
  if (!isHttps)   wins.push({ ...FIXES.https,         sev: 'Critical' })
  if (!viewport)  wins.push({ ...FIXES.viewport,      sev: 'Critical' })
  if (!title)     wins.push({ ...FIXES.title_missing, sev: 'Critical' })
  else if (kw && !title.toLowerCase().includes(kw))
                  wins.push({ ...FIXES.title_kw,      sev: 'Critical', fix: `Move "${keyword}" to the beginning of your <title> tag.` })

  // High
  if (!metaDesc)  wins.push({ ...FIXES.meta_missing,  sev: 'High' })
  else {
    if (kw && !metaDesc.toLowerCase().includes(kw))
                  wins.push({ ...FIXES.meta_kw,        sev: 'High', fix: `Include "${keyword}" naturally once in your meta description.` })
    if (metaDesc.length < 120)
                  wins.push({ ...FIXES.meta_short,     sev: 'High' })
    else if (metaDesc.length > 160)
                  wins.push({ ...FIXES.meta_long,      sev: 'Medium' })
  }

  if (wordCount > 0 && wordCount < 500)
                  wins.push({ ...FIXES.thin,           sev: 'High' })

  // Medium
  if (!canonical) wins.push({ ...FIXES.canonical,     sev: 'Medium' })
  if (!hasSchema) wins.push({ ...FIXES.schema,        sev: 'Medium' })

  return wins.slice(0, 3)
}

const SEV_COLOR = { Critical: 'var(--red)', High: 'var(--amber)', Medium: 'var(--indigo)' }

export default function ExtensionRoadmap({ scrapedData, keyword, auditMode }) {
  const wins = buildWins(scrapedData, keyword)
  if (!wins.length) return null

  return (
    <div className="section">
      <div className="section-lbl">
        <Zap size={8} strokeWidth={2.5} style={{ display:'inline',marginRight:4,verticalAlign:'middle' }} />
        Quick Wins - Fix These First
      </div>
      <div className="qw-list">
        {wins.map((w, i) => (
          <div key={i} className="qw-item">
            <div className="qw-num" style={{ color: SEV_COLOR[w.sev] }}>{i + 1}</div>
            <div className="qw-body">
              <div className="qw-title">{w.title}</div>
              <div className="qw-fix">{w.fix}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
