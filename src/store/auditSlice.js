import { create } from 'zustand'

export const useAuditStore = create((set) => ({
  currentAudit: null,
  isLoading: false,

  setAudit: (audit) => set({ currentAudit: audit ?? null }),
  setLoading: (isLoading) => set({ isLoading }),
}))

export function useAudit() {
  return useAuditStore()
}

