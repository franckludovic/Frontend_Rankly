export default function PopupHeader({ url = 'example.com/laptops' }) {
  return (
    <div className="popup-hdr">
      <div className="ph-logo">
        <div className="ph-logo-icon">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
            <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/>
          </svg>
        </div>
        <div className="ph-logo-name" style={{ fontFamily: "'Syne',sans-serif" }}>
          SEO<span>Insight</span>
        </div>
      </div>

      <div className="ph-url">
        <div className="https-dot"/>
        <div className="ph-url-txt">{url}</div>
      </div>
    </div>
  )
}
