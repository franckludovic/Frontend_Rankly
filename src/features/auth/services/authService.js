import { supabase } from '../../../lib/supabase.js'
import { useAuthStore } from '../../../store/authSlice.js'

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  const session = data.session
  const user = {
    email: data.user.email,
    name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || '',
    initials: getInitials(data.user),
  }
  
  // Save token to localStorage so apiClient.js can read it for HTTP headers
  localStorage.setItem('rankly.token', JSON.stringify(session.access_token))
  localStorage.setItem('rankly.currentUser', JSON.stringify(user))

  useAuthStore.getState().setSession({ token: session.access_token, user })
  return { token: session.access_token, user }
}

export async function register({ email, password, firstName, lastName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { 
      data: { 
        full_name: `${firstName} ${lastName}`, 
        first_name: firstName, 
        last_name: lastName 
      } 
    }
  })
  if (error) throw new Error(error.message)
  
  if (data.session) {
    const user = {
      email,
      name: `${firstName} ${lastName}`,
      initials: `${firstName[0]}${lastName[0]}`.toUpperCase()
    }

    localStorage.setItem('rankly.token', JSON.stringify(data.session.access_token))
    localStorage.setItem('rankly.currentUser', JSON.stringify(user))
    useAuthStore.getState().setSession({ token: data.session.access_token, user })

    // Fire welcome email- don't await, never block the UX
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    fetch(`${apiBase}/api/auth/welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify({ name: `${firstName} ${lastName}`, email }),
    }).catch(() => {})

    return { token: data.session.access_token, user }
  }
  return { message: 'Check your email for confirmation link' }
}

export async function logout() {
  await supabase.auth.signOut()
  
  localStorage.removeItem('rankly.token')
  localStorage.removeItem('rankly.currentUser')

  useAuthStore.getState().logout()
}

export async function restoreSession() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    const user = {
      email: session.user.email,
      name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
      initials: getInitials(session.user),
    }
    
    localStorage.setItem('rankly.token', JSON.stringify(session.access_token))
    localStorage.setItem('rankly.currentUser', JSON.stringify(user))

    useAuthStore.getState().setSession({ token: session.access_token, user })
    return user
  }
  
  localStorage.removeItem('rankly.token')
  localStorage.removeItem('rankly.currentUser')
  useAuthStore.getState().logout()
  return null
}

// Keep store in sync on Auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    localStorage.removeItem('rankly.token')
    localStorage.removeItem('rankly.currentUser')
    useAuthStore.getState().logout()
  } else if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
    const user = {
      email: session.user.email,
      name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
      initials: getInitials(session.user),
    }
    
    localStorage.setItem('rankly.token', JSON.stringify(session.access_token))
    localStorage.setItem('rankly.currentUser', JSON.stringify(user))

    useAuthStore.getState().setSession({ token: session.access_token, user })
  }
})

function getInitials(user) {
  const meta = user.user_metadata
  if (meta?.first_name && meta?.last_name) return `${meta.first_name[0]}${meta.last_name[0]}`.toUpperCase()
  if (meta?.full_name) return meta.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (user.email?.[0] || '?').toUpperCase()
}
