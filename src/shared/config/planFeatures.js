// Single source of truth for plan feature access.
// To add a new gated feature: add a key here, then wrap the UI in <FeatureGate feature="yourKey">.
//
// V2 pricing model: TWO plans only (Free / Pro) + the "Dev Pack" add-on,
// purchasable on top of Pro, which unlocks developer functionality (REST API keys).
// Legacy 'agency'/'business' plans are treated as Pro.

export const PLAN_RANKS = { free: 0, pro: 1, agency: 1, business: 1 } // legacy ranks map to Pro

export const PLAN_LIMITS = { free: 5, pro: 50, agency: 50, business: 50 }

// Maps each feature key to the minimum plan required to access it.
// Keep this list SHORT - only gate features that have real server/API cost.
// Free includes everything that reads existing data or is a one-shot model call:
// audits, competitor analysis, history, roadmap, PDF export, A/B scorer,
// schema generator, cannibalization, browser extension.
export const FEATURE_PLAN = {
  brief:      'pro',   // Calls Gemini API - costs money per request
  scheduling: 'pro',   // Ongoing background server work per user
  bulk:       'pro',   // Heavy parallel scraping - high resource cost
  linking:    'pro',   // Internal link AI - MiniLM embedding pass over site pages
  monitoring: 'pro',   // Competitor change watching - background scrapes + emails
  // Developer functionality is NOT a plan rank: it requires Pro + the Dev Pack
  // add-on (subscription.dev_addon flag). Gated via hasDevAccess in the store.
}

export const PLAN_LABELS = {
  free:      { name: 'Free',     color: '#94a3b8' },
  pro:       { name: 'Pro',      color: '#0d9488' },
  dev_addon: { name: 'Dev Pack', color: '#818cf8' },
  // legacy plans render as Pro
  agency:    { name: 'Pro',      color: '#0d9488' },
  business:  { name: 'Pro',      color: '#0d9488' },
}
