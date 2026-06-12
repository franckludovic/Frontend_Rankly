import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  isLoading: false,

  setSession: ({ token, user } = {}) =>
    set({ token: token ?? null, user: user ?? null }),
  logout: () => set({ token: null, user: null }),
  setLoading: (isLoading) => set({ isLoading }),
}))

export function useAuth() {
  return useAuthStore()
}


