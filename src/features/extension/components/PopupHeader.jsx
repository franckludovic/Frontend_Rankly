export default function PopupHeader({ url = 'example.com/laptops', showPrint = false, onPrint }) {
  return (
    <div className="popup-hdr">
      <div className="ph-logo">
        <div className="ph-logo-icon">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
            <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
          </svg>
        </div>
        <div className="ph-logo-name" style={{ fontFamily: "'Outfit',sans-serif" }}>
          SEO<span>Insight</span>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
