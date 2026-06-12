import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ExtensionPopup from './features/extension/ExtensionPopup.jsx'

// Extension popup runs in its own HTML context (extension.html).
// It has its own CSS (popup.css) and does NOT share the main app's
// global styles or router — those would conflict in the extension context.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ExtensionPopup />
  </StrictMode>,
)
