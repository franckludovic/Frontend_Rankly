import { api } from '../../../shared/services/apiClient.js'
import { useAuditStore } from '../../../store/auditSlice.js'

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
