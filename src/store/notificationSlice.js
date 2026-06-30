import { create } from 'zustand'

// Global toast/notification store.
//
// Usage from any component:
//     import { notify } from '../../store/notificationSlice.js'
//     notify.success('Saved', 'Your changes were stored')
//     notify.error('Something went wrong', err.message)
//
// Or via the hook:
//     const push = useNotifications(s => s.push)
//
// The <NotificationHost/> (mounted once in App.jsx) renders the queue and
// handles the enter/exit animation + auto-dismiss.

let _id = 0

export const useNotifications = create((set) => ({
  toasts: [],

  push: ({ type = 'info', title = '', message = '', duration = 3000 } = {}) => {
    const id = ++_id
    set((s) => ({ toasts: [...s.toasts, { id, type, title, message, duration }] }))
    return id
  },

  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  clear: () => set({ toasts: [] }),
}))

// Imperative helper so non-React code (services, event handlers) can fire toasts.
function push(opts) {
  return useNotifications.getState().push(opts)
}

export const notify = {
  push,
  success: (title, message, duration) => push({ type: 'success', title, message, duration }),
  error:   (title, message, duration) => push({ type: 'error',   title, message, duration: duration ?? 4500 }),
  info:    (title, message, duration) => push({ type: 'info',    title, message, duration }),
  warning: (title, message, duration) => push({ type: 'warning', title, message, duration }),
}
