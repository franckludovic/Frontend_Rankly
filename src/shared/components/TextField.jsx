import { useState } from 'react'

const css = `
.tf-field {
  margin-bottom: 10px;
  width: 100%;
}
.tf-field-size-sm {
  margin-bottom: 7px;
}
.tf-field-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3px;
}
.tf-field-label {
  font-family: 'Outfit', sans-serif;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}
.tf-field-size-sm .tf-field-label {
  font-size: 9px;
}
.tf-field-size-lg .tf-field-label {
  font-size: 12px;
}

.tf-input-wrap {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 7px;
  overflow: hidden;
  transition: all 0.2s;
  width: 100%;
}
.tf-input-wrap:focus-within {
  border-color: rgba(77, 184, 255, 0.4);
  background: rgba(77, 184, 255, 0.04);
  box-shadow: 0 0 0 3px rgba(77, 184, 255, 0.06);
}

.tf-input-icon {
  color: rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tf-field-size-sm .tf-input-icon {
  padding: 0 6px;
}
.tf-field-size-md .tf-input-icon {
  padding: 0 8px;
}
.tf-field-size-lg .tf-input-icon {
  padding: 0 12px;
}

.tf-input {
  flex: 1;
  width: 100%;
  min-width: 0;
  background: none;
  border: none;
  outline: none;
  font-family: 'Outfit', sans-serif;
  color: white;
}
.tf-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.tf-field-size-sm .tf-input {
  padding: 6px 8px 6px 0;
  font-size: 11px;
}
.tf-field-size-md .tf-input {
  padding: 8.5px 10px 8.5px 0;
  font-size: 12px;
}
.tf-field-size-lg .tf-input {
  padding: 12px 14px 12px 0;
  font-size: 14px;
}

/* If no leading icon, we need left padding on the input itself */
.tf-input-no-icon.tf-field-size-sm .tf-input {
  padding-left: 8px;
}
.tf-input-no-icon.tf-field-size-md .tf-input {
  padding-left: 10px;
}
.tf-input-no-icon.tf-field-size-lg .tf-input {
  padding-left: 14px;
}

.tf-pw-toggle {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
}
.tf-pw-toggle:hover {
  color: rgba(255, 255, 255, 0.55);
}
.tf-field-size-sm .tf-pw-toggle {
  padding: 0 7px;
}
.tf-field-size-md .tf-pw-toggle {
  padding: 0 9px;
}
.tf-field-size-lg .tf-pw-toggle {
  padding: 0 13px;
}
.tf-field-error {
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  color: #f87171;
  margin-top: 4px;
}
.tf-input-wrap.has-error {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.tf-input-wrap.has-error:focus-within {
  border-color: rgba(239, 68, 68, 0.6);
  background: rgba(239, 68, 68, 0.06);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
`

export default function TextField({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  onKeyDown,
  tabIndex,
  isPasswordField = false,
  size = 'md',
  bgColor,
  textColor,
  borderRadius,
  borderColor,
  leadingIcon,
  trailingIcon,
  headerRight,
  error,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)

  // Determine the actual type of input tag
  const actualType = isPasswordField
    ? (showPassword ? 'text' : 'password')
    : type

  // Custom inline styles based on props
  const wrapStyle = {}
  if (bgColor) wrapStyle.backgroundColor = bgColor
  if (borderRadius) wrapStyle.borderRadius = borderRadius
  if (borderColor) wrapStyle.borderColor = borderColor

  const inputStyle = {}
  if (textColor) inputStyle.color = textColor

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className={`tf-field tf-field-size-${size}`}>
        {/* Field Header: Label + Optional headerRight node (like Forgot Password) */}
        {(label || headerRight) && (
          <div className="tf-field-hdr">
            {label && <label className="tf-field-label" htmlFor={id}>{label}</label>}
            {headerRight}
          </div>
        )}

        {/* Input Wrapper */}
        <div
          className={`tf-input-wrap ${!leadingIcon ? 'tf-input-no-icon' : ''} ${error ? 'has-error' : ''}`}
          style={wrapStyle}
        >
          {/* Leading Icon */}
          {leadingIcon && (
            <div className="tf-input-icon">
              {leadingIcon}
            </div>
          )}

          {/* Input Tag */}
          <input
            id={id}
            type={actualType}
            className="tf-input"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            tabIndex={tabIndex}
            style={inputStyle}
            {...props}
          />

          {/* Trailing Icon or Password Visibility Toggle */}
          {isPasswordField ? (
            <button
              type="button"
              className="tf-pw-toggle"
              onClick={() => setShowPassword(p => !p)}
              tabIndex={tabIndex}
            >
              {showPassword ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          ) : (
            trailingIcon && (
              <div className="tf-input-icon">
                {trailingIcon}
              </div>
            )
          )}
        </div>
        {error && <div className="tf-field-error">{error}</div>}
      </div>
    </>
  )
}
