import { create } from 'zustand'
import { FEATURE_PLAN, PLAN_RANKS } from '../shared/config/planFeatures.js'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const usePlanStore = create((set, get) => ({
  plan:     'free',
  devAddon: false,
  loaded:   false,

  fetch: async (token) => {
    if (!token) { set({ plan: 'free', devAddon: false, loaded: true }); return }
    try {
      const res = await fetch(`${API}/api/billing/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        set({ plan: data.plan || 'free', devAddon: !!data.dev_addon, loaded: true })
        return
      }
    } catch { /* network error - fall through to free */ }
    set({ plan: 'free', devAddon: false, loaded: true })
  },

  reset: () => set({ plan: 'free', devAddon: false, loaded: false }),

  // Returns true if the current plan includes the given feature key.
  can: (feature) => {
    const { plan } = get()
    const required = FEATURE_PLAN[feature]
    if (!required) return true
    return PLAN_RANKS[plan] >= PLAN_RANKS[required]
  },
}))

// Convenience hook
export function usePlan() {
  return usePlanStore()
}
