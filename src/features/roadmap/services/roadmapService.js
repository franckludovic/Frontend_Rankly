import { api } from '../../../shared/services/apiClient.js'
import { useAuditStore } from '../../../store/auditSlice.js'

/**
 * roadmapService.js
 * All calls route through apiClient.js.
 */

export async function updateTaskStatus(auditId, taskId, status) {
  await api.updateTaskStatus(auditId, taskId, status)
  // Optimistically patch just this task's status in the store- do NOT replace
  // the whole audit with the task object that the endpoint returns.
  const { currentAudit, setAudit } = useAuditStore.getState()
  if (currentAudit) {
    const updatedTasks = (currentAudit.roadmapTasks || []).map(t =>
      t.id === taskId ? { ...t, status } : t
    )
    setAudit({ ...currentAudit, roadmapTasks: updatedTasks })
  }
}
