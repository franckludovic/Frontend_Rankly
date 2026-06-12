import { api } from '../../../shared/services/apiClient.js'
import { useAuditStore } from '../../../store/auditSlice.js'

/**
 * auditService.js
 * All calls route through apiClient.js.
 */

export async function generateAudit({ url, keyword }) {
  useAuditStore.getState().setLoading(true)
  try {
    const audit = await api.generateAudit({ url, keyword })
    useAuditStore.getState().setAudit(audit)
    return audit
  } finally {
    useAuditStore.getState().setLoading(false)
  }
}

export async function getAudit(id) {
  useAuditStore.getState().setLoading(true)
  try {
    const audit = await api.getAudit(id)
    useAuditStore.getState().setAudit(audit)
    return audit
  } finally {
    useAuditStore.getState().setLoading(false)
  }
}
