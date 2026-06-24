/**
 * background.js- Manifest V3 Service Worker.
 *
 * Opens the Side Panel when the toolbar icon is clicked,
 * mimicking the behaviour of extensions like GitHub Copilot.
 */

// On install/update: configure the side panel to open on action click
chrome.runtime.onInstalled.addListener(() => {
  // Tell Chrome: clicking the toolbar icon should open the side panel
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch(err => console.warn('[Rankly] setPanelBehavior:', err))

  console.log('[Rankly] Extension installed / updated.')
})

// Also handle direct action clicks (belt-and-suspenders for Chrome 114-115)
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId })
    .catch(err => console.warn('[Rankly] sidePanel.open:', err))
})

// Relay messages between side panel and content script if needed
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'PING') {
    sendResponse({ pong: true })
  }
  return true
})
