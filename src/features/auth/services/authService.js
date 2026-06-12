import { api } from '../../../shared/services/apiClient.js'
import { useAuthStore } from '../../../store/authSlice.js'

/**
 * authService.js
 * All calls route through apiClient.js.
 * Switch to FastAPI by setting VITE_USE_MOCK_API=false in .env
 */

export async function login({ email, password }) {
  const { token, user } = await api.login({ email, password })
  useAuthStore.getState().setSession({ token, user })
  return { token, user }
}

export async function register({ email, password, firstName, lastName }) {
  const { token, user } = await api.register({ email, password, firstName, lastName })
  useAuthStore.getState().setSession({ token, user })
  return { token, user }
}

export async function logout() {
  await api.logout()
  useAuthStore.getState().logout()
}

export async function restoreSession() {
  try {
    const user = await api.getCurrentUser()
    const token = api._storage.get('rankly.token')
    if (user && token) {
      useAuthStore.getState().setSession({ token, user })
      return user
    }
  } catch {
    useAuthStore.getState().logout()
  }
  return null
}
