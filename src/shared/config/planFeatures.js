// Single source of truth for plan feature access.
// To add a new gated feature: add a key here, then wrap the UI in <FeatureGate feature="yourKey">.

export const PLAN_RANKS = { free: 0, pro: 1, agency: 2, business: 3 }

export const PLAN_LIMITS = { free: 5, pro: 50, agency: 500, business: 10_000 }

// Maps each feature key to the minimum plan required to access it.
// Keep this list SHORT - only gate features that have real server/API cost.
// Everything that reads existing data (cannibalization, linking, monitoring, A/B, PDF) is free.
export const FEATURE_PLAN = {
  brief:           'pro',     // Calls Gemini API - costs money per request
  scheduling:      'pro',     // Ongoing background server work per user
  bulk:            'agency',  // Heavy parallel scraping - high resource cost
  linking:         'agency',  // Internal link AI suggestions
  cannibalization: 'agency',  // Keyword cannibalization detector
}

export const PLAN_LABELS = {
  free:     { name: 'Free',     color: '#94a3b8' },
  pro:      { name: 'Pro',      color: '#0d9488' },
  agency:   { name: 'Agency',   color: '#818cf8' },
  business: { name: 'Business', color: '#fbbf24' },
}
