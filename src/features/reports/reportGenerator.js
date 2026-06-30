/**
 * Generates and opens a print-to-PDF report for a full Rankly audit.
 * Accepts the flat `currentAudit` object from auditSlice.
 */
export function printSeoReport(audit) {
  const html = buildReportHtml(audit)
  const win  = window.open('', '_blank')
  if (!win) { alert('Enable pop-ups to download/print the SEO report.'); return }
  win.document.write(html)
  win.document.close()
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')

const qualLabel = q => q === 'HIGH' ? 'High Quality' : q === 'MEDIUM' ? 'Medium Quality' : 'Low Quality'

const qualTeal  = q => q === 'HIGH' ? '#0d9488' : q === 'MEDIUM' ? '#d97706' : '#dc2626'
const qualLight = q => q === 'HIGH' ? '#f0fdf4' : q === 'MEDIUM' ? '#fffbeb' : '#fef2f2'
const qualBorder= q => q === 'HIGH' ? '#86efac' : q === 'MEDIUM' ? '#fde68a' : '#fca5a5'

const badge = (ok, yes = 'Pass', no = 'Fail') =>
  ok ? `<span class="b-pass">${yes}</span>` : `<span class="b-fail">${no}</span>`

const warn = (ok, yes = 'Pass', no = 'Warning') =>
  ok ? `<span class="b-pass">${yes}</span>` : `<span class="b-warn">${no}</span>`

const impactLabel = level =>
  level === 'HIGH'   ? `<span class="b-high">High Impact</span>`
  : level === 'MEDIUM' ? `<span class="b-med">Med Impact</span>`
  : `<span class="b-low">Low Impact</span>`

/** SVG donut ring for the SEO score- drawn in pure SVG, print-safe */
function scoreRing(score) {
  const r       = 52
  const cx      = 68
  const cy      = 68
  const circ    = 2 * Math.PI * r          // ≈ 326.7
  const filled  = (score / 100) * circ
  const gap     = circ - filled
  const color   = score >= 70 ? '#0d9488' : score >= 45 ? '#d97706' : '#dc2626'
  const bg      = score >= 70 ? '#e6faf8' : score >= 45 ? '#fef9e7' : '#fef2f2'

  return `
  <div class="score-ring-wrap" style="background:${bg}">
    <svg width="136" height="136" viewBox="0 0 136 136" style="display:block;">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e2e8f0" stroke-width="10"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
        stroke="${color}" stroke-width="10" stroke-linecap="round"
        stroke-dasharray="${filled} ${gap}"
        transform="rotate(-90 ${cx} ${cy})"/>
    </svg>
    <div class="score-ring-inner">
      <div class="score-num" style="color:${color}">${score}</div>
      <div class="score-lbl">/ 100</div>
    </div>
  </div>`
}

// ─── main HTML builder ────────────────────────────────────────────────────────

function buildReportHtml(a) {
  const domain    = (() => { try { return new URL(a.url).hostname } catch { return a.url } })()
  const dateStr   = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
  const score     = a.seoScore    ?? 0
  const quality   = a.quality     ?? 'LOW'
  const rank      = a.predictedRank ?? '-'
  const kwCov     = a.keywordCoverage ?? 0
  const techScore = a.technicalScore  ?? 0
  const issuesCt  = a.issuesFound     ?? 0
  const checksCt  = a.checksPassed    ?? 0
  const kwDensity = typeof a.keywordDensity === 'number' ? a.keywordDensity.toFixed(1) + '%' : '-'
  const readability = a.readabilityScore ?? '-'

  const suggestions  = (a.suggestions  || []).slice(0, 10)
  const roadmap      = (a.roadmapTasks || []).slice(0, 8)
  const competitors  = (a.competitors  || []).slice(0, 6)

  // ── on-page checks ──
  const onPageRows = [
    { name: 'HTTPS / SSL',        html: badge(a.isHttps ?? true),                           detail: (a.isHttps ?? true) ? 'Secure connection confirmed' : 'Page served over insecure HTTP' },
    { name: 'Mobile Viewport',     html: badge(a.viewport ?? true),                          detail: (a.viewport ?? true) ? 'Viewport meta tag present' : 'Viewport meta tag missing' },
    { name: 'Title Tag',           html: badge(!!a.pageTitle),                               detail: a.pageTitle ? esc(a.pageTitle.substring(0, 90)) : 'No title tag found' },
    { name: 'Keyword in Title',    html: badge(a.titleHasKw),                                detail: a.titleHasKw ? `"${esc(a.keyword)}" found in title` : `"${esc(a.keyword)}" missing from title` },
    { name: 'Meta Description',    html: warn(!!a.metaDescription, 'Present', 'Missing'),    detail: a.metaDescription ? esc(a.metaDescription.substring(0, 110)) + (a.metaDescription.length > 110 ? '…' : '') : 'No meta description' },
    { name: 'Keyword in Meta',     html: badge(a.metaHasKw),                                 detail: a.metaHasKw ? 'Keyword present in meta description' : 'Keyword absent from meta description' },
    { name: 'H1 Heading',         html: badge(!!a.h1),                                      detail: a.h1 ? esc(a.h1.substring(0, 80)) : 'No H1 tag found' },
    { name: 'Keyword in H1',       html: badge(a.h1HasKw),                                   detail: a.h1HasKw ? 'Keyword in H1' : 'H1 does not contain target keyword' },
    { name: 'Canonical Tag',       html: warn(!!a.canonical, 'Set', 'Missing'),             detail: a.canonical ? esc(a.canonical) : 'No canonical link declared' },
    { name: 'Schema Markup',       html: warn(a.hasSchema, 'Present', 'Missing'),           detail: a.hasSchema ? 'JSON-LD structured data found' : 'No structured data- rich results blocked' },
    { name: 'Image Alt Coverage',  html: warn((a.altCoverage ?? 100) >= 80, `${a.altCoverage ?? '-'}%`, `${a.altCoverage ?? '-'}%`), detail: `${a.altCoverage ?? '-'}% of images have alt attributes` },
    { name: 'Index Status',        html: warn(a.indexStatus !== 'noindex', 'Indexable', 'Noindex'), detail: a.indexStatus || 'Indexable- visible to search engines' },
  ].map(r => `
    <tr>
      <td class="ck-name">${esc(r.name)}</td>
      <td style="white-space:nowrap">${r.html}</td>
      <td class="ck-detail">${r.detail}</td>
    </tr>`).join('')

  // ── suggestions ──
  const suggHTML = suggestions.length
    ? suggestions.map((s, i) => `
      <div class="sg">
        <div class="sg-num">${i + 1}</div>
        <div class="sg-body">
          <div class="sg-fix">${esc(s.fix || s.title || '')}</div>
          ${s.why ? `<div class="sg-why">${esc(s.why)}</div>` : ''}
        </div>
        <div>${impactLabel(s.impact || 'MEDIUM')}</div>
      </div>`).join('')
    : '<p class="empty-msg">All checks passed- no issues found.</p>'

  // ── roadmap ──
  const rdmHTML = roadmap.length
    ? roadmap.map(t => {
        const pri   = t.priority || 'MEDIUM'
        const color = pri === 'CRITICAL' ? '#dc2626' : pri === 'HIGH' ? '#d97706' : '#0d9488'
        return `
        <div class="rd">
          <div class="rd-dot" style="background:${color}"></div>
          <div class="rd-body">
            <div class="rd-title">${esc(t.title || t.task || '')}</div>
            ${t.description ? `<div class="rd-desc">${esc(t.description)}</div>` : ''}
          </div>
          <span class="rd-pri" style="color:${color};border-color:${color}20;background:${color}0d">${esc(pri)}</span>
        </div>`}).join('')
    : ''

  // ── competitor table ──
  const compHTML = competitors.length ? `
    <div class="section" style="page-break-before:always">
      <div class="sec-title">Competitor Benchmark- Top ${competitors.length} SERP Pages</div>
      <table class="comp-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Domain</th>
            <th>Words</th>
            <th>KW Density</th>
            <th>Tech</th>
            <th>Schema</th>
            <th>Int. Links</th>
          </tr>
        </thead>
        <tbody>
          ${competitors.map((c, i) => `
          <tr ${i === 0 ? 'class="comp-top"' : ''}>
            <td class="comp-rank">${c.rank || i + 1}</td>
            <td class="comp-domain">${esc(c.domain || c.url || '-')}</td>
            <td class="comp-val">${(c.wordCount || 0).toLocaleString()}</td>
            <td class="comp-val">${typeof c.keywordDensity === 'number' ? c.keywordDensity.toFixed(1) + '%' : '-'}</td>
            <td class="comp-val">${c.technicalScore ?? '-'}/5</td>
            <td class="comp-val">${c.hasSchema ? '✓' : '✗'}</td>
            <td class="comp-val">${c.internalLinks ?? '-'}</td>
          </tr>`).join('')}
          <tr class="comp-you">
            <td class="comp-rank">YOU</td>
            <td class="comp-domain">${esc(domain)}</td>
            <td class="comp-val" style="font-weight:700">${(a.wordCount || 0).toLocaleString()}</td>
            <td class="comp-val" style="font-weight:700">${kwDensity}</td>
            <td class="comp-val" style="font-weight:700">${techScore}/5</td>
            <td class="comp-val" style="font-weight:700">${a.hasSchema ? '✓' : '✗'}</td>
            <td class="comp-val" style="font-weight:700">${a.internalLinks ?? '-'}</td>
          </tr>
        </tbody>
      </table>
    </div>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SEO Report- ${esc(domain)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: #f0f4f8;
    color: #1e293b;
    font-size: 13px;
    line-height: 1.5;
    padding: 28px 16px 48px;
  }

  .page {
    max-width: 860px;
    margin: 0 auto;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 40px rgba(0,0,0,.10);
    overflow: hidden;
  }

  /* ─── HEADER ─── */
  .hdr {
    background: linear-gradient(135deg, #0c1a2e 0%, #0f2740 50%, #0d3d3a 100%);
    padding: 32px 40px 28px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
  }
  .brand {
    font-size: 28px;
    font-weight: 900;
    color: #fff;
    letter-spacing: -0.6px;
  }
  .brand em { color: #2dd4bf; font-style: normal; }
  .hdr-right { text-align: right; }
  .hdr-label {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255,255,255,.35);
    margin-bottom: 3px;
  }
  .hdr-value {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: rgba(255,255,255,.75);
    word-break: break-all;
  }
  .hdr-date {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: rgba(255,255,255,.4);
    margin-top: 8px;
  }

  /* ─── SCORE BANNER ─── */
  .banner {
    display: flex;
    align-items: center;
    gap: 0;
    border-bottom: 1px solid #f1f5f9;
    background: #fafcff;
  }

  .score-ring-wrap {
    position: relative;
    width: 136px;
    height: 136px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 24px 8px 24px 32px;
    border-radius: 50%;
  }
  .score-ring-inner {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .score-num {
    font-size: 38px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -1px;
  }
  .score-lbl {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #94a3b8;
    margin-top: 2px;
    letter-spacing: .5px;
  }

  .banner-info {
    flex: 1;
    padding: 28px 36px 28px 24px;
  }
  .banner-kw {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -.3px;
    margin-bottom: 6px;
  }
  .banner-url {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #64748b;
    word-break: break-all;
    margin-bottom: 14px;
  }
  .banner-pills {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 13px;
    border-radius: 100px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    border: 1px solid;
  }

  /* ─── STAT STRIP ─── */
  .stats {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0;
    border-bottom: 1px solid #f1f5f9;
  }
  .stat {
    padding: 18px 12px;
    text-align: center;
    border-right: 1px solid #f1f5f9;
  }
  .stat:last-child { border-right: none; }
  .stat-val {
    font-size: 24px;
    font-weight: 900;
    color: #0f172a;
    letter-spacing: -.5px;
    line-height: 1;
  }
  .stat-lbl {
    font-family: 'DM Mono', monospace;
    font-size: 8.5px;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: #94a3b8;
    margin-top: 4px;
  }

  /* ─── SECTION ─── */
  .section {
    padding: 28px 40px;
    border-bottom: 1px solid #f1f5f9;
  }
  .section:last-child { border-bottom: none; }
  .sec-title {
    font-family: 'DM Mono', monospace;
    font-size: 9.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #0d9488;
    margin-bottom: 18px;
    padding-left: 12px;
    border-left: 3px solid #0d9488;
  }

  /* ─── ON-PAGE CHECKS TABLE ─── */
  table.checks {
    width: 100%;
    border-collapse: collapse;
  }
  table.checks th {
    font-family: 'DM Mono', monospace;
    font-size: 8.5px;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: #94a3b8;
    padding: 7px 10px;
    background: #f8fafc;
    text-align: left;
    border-bottom: 2px solid #e2e8f0;
  }
  table.checks td {
    padding: 9px 10px;
    border-bottom: 1px solid #f8fafc;
    vertical-align: middle;
  }
  table.checks tr:last-child td { border-bottom: none; }
  table.checks tr:hover td { background: #fafcff; }
  .ck-name {
    font-weight: 600;
    color: #334155;
    font-size: 12.5px;
    width: 175px;
  }
  .ck-detail {
    color: #64748b;
    font-size: 11.5px;
    word-break: break-word;
  }

  /* ─── BADGES ─── */
  .b-pass { display:inline-block; background:#d1fae5; color:#065f46; font-size:9px; font-weight:700; padding:3px 9px; border-radius:5px; text-transform:uppercase; letter-spacing:.3px; }
  .b-fail { display:inline-block; background:#fee2e2; color:#991b1b; font-size:9px; font-weight:700; padding:3px 9px; border-radius:5px; text-transform:uppercase; letter-spacing:.3px; }
  .b-warn { display:inline-block; background:#fef3c7; color:#92400e; font-size:9px; font-weight:700; padding:3px 9px; border-radius:5px; text-transform:uppercase; letter-spacing:.3px; }
  .b-high { display:inline-block; background:#fee2e2; color:#991b1b; font-size:9px; font-weight:700; padding:3px 9px; border-radius:5px; text-transform:uppercase; white-space:nowrap; }
  .b-med  { display:inline-block; background:#fef3c7; color:#92400e; font-size:9px; font-weight:700; padding:3px 9px; border-radius:5px; text-transform:uppercase; white-space:nowrap; }
  .b-low  { display:inline-block; background:#d1fae5; color:#065f46; font-size:9px; font-weight:700; padding:3px 9px; border-radius:5px; text-transform:uppercase; white-space:nowrap; }

  /* ─── METRICS GRID ─── */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  .mc {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 13px 15px;
  }
  .mc-lbl {
    font-family: 'DM Mono', monospace;
    font-size: 8.5px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: .5px;
    margin-bottom: 4px;
  }
  .mc-val {
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -.3px;
  }

  /* ─── SUGGESTIONS ─── */
  .sg {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
  }
  .sg:last-child { border-bottom: none; }
  .sg-num {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background: linear-gradient(135deg, #0d9488, #0f766e);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .sg-body { flex: 1; }
  .sg-fix {
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 3px;
    line-height: 1.35;
  }
  .sg-why {
    font-size: 11.5px;
    color: #64748b;
    line-height: 1.55;
  }
  .empty-msg {
    font-size: 13px;
    color: #0d9488;
    font-weight: 600;
    text-align: center;
    padding: 18px 0;
  }

  /* ─── ROADMAP ─── */
  .rd {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    padding: 11px 0;
    border-bottom: 1px solid #f8fafc;
  }
  .rd:last-child { border-bottom: none; }
  .rd-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 4px;
  }
  .rd-body { flex: 1; }
  .rd-title {
    font-size: 12.5px;
    font-weight: 700;
    color: #1e293b;
  }
  .rd-desc {
    font-size: 11px;
    color: #64748b;
    margin-top: 2px;
    line-height: 1.5;
  }
  .rd-pri {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .3px;
    padding: 3px 9px;
    border-radius: 5px;
    border: 1px solid;
    white-space: nowrap;
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* ─── COMPETITOR TABLE ─── */
  table.comp-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  table.comp-table th {
    font-family: 'DM Mono', monospace;
    font-size: 8.5px;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: #94a3b8;
    padding: 7px 10px;
    background: #f8fafc;
    text-align: left;
    border-bottom: 2px solid #e2e8f0;
  }
  table.comp-table td {
    padding: 9px 10px;
    border-bottom: 1px solid #f8fafc;
    vertical-align: middle;
  }
  table.comp-table tr:last-child td { border-bottom: none; }
  .comp-rank {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    width: 40px;
  }
  .comp-domain {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #334155;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .comp-val {
    font-family: 'DM Mono', monospace;
    font-size: 11.5px;
    color: #475569;
    text-align: center;
  }
  .comp-top td { background: #f0fdf4; }
  .comp-you td {
    background: linear-gradient(90deg, #eff6ff, #f0f9ff);
    font-weight: 600;
  }
  .comp-you .comp-rank {
    color: #0d9488;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .5px;
  }
  .comp-you .comp-domain { color: #0d9488; font-weight: 700; }

  /* ─── FOOTER ─── */
  .report-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 40px;
    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    border-top: 1px solid #e2e8f0;
  }
  .footer-brand {
    font-size: 16px;
    font-weight: 900;
    color: #94a3b8;
    letter-spacing: -.3px;
  }
  .footer-brand em { color: #0d9488; font-style: normal; }
  .footer-note {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #94a3b8;
  }
  .print-btn {
    background: linear-gradient(135deg, #0d9488, #0f766e);
    color: #fff;
    border: none;
    padding: 10px 24px;
    border-radius: 9px;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    letter-spacing: -.1px;
    box-shadow: 0 4px 14px rgba(13,148,136,.3);
  }
  .print-btn:hover { background: linear-gradient(135deg, #0f766e, #0d5c58); }

  /* ─── PRINT ─── */
  @media print {
    body { background: #fff; padding: 0; font-size: 12px; }
    .page { border-radius: 0; box-shadow: none; max-width: 100%; }
    .report-footer { display: none; }
    .section { page-break-inside: avoid; }
    .hdr { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .score-ring-wrap { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .comp-top td, .comp-you td { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .b-pass, .b-fail, .b-warn, .b-high, .b-med, .b-low { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .sg-num { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- ── HEADER ── -->
  <div class="hdr">
    <div>
      <div class="brand">Rank<em>ly</em></div>
      <div style="font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1px;margin-top:5px">ML-Powered SEO Audit</div>
    </div>
    <div class="hdr-right">
      <div class="hdr-label">Domain</div>
      <div class="hdr-value">${esc(domain)}</div>
      <div class="hdr-label" style="margin-top:8px">Keyword</div>
      <div class="hdr-value">${esc(a.keyword)}</div>
      <div class="hdr-date">${esc(dateStr)}</div>
    </div>
  </div>

  <!-- ── SCORE BANNER ── -->
  <div class="banner">
    ${scoreRing(score)}
    <div class="banner-info">
      <div class="banner-kw">"${esc(a.keyword)}"</div>
      <div class="banner-url">${esc(a.url)}</div>
      <div class="banner-pills">
        <span class="pill" style="background:${qualLight(quality)};color:${qualTeal(quality)};border-color:${qualBorder(quality)}">${esc(qualLabel(quality))}</span>
        <span class="pill" style="background:#f5f3ff;color:#6d28d9;border-color:#ddd6fe">Predicted Rank #${esc(rank)}</span>
        <span class="pill" style="background:#e0f2fe;color:#0369a1;border-color:#bae6fd">KW Coverage ${esc(kwCov)}/5</span>
      </div>
    </div>
  </div>

  <!-- ── STAT STRIP ── -->
  <div class="stats">
    <div class="stat"><div class="stat-val">${esc(a.wordCount?.toLocaleString() ?? '-')}</div><div class="stat-lbl">Word Count</div></div>
    <div class="stat"><div class="stat-val">${esc(kwDensity)}</div><div class="stat-lbl">KW Density</div></div>
    <div class="stat"><div class="stat-val" style="color:${techScore >= 4 ? '#0d9488' : techScore >= 3 ? '#d97706' : '#dc2626'}">${esc(String(techScore))}/5</div><div class="stat-lbl">Tech Score</div></div>
    <div class="stat"><div class="stat-val" style="color:#dc2626">${esc(String(issuesCt))}</div><div class="stat-lbl">Issues</div></div>
    <div class="stat"><div class="stat-val" style="color:#0d9488">${esc(String(checksCt))}</div><div class="stat-lbl">Checks Passed</div></div>
  </div>

  <!-- ── ON-PAGE TECHNICAL CHECKS ── -->
  <div class="section">
    <div class="sec-title">On-Page Technical Checks</div>
    <table class="checks">
      <thead><tr><th>Check</th><th>Status</th><th>Detail</th></tr></thead>
      <tbody>${onPageRows}</tbody>
    </table>
  </div>

  <!-- ── CONTENT METRICS ── -->
  <div class="section">
    <div class="sec-title">Content &amp; Structure Metrics</div>
    <div class="metrics-grid">
      <div class="mc"><div class="mc-lbl">Paragraphs</div><div class="mc-val">${esc(String(a.paragraphs ?? '-'))}</div></div>
      <div class="mc"><div class="mc-lbl">H2 Headings</div><div class="mc-val">${esc(String(a.h2Count ?? '-'))}</div></div>
      <div class="mc"><div class="mc-lbl">H3 Headings</div><div class="mc-val">${esc(String(a.h3Count ?? '-'))}</div></div>
      <div class="mc"><div class="mc-lbl">Internal Links</div><div class="mc-val">${esc(String(a.internalLinks ?? '-'))}</div></div>
      <div class="mc"><div class="mc-lbl">External Links</div><div class="mc-val">${esc(String(a.externalLinks ?? '-'))}</div></div>
      <div class="mc"><div class="mc-lbl">Readability</div><div class="mc-val">${esc(String(readability))}</div></div>
      <div class="mc"><div class="mc-lbl">Alt Coverage</div><div class="mc-val">${esc(String(a.altCoverage ?? '-'))}%</div></div>
      <div class="mc"><div class="mc-lbl">Lighthouse SEO</div><div class="mc-val">${esc(String(a.lighthouseScore ?? '-'))}</div></div>
    </div>
  </div>

  <!-- ── RECOMMENDATIONS ── -->
  ${suggestions.length > 0 ? `
  <div class="section">
    <div class="sec-title">Actionable Recommendations- Top ${suggestions.length}</div>
    ${suggHTML}
  </div>` : ''}

  <!-- ── ROADMAP ── -->
  ${roadmap.length > 0 ? `
  <div class="section">
    <div class="sec-title">SEO Optimization Roadmap</div>
    ${rdmHTML}
  </div>` : ''}

  <!-- ── COMPETITOR BENCHMARK ── -->
  ${compHTML}

  <!-- ── FOOTER ── -->
  <div class="report-footer">
    <div class="footer-brand">Rank<em>ly</em></div>
    <span class="footer-note">Generated ${esc(dateStr)} · ML-Powered SEO Analysis</span>
    <button class="print-btn" onclick="window.print()">Save as PDF</button>
  </div>

</div>
<script>
window.onload = function() { setTimeout(function() { window.print(); }, 700); };
</script>
</body>
</html>`
}
