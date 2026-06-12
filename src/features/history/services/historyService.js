import { api } from '../../../shared/services/apiClient.js'

/**
 * historyService.js
 * All calls route through apiClient.js.
 */

export async function getHistory() {
  return api.getHistory()
}

export async function deleteAudit(id) {
  return api.deleteAudit(id)
}
