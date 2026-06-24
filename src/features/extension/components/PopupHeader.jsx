import { Zap, Download } from 'lucide-react'

export default function PopupHeader({ url = 'example.com/laptops', showPrint = false, onPrint }) {
  return (
    <div className="popup-hdr">
      <div className="ph-logo">
        <div className="ph-logo-icon">
          <Zap size={11} fill="white" strokeWidth={0} />
        </div>
        <div className="ph-logo-name" style={{ fontFamily: "'Outfit',sans-serif" }}>
          Rank<span>ly</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="ph-url">
          <div className="https-dot"/>
          <div className="ph-url-txt">{url}</div>
        </div>

        {showPrint && (
          <button 
            className="ph-print-btn" 
            onClick={onPrint}
            title="Download/Print SEO Report"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '6px', borderRadius: '6px', transition: 'background .15s',
              color: 'var(--muted)'
            }}
          >
            <Download size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  )
}
