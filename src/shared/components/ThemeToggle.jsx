/**
 * ThemeToggle.jsx
 * Drop this anywhere in your UI — sidebar, navbar, settings page.
 * Uses the useTheme() hook you already have.
 */
import { useState, useEffect } from "react";
import { useTheme, getPreferredTheme } from "./useTheme";

const css = `
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 11px;
  border-radius: var(--r-md, 11px);
  border: 1px solid var(--border);
  background: var(--bg3);
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}
.theme-toggle:hover {
  background: var(--bg-hover);
  border-color: var(--border2);
}
.tt-track {
  width: 34px; height: 18px;
  border-radius: 9999px;
  border: 1.5px solid var(--border2);
  background: var(--bg-input);
  position: relative;
  flex-shrink: 0;
  transition: background 0.3s ease, border-color 0.3s ease;
}
.tt-track.on {
  background: var(--teal-d);
  border-color: var(--teal-b);
}
.tt-thumb {
  position: absolute;
  top: 2px; left: 2px;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--muted);
  transition: transform 0.25s ease, background 0.25s ease;
}
.tt-track.on .tt-thumb {
  transform: translateX(16px);
  background: var(--teal);
}
.tt-label {
  font-family: var(--font-body, 'Outfit', sans-serif);
  font-size: 12px;
  color: var(--muted);
  flex: 1;
}
.tt-icon { font-size: 14px; flex-shrink: 0; }
`;

export default function ThemeToggle() {
  const { setTheme } = useTheme();
  const [isDark, setIsDark] = useState(true);

  /* Read current theme on mount */
  useEffect(() => {
    const current = getPreferredTheme();
    setIsDark(current === "dark");
  }, []);

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    setIsDark(!isDark);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <button className="theme-toggle" onClick={toggle}>
        <span className="tt-icon">{isDark ? "🌙" : "☀️"}</span>
        <span className="tt-label">{isDark ? "Dark mode" : "Light mode"}</span>
        <div className={`tt-track${isDark ? " on" : ""}`}>
          <div className="tt-thumb" />
        </div>
      </button>
    </>
  );
}
