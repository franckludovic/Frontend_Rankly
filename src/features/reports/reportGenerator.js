export function generateSeoReport(scrapedData, score, keyword) {
  const url = scrapedData?.url || 'Unknown Page';
  const title = scrapedData?.title || 'No Title';
  const metaDesc = scrapedData?.metaDesc || 'No Description';
  const wordCount = scrapedData?.wordCount || 0;
  const isHttps = scrapedData?.isHttps ?? true;
  const viewport = scrapedData?.viewport ?? true;
  const canonical = scrapedData?.canonical || '';
  const hasSchema = scrapedData?.hasSchema ?? false;
  
  const hasTitleKeyword = title.toLowerCase().includes(keyword.toLowerCase());
  const hasDescKeyword = metaDesc.toLowerCase().includes(keyword.toLowerCase());

  // Compute stats
  let density = '0.0%';
  if (scrapedData?.keyword_density !== undefined) {
    density = scrapedData.keyword_density.toFixed(1) + '%';
  } else if (wordCount > 0 && keyword) {
    const kwClean = keyword.toLowerCase();
    const titleMatch = title.toLowerCase().includes(kwClean) ? 1 : 0;
    const descMatch = metaDesc.toLowerCase().includes(kwClean) ? 1 : 0;
    density = (((titleMatch + descMatch + 2) / wordCount) * 100).toFixed(1) + '%';
  }

  // Compile checks
  const checks = [
    { name: 'HTTPS Security', status: isHttps ? 'PASSED' : 'FAILED', details: isHttps ? 'Valid SSL certificate configured.' : 'Insecure HTTP connection.', cls: isHttps ? 'pass' : 'fail' },
    { name: 'Page Title Tag', status: title ? (hasTitleKeyword ? 'PASSED' : 'FAILED') : 'FAILED', details: title ? (hasTitleKeyword ? `Found: "${title}"` : `Found but missing keyword "${keyword}": "${title}"`) : 'Title tag is missing.', cls: title && hasTitleKeyword ? 'pass' : 'fail' },
    { name: 'Meta Description', status: metaDesc ? (hasDescKeyword ? 'PASSED' : 'WARNING') : 'FAILED', details: metaDesc ? (hasDescKeyword ? `Found: "${metaDesc}"` : `Missing keyword "${keyword}": "${metaDesc}"`) : 'Meta description tag is missing.', cls: metaDesc && hasDescKeyword ? 'pass' : 'warn' },
    { name: 'Canonical Tag', status: canonical ? 'PASSED' : 'WARNING', details: canonical ? `Found: ${canonical}` : 'No canonical link specified.', cls: canonical ? 'pass' : 'warn' },
    { name: 'Mobile Viewport', status: viewport ? 'PASSED' : 'FAILED', details: viewport ? 'Viewport meta tag is properly configured.' : 'Viewport meta tag is missing.', cls: viewport ? 'pass' : 'fail' },
    { name: 'Structured Data', status: hasSchema ? 'PASSED' : 'WARNING', details: hasSchema ? 'Schema markup detected on the page.' : 'No JSON-LD schema found.', cls: hasSchema ? 'pass' : 'warn' },
  ];

  // Compile issues
  const issues = [];
  if (!isHttps) issues.push({ text: 'Insecure connection (HTTP instead of HTTPS). Secure sockets are a fundamental ranking signal.', severity: 'Critical' });
  if (!viewport) issues.push({ text: 'Mobile viewport is missing. This prevents the page from being optimized for mobile search indexes.', severity: 'Critical' });
  if (!title) issues.push({ text: 'Missing page title tag. Search engines cannot show accurate search result headings.', severity: 'Critical' });
  else if (!hasTitleKeyword) issues.push({ text: `Target keyword "${keyword}" is missing from the title.`, severity: 'Critical' });
  if (wordCount < 500) issues.push({ text: `Thin content warning (${wordCount} words). Aim for a minimum of 500-1000 words.`, severity: 'High' });
  else if (wordCount < 1000) issues.push({ text: `Moderate content warning (${wordCount} words). Consider adding more text depth.`, severity: 'Medium' });
  if (!metaDesc) issues.push({ text: 'Missing meta description tag.', severity: 'High' });
  else {
    if (!hasDescKeyword) issues.push({ text: `Target keyword "${keyword}" is missing from the meta description.`, severity: 'High' });
    if (metaDesc.length < 120) issues.push({ text: `Meta description is short (${metaDesc.length} chars). Aim for 120-160 chars.`, severity: 'Medium' });
    else if (metaDesc.length > 160) issues.push({ text: `Meta description is too long (${metaDesc.length} chars). Keep it under 160 chars.`, severity: 'Medium' });
  }
  if (!canonical) issues.push({ text: 'No canonical URL declared. Duplicate content issues might occur.', severity: 'Medium' });
  if (!hasSchema) issues.push({ text: 'Structured schema markup (JSON-LD) missing. Rich results cannot be rendered.', severity: 'Medium' });

  const dateStr = new Date().toLocaleString();
  const domain = url.startsWith('http') ? new URL(url).hostname : url;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Audit Report - ${domain}</title>
  <style>
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      background: #f8fafc;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
      padding: 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .brand {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
    }
    .brand span {
      color: #0d9488;
    }
    .meta-info {
      font-size: 13px;
      color: #64748b;
      text-align: right;
    }
    .score-banner {
      display: flex;
      background: #f0fdfa;
      border: 1px solid #ccfbf1;
      border-radius: 8px;
      padding: 24px;
      align-items: center;
      gap: 24px;
      margin-bottom: 30px;
    }
    .score-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #ffffff;
      border: 6px solid ${score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444'};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 24px;
      color: ${score >= 70 ? '#047857' : score >= 45 ? '#b45309' : '#b91c1c'};
      flex-shrink: 0;
    }
    .score-circle span {
      font-size: 10px;
      color: #94a3b8;
      font-weight: 500;
      margin-top: -2px;
    }
    .score-text h2 {
      margin: 0 0 4px;
      font-size: 18px;
      color: #0f172a;
    }
    .score-text p {
      margin: 0;
      font-size: 14px;
      color: #475569;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      margin: 36px 0 16px;
      border-left: 4px solid #0d9488;
      padding-left: 10px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .stat-val {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
    }
    .stat-lbl {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    th {
      font-weight: 600;
      color: #475569;
      background: #f8fafc;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .badge.pass { background: #d1fae5; color: #065f46; }
    .badge.warn { background: #fef3c7; color: #92400e; }
    .badge.fail { background: #fee2e2; color: #991b1b; }
    
    .issue-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 6px;
      border: 1px solid;
      margin-bottom: 8px;
      font-size: 13.5px;
    }
    .issue-item.crit { background: #fff5f5; border-color: #fed7d7; color: #9b1c1c; }
    .issue-item.warn { background: #fffbeb; border-color: #fef3c7; color: #92400e; }
    .issue-bullet {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-top: 7px;
      flex-shrink: 0;
    }
    .issue-item.crit .issue-bullet { background: #ef4444; }
    .issue-item.warn .issue-bullet { background: #f59e0b; }
    .issue-text { flex-grow: 1; }
    .issue-sev {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 1px 6px;
      border-radius: 3px;
      background: rgba(0,0,0,0.05);
    }
    .print-btn-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 30px;
    }
    .print-btn {
      background: #0d9488;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      font-family: inherit;
    }
    .print-btn:hover {
      background: #0f766e;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .container {
        border: none;
        box-shadow: none;
        padding: 0;
      }
      .print-btn-container {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">SEO<span>Insight</span></div>
      <div class="meta-info">
        <div>Date: ${dateStr}</div>
        <div>Target URL: ${domain}</div>
      </div>
    </div>
    
    <div class="score-banner">
      <div class="score-circle">${score}<span>/100</span></div>
      <div class="score-text">
        <h2>SEO Optimization Report</h2>
        <p>This report details the basic SEO parameters evaluated for <strong>${url}</strong> targeting the keyword <strong>"${keyword}"</strong>.</p>
      </div>
    </div>
    
    <div class="section-title">Page Stats</div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-val">${wordCount.toLocaleString()}</div>
        <div class="stat-lbl">Word Count</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">${density}</div>
        <div class="stat-lbl">Keyword Density</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">${checks.filter(c => c.status === 'PASSED').length}/6</div>
        <div class="stat-lbl">Tech Score</div>
      </div>
    </div>
    
    <div class="section-title">Technical Check Checklist</div>
    <table>
      <thead>
        <tr>
          <th>Check Name</th>
          <th>Status</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        ${checks.map(c => `
          <tr>
            <td style="font-weight: 600;">${c.name}</td>
            <td><span class="badge ${c.cls}">${c.status}</span></td>
            <td style="color: #475569;">${c.details}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="section-title">Actionable Recommendations</div>
    <div style="margin-bottom: 30px;">
      ${issues.length > 0 ? issues.map(issue => `
        <div class="issue-item ${issue.severity === 'Critical' ? 'crit' : 'warn'}">
          <div class="issue-bullet"></div>
          <div class="issue-text">${issue.text}</div>
          <div class="issue-sev">${issue.severity}</div>
        </div>
      `).join('') : `
        <div style="color: #047857; font-size: 14px; font-weight: 600;">
          ✓ All basic SEO checks are fully optimized. No critical issues detected!
        </div>
      `}
    </div>

    <div class="print-btn-container">
      <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

  return html;
}

export function printSeoReport(scrapedData, score, keyword) {
  const htmlContent = generateSeoReport(scrapedData, score, keyword);
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    alert('Please allow popups to download/print the SEO report.');
  }
}
