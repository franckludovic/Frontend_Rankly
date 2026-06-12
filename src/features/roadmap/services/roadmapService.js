import { api } from '../../../shared/services/apiClient.js'
import { useAuditStore } from '../../../store/auditSlice.js'

/**
 * roadmapService.js
 * All calls route through apiClient.js.
 */

export async function updateTaskStatus(auditId, taskId, status) {
  const audit = await api.updateTaskStatus(auditId, taskId, status)
  useAuditStore.getState().setAudit(audit)
  return audit
}
