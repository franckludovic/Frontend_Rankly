/**
 * LocalHostNotice- warning sheet shown when the active site is local/non-deployed.
 * Animates in from the bottom with a slide-up effect, warning the user that the audit
 * will be restricted to on-page factors only.
 */
import { AlertTriangle, Check, X } from 'lucide-react'

export default function LocalHostNotice({ url, onConfirm, onCancel }) {
  return (
    <div className="local-notice-overlay">
      <div className="local-notice-backdrop" onClick={onCancel} />
      <div className="local-notice-sheet">
        <div className="ln-drag-handle" />
        
        {/* Warning Icon with a soft pulse */}
        <div className="ln-icon-wrap">
          <div className="ln-icon-pulse" />
          <span className="ln-icon"><AlertTriangle size={24} strokeWidth={1.8} /></span>
        </div>

        {/* Headline & Body */}
        <h3 className="ln-title" style={{ fontFamily: "'Syne', sans-serif" }}>
          Local Page Detected
        </h3>
        
        <div className="ln-url-box">
          <span className="ln-url-label">Target:</span>
          <span className="ln-url-val">{url}</span>
        </div>

        <p className="ln-desc">
          This site is running on a local server or hasn't been deployed. 
          External factors like <strong>domain authority, backlinks, page speed index, and global CDN caching</strong> 
          cannot be audited.
        </p>

        <div className="ln-bullet-list">
          <div className="ln-bullet-item">
            <span className="ln-bullet-check"><Check size={12} strokeWidth={2} /></span>
            <span><strong>Available:</strong> Tag structure, SEO titles, image alt attributes, mobile friendliness, meta descriptions.</span>
          </div>
          <div className="ln-bullet-item">
            <span className="ln-bullet-cross"><X size={12} strokeWidth={2} /></span>
            <span><strong>Unavailable:</strong> Core Web Vitals, external backlink profile, competitor SERP gap analysis.</span>
          </div>
        </div>

        <div className="ln-alert-box">
          Your audit will be based <strong>only on on-page HTML factors</strong>.
        </div>

        {/* CTA Actions */}
        <div className="ln-actions">
          <button id="btn-local-confirm" className="cta-primary ln-btn-confirm" onClick={onConfirm}>
            Proceed with On-Page Audit
          </button>
          <button id="btn-local-cancel" className="cta-secondary ln-btn-cancel" onClick={onCancel}>
            Cancel Audit
          </button>
        </div>
      </div>
    </div>
  )
}
