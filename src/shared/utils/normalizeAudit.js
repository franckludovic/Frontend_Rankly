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
  const baseScore = quality === 'HIGH' ? 85 : quality === 'MEDIUM' ? 60 : 35
  const techBonus = (onPage.technical_score || 0) * 5
  const seoScore = Math.min(100, baseScore + techBonus)

  // Map recommendations to suggestions format
  // Normalise impact to lowercase consistently so all comparisons use the same case
  const suggestions = recommendations.map((rec, index) => {
    const impact = (rec.impact || 'low').toLowerCase()
    return {
      rank: index + 1,
      impact,
      pct: impact === 'high' ? 92 : impact === 'medium' ? 68 : 35,
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
    const posGain = priority === 'critical' ? { min: 5, max: 9 } : priority === 'high' ? { min: 4, max: 7 } : priority === 'medium' ? { min: 2, max: 4 } : { min: 0, max: 2 }
    const impactPct = priority === 'critical' ? 95 : priority === 'high' ? 82 : priority === 'medium' ? 52 : 22

    return {
      id: rec.id || `task_${index}`,
      priority,
      category,
      effort,
      time,
      posGain,
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
