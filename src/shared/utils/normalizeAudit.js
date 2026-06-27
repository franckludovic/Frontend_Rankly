export function normalizeAudit(data) {
  if (!data) return null

  // If the audit is already normalized (e.g. from mock data), return it as is
  if (data.seoScore !== undefined) {
    return data
  }

  const onPage = data.on_page || {}
  const prediction = data.prediction || {}
  const recommendations = data.recommendations || []
  const competitors = data.competitors || []

  // Normalise quality to uppercase — the label encoder may return title-case ('Medium')
  // but all frontend comparisons expect uppercase ('MEDIUM').
  const quality = (prediction.classification?.quality || 'LOW').toUpperCase()
  // Prefer the model-derived 0–100 SEO score (classifier HIGH-vs-LOW log-odds).
  // Fall back to the quality+technical heuristic only when the backend didn't send one.
  const techBonus = (onPage.technical_score || 0) * 5
  const heuristicScore = Math.min(100, (quality === 'HIGH' ? 85 : quality === 'MEDIUM' ? 60 : 35) + techBonus)
  const modelSeoScore = typeof data.seo_score === 'number' ? Math.round(data.seo_score) : null
  const seoScore = modelSeoScore ?? heuristicScore

  // Real, model-backed score impact per recommendation (services/recommendation_impact.py).
  // We normalise the per-fix point gains to 0–100 for the impact bars while keeping the
  // raw predicted point gain (scoreDelta) for the "+X.X pts" label.
  const deltaOf = (rec) => (typeof rec.score_impact?.score_delta === 'number' ? rec.score_impact.score_delta : null)
  const hasModelImpact = recommendations.some(r => deltaOf(r) !== null)
  const maxDelta = Math.max(0.1, ...recommendations.map(r => deltaOf(r) || 0))

  // Map recommendations to suggestions format
  // Normalise impact to lowercase consistently so all comparisons use the same case
  const suggestions = recommendations.map((rec, index) => {
    const impact = (rec.impact || 'low').toLowerCase()
    const scoreDelta = deltaOf(rec)
    return {
      rank: index + 1,
      impact,
      scoreDelta,
      competitiveGap: rec.competitive_gap || null,
      // bar fill: model-relative when available, else the old impact heuristic
      pct: scoreDelta !== null ? Math.round((scoreDelta / maxDelta) * 100) : (impact === 'high' ? 92 : impact === 'medium' ? 68 : 35),
      fix: rec.issue || rec.title || '',
      why: rec.action || rec.desc || ''
    }
  })

  // Map recommendations to roadmapTasks format
  const roadmapTasks = recommendations.map((rec, index) => {
    const priority = (rec.impact || 'LOW').toLowerCase() === 'high' ? 'critical' : (rec.impact || 'LOW').toLowerCase() === 'medium' ? 'high' : 'medium'
    const category = ['Title', 'Meta'].includes(rec.category)
      ? 'Metadata'
      : ['Headings', 'Structure'].includes(rec.category)
      ? 'Structure'
      : ['Content', 'Images'].includes(rec.category)
      ? 'Content'
      : ['Links'].includes(rec.category)
      ? 'Links'
      : 'Technical'
    const effort = ['Title', 'Meta', 'Headings'].includes(rec.category) ? 'Easy' : ['Content', 'Links'].includes(rec.category) ? 'Medium' : 'Hard'
    const time = effort === 'Easy' ? '~10 min' : effort === 'Medium' ? '~30 min' : '2–3 hours'
    const scoreDelta = deltaOf(rec)
    // Model-backed impact bar (0–100, relative to the strongest fix); heuristic fallback.
    const impactPct = scoreDelta !== null
      ? Math.round((scoreDelta / maxDelta) * 100)
      : (priority === 'critical' ? 95 : priority === 'high' ? 82 : priority === 'medium' ? 52 : 22)

    return {
      id: rec.id || `task_${index}`,
      priority,
      category,
      effort,
      time,
      scoreDelta,
      competitiveGap: rec.competitive_gap || null,
      impactPct,
      title: rec.issue || rec.title || '',
      desc: rec.action || rec.desc || '',
      status: rec.status || 'todo'
    }
  })

  return {
    id: data.id,
    url: data.url,
    keyword: data.keyword,
    createdAt: data.created_at,
    seoScore,
    modelSeoScore,
    hasModelImpact,
    explanation: data.explanation || null,
    quality,
    signalCount: prediction.features_used || 51,
    classificationConfidence: Math.round(prediction.classification?.confidence || 0),
    rankR2: prediction.regression?.r2_score ?? null,
    predictedRank: prediction.regression?.predicted_rank || 50,
    keywordCoverage: (onPage.title_has_kw ? 1 : 0) + (onPage.meta_has_kw ? 1 : 0) + (onPage.h1_has_kw ? 1 : 0) + (onPage.alt_has_kw ? 1 : 0),
    technicalScore: onPage.technical_score || 0,
    issuesFound: suggestions.length,
    checksPassed: 30 - suggestions.length,
    wordCount: onPage.word_count || 0,
    keywordDensity: onPage.keyword_density || 0,
    paragraphs: onPage.paragraph_count || 0,
    readabilityScore: onPage.readability_score || 0,
    altCoverage: onPage.image_count > 0 ? Math.round((onPage.images_with_alt / onPage.image_count) * 100) : 0,
    internalLinks: onPage.internal_links || 0,
    externalLinks: onPage.external_links || 0,
    hasSchema: onPage.has_schema_markup || false,
    pageTitle: onPage.title || '',
    metaDescription: onPage.meta_description || '',
    h1: onPage.h1_text || '',
    h2Count: onPage.h2_count || 0,
    h3Count: onPage.h3_count || 0,
    canonical: onPage.canonical || '',
    indexStatus: onPage.index_status || 'index, follow',
    titleHasKw: onPage.title_has_kw || false,
    metaHasKw: onPage.meta_has_kw || false,
    h1HasKw: onPage.h1_has_kw || false,
    altHasKw: onPage.alt_has_kw || false,
    bodyHasKw: onPage.body_has_kw || false,
    competitors,
    suggestions,
    roadmapTasks,
    serpFeatures: data.serp_features || [],
    generatedSchema: data.generated_schema || null,
  }
}
