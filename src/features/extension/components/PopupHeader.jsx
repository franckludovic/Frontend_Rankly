import { Zap, Download, Sun, Moon } from 'lucide-react'

export default function PopupHeader({ url = 'example.com', showPrint = false, onPrint, theme = 'dark', onToggleTheme }) {
  return (
    <div className="popup-hdr">
      <div className="ph-logo">
        <div className="ph-logo-icon">
          <Zap size={11} fill="white" strokeWidth={0} />
        </div>
        <div className="ph-logo-name">
          Rank<span>ly</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div className="ph-url">
          <div className="https-dot" />
          <div className="ph-url-txt">{url}</div>
        </div>

        {showPrint && (
          <button className="ph-icon-btn" onClick={onPrint} title="Download / Print report">
            <Download size={13} strokeWidth={2.2} />
          </button>
        )}

        <button className="ph-icon-btn" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'dark'
            ? <Sun  size={13} strokeWidth={2.2} />
            : <Moon size={13} strokeWidth={2.2} />}
        </button>
      </div>
    </div>
  )
}
