/**
 * AppShell.jsx - Shared sidebar + topbar layout
 * Uses React Router <Outlet /> for page content.
 * Sidebar nav links are wired to react-router-dom.
 */
import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom'
import { useTheme, getPreferredTheme } from '../../styles/theme.js'
import { useAuth } from '../../store/authSlice.js'
import { useAudit } from '../../store/auditSlice.js'
import { usePlanStore } from '../../store/planSlice.js'
import { logout } from '../../features/auth/services/authService.js'
import { notify } from '../../store/notificationSlice.js'
import '../../styles/theme.css'

// Support inbox for the Help button. Change to your real support address.
const HELP_EMAIL = 'estavetbiz@gmail.com'
import { Zap, BarChart2, Users, Map, Clock, LayoutGrid, Code2, HelpCircle, LogOut, Plus, Bell, User, Settings, Menu, Sun, Moon, ChevronRight, Search, CreditCard } from 'lucide-react'

/* ── Icons ── */
const Ic = {
  bolt:    <Zap size={13} fill="white" strokeWidth={0} />,
  chart:   <BarChart2 size={15} strokeWidth={1.8} />,
  users:   <Users size={15} strokeWidth={1.8} />,
  map:     <Map size={15} strokeWidth={1.8} />,
  history: <Clock size={15} strokeWidth={1.8} />,
  bulk:    <LayoutGrid size={15} strokeWidth={1.8} />,
  dev:     <Code2 size={15} strokeWidth={1.8} />,
  help:    <HelpCircle size={14} strokeWidth={1.8} />,
  logout:  <LogOut size={14} strokeWidth={1.8} />,
  plus:    <Plus size={12} strokeWidth={2.5} color="white" />,
  bell:    <Bell size={15} strokeWidth={1.8} />,
  user:    <User size={14} strokeWidth={1.8} />,
  settings:<Settings size={14} strokeWidth={1.8} />,
  menu:    <Menu size={16} strokeWidth={2} />,
  sun:     <Sun size={15} strokeWidth={1.8} />,
  moon:    <Moon size={14} strokeWidth={1.8} />,
  chevron: <ChevronRight size={12} strokeWidth={2} />,
}
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');

:root {
  /* Typography */
  --font-display: 'Syne', sans-serif;
  --font-mono:    'DM Mono', monospace;
  --font-body:    'Outfit', sans-serif;

  /* Border radius */
  --r-sm:  5px;
  --r-md:  8px;
  --r-lg:  10px;
  --r-xl:  14px;
  --r-full: 9999px;

  /* Sidebar width */
  --sb-w: 220px;

  /* Transitions */
  --ease: 0.2s ease;
  --ease-slow: 0.4s ease;

  /* Shadows */
  --shadow-card: 0 8px 32px rgba(0,0,0,0.18);
  --shadow-lg:   0 24px 64px rgba(0,0,0,0.35);
}

.shell{display:grid;grid-template-columns:var(--sb-w,220px) 1fr;grid-template-rows:100vh;height:100vh;background:var(--bg);font-family:var(--font-body,'Outfit',sans-serif);color:var(--text);overflow:hidden;}

/* ── Sidebar ── */
.sb{background:var(--bg-sb);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:0;height:100%;overflow-y:auto;overflow-x:hidden;z-index:40;transition:transform 0.3s ease;}
.sb-logo{display:flex;align-items:center;gap:7px;padding:14px 12px;border-bottom:1px solid var(--border);}
.sb-logo-mark{width:24px;height:24px;background:linear-gradient(135deg,var(--logo-grad-start),var(--logo-grad-end));border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 10px rgba(13,148,136,0.22);}
.sb-logo-text{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;letter-spacing:-0.3px;color:var(--text);}
.sb-logo-text span{color:var(--teal);}
.sb-logo-sub{font-family:'DM Mono',monospace;font-size:7px;letter-spacing:0.8px;text-transform:uppercase;color:var(--faint);margin-top:1px;}
.sb-audit-ctx{margin:8px 8px 4px;padding:7px 9px;background:var(--teal-d);border:1px solid var(--teal-b);border-radius:8px;}
.sac-label{font-family:'DM Mono',monospace;font-size:6.5px;text-transform:uppercase;letter-spacing:0.6px;color:var(--teal);opacity:0.7;margin-bottom:3px;}
.sac-url{font-family:'DM Mono',monospace;font-size:9px;color:var(--teal);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sac-kw{font-family:'DM Mono',monospace;font-size:7.5px;color:var(--muted);margin-top:1.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sb-section-label{font-family:'DM Mono',monospace;font-size:7px;text-transform:uppercase;letter-spacing:0.8px;color:var(--faint);padding:10px 12px 4px;}
.sb-nav{display:flex;flex-direction:column;gap:1px;padding:0 6px;}
.sb-item{display:flex;align-items:center;gap:7px;padding:7px 9px;border-radius:7px;border:none;background:none;color:var(--muted);font-family:'Outfit',sans-serif;font-size:11px;font-weight:500;cursor:pointer;transition:all 0.15s ease;width:100%;text-align:left;text-decoration:none;position:relative;}
.sb-item:hover{color:var(--text);background:var(--bg-hover);}
.sb-item.active-nav{color:var(--teal);background:var(--teal-d);font-weight:600;}
.sb-item.active-nav::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:2.5px;border-radius:0 1.5px 1.5px 0;background:var(--teal);}
.sb-item svg{flex-shrink:0;opacity:0.65;}
.sb-item.active-nav svg{opacity:1;}
.sb-badge{margin-left:auto;background:var(--red-d);border:1px solid var(--red-b);color:var(--red);border-radius:99px;font-family:'DM Mono',monospace;font-size:7.5px;padding:1px 5px;font-weight:600;}
.sb-sep{height:1px;background:var(--border);margin:6px 12px;}
.sb-cta{margin:0 6px 4px;padding:8px 10px;border-radius:8px;border:none;background:linear-gradient(135deg,var(--cta-start),var(--cta-end));color:white;font-family:'Outfit',sans-serif;font-size:10.5px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all 0.2s ease;box-shadow:0 4px 10px var(--cta-shadow);}
.sb-cta:hover{transform:translateY(-1px);box-shadow:0 6px 16px var(--cta-shadow);}
.sb-bottom{padding:0 6px;display:flex;flex-direction:column;gap:1.5px;margin-top:auto;padding-bottom:6px;}
.sb-theme-toggle{display:flex;align-items:center;gap:7px;padding:6px 9px;border-radius:7px;border:1px solid var(--border);background:none;color:var(--muted);font-family:'Outfit',sans-serif;font-size:11px;font-weight:500;cursor:pointer;transition:all 0.15s;width:100%;text-align:left;}
.sb-theme-toggle:hover{background:var(--bg-hover);border-color:var(--border2);color:var(--text);}
.tt-track{width:26px;height:14px;border-radius:99px;border:1px solid var(--border2);background:var(--bg-input);position:relative;flex-shrink:0;margin-left:auto;transition:background 0.3s,border-color 0.3s;}
.tt-track.on{background:var(--teal-d);border-color:var(--teal-b);}
.tt-thumb{position:absolute;top:1.5px;left:1.5px;width:9px;height:9px;border-radius:50%;background:var(--muted);transition:transform 0.25s,background 0.25s;}
.tt-track.on .tt-thumb{transform:translateX(12px);background:var(--teal);}


/* ── Shell overrides ── */
.shell.no-sidebar {
  grid-template-columns: 1fr !important;
}

/* ── Right col ── */
.right-col{display:flex;flex-direction:column;height:100%;min-width:0;overflow:hidden;}

/* ── Topbar ── */
.topbar{display:flex;align-items:center;gap:12px;padding:0 24px;height:56px;background:var(--bg-sb);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:30;flex-shrink:0;}
.topbar-breadcrumb{display:flex;align-items:center;gap:6px;flex:1;min-width:0;}
.tb-crumb-base{font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.7px;color:var(--faint);}
.tb-crumb-sep{color:var(--faint);font-size:12px;}
.tb-crumb-current{font-family:'Outfit',sans-serif;font-size:13.5px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tb-crumb-url{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);margin-left:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px;}

/* ── Topbar Nav Links ── */
.tb-nav{display:flex;align-items:center;gap:4px;margin-right:12px;}
.tb-nav-link{font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;color:var(--muted);text-decoration:none;transition:all 0.15s;display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border-radius:6px;border:1px solid transparent;}
.tb-nav-link:hover{color:var(--text);background:var(--bg-hover);}
.tb-nav-link.active{color:var(--teal);background:var(--teal-d);border-color:var(--teal-b);}
.tb-nav-link svg{opacity:0.65;flex-shrink:0;}
.tb-nav-link.active svg{opacity:1;}

.topbar-right{display:flex;align-items:center;gap:8px;}
.tb-icon-btn{width:34px;height:34px;border-radius:8px;border:1px solid var(--border);background:var(--bg3);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted);transition:all 0.15s;}
.tb-icon-btn:hover{background:var(--bg-hover);border-color:var(--border2);color:var(--text);}
.tb-bell-wrap{position:relative;}
.tb-bell-dot{position:absolute;top:5px;right:5px;width:7px;height:7px;border-radius:50%;background:var(--red);border:1.5px solid var(--bg-sb);}
.tb-profile-wrap{position:relative;}
.tb-profile-btn{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#0891b2);border:2px solid var(--border2);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.15s;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;color:white;}
.tb-profile-btn:hover{border-color:var(--teal-b);box-shadow:0 0 0 3px var(--teal-d);}
.tb-dropdown{position:absolute;top:calc(100% + 8px);right:0;width:220px;background:var(--bg2);border:1px solid var(--border2);border-radius:13px;box-shadow:0 16px 48px rgba(0,0,0,0.3);overflow:hidden;z-index:100;animation:ddIn 0.15s ease both;}
@keyframes ddIn{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}
.tb-dd-hdr{padding:14px 14px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;}
.tb-dd-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#0891b2);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:white;flex-shrink:0;}
.tb-dd-name{font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;color:var(--text);line-height:1.2;}
.tb-dd-email{font-family:'DM Mono',monospace;font-size:9.5px;color:var(--muted);}
.tb-dd-items{padding:6px;}
.tb-dd-item{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:8px;border:none;background:none;color:var(--muted);font-family:'Outfit',sans-serif;font-size:12.5px;cursor:pointer;transition:all 0.15s;width:100%;text-align:left;}
.tb-dd-item:hover{background:var(--bg-hover);color:var(--text);}
.tb-dd-item.danger{color:var(--red);}
.tb-dd-item.danger:hover{background:var(--red-d);}
.tb-dd-sep{height:1px;background:var(--border);margin:4px 6px;}

/* ── Content area ── */
.content-area{flex:1;overflow-y:auto;overflow-x:hidden;background:var(--bg);background-image:linear-gradient(var(--grid-dot) 1px,transparent 1px),linear-gradient(90deg,var(--grid-dot) 1px,transparent 1px);background-size:40px 40px;min-height:0;}

/* ── Mobile ── */
.sb-mobile-btn{display:none;width:34px;height:34px;border-radius:8px;border:1px solid var(--border);background:var(--bg3);align-items:center;justify-content:center;cursor:pointer;color:var(--muted);}
.sb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:39;}
@media(max-width:860px){
  .shell{grid-template-columns:1fr !important;height:100vh;}
  .sb{position:fixed;left:0;top:0;bottom:0;height:100vh;transform:translateX(-100%);z-index:50;width:240px;}
  .sb.open{transform:translateX(0);box-shadow:0 0 40px rgba(0,0,0,0.4);}
  .sb-overlay.open{display:block;}
  .sb-mobile-btn{display:flex;}
  .tb-crumb-url{display:none;}
}
@media(max-width:600px){
  .topbar-breadcrumb{display:none !important;}
  .topbar-right{display:none !important;}
  .tb-nav{margin:0 auto !important;}
}
`

const PAGE_LABELS = {
  '/dashboard':                  { crumb: 'Dashboard', section: null },
  '/audit/:id':                  { crumb: 'AI Analysis', section: 'Audit' },
  '/audit/:id/competitors':      { crumb: 'Competitor Benchmarking', section: 'Audit' },
  '/audit/:id/roadmap':          { crumb: 'Optimization Roadmap', section: 'Audit' },
  '/history':                    { crumb: 'Audit History', section: null },
}

export default function AppShell() {
  const { setTheme }            = useTheme()
  const { user, token }         = useAuth()
  const { currentAudit }        = useAudit()
  const { fetch: fetchPlan,
          reset: resetPlan }    = usePlanStore()
  const navigate                = useNavigate()
  const { id: auditId }         = useParams()

  const [isDark,   setIsDark]   = useState(true)
  const [sbOpen,   setSbOpen]   = useState(false)
  const [profOpen, setProfOpen] = useState(false)
  const profileRef              = useRef(null)

  useEffect(() => {
    const t = getPreferredTheme()
    setIsDark(t === 'dark')
    setTheme(t)
  }, [])

  useEffect(() => {
    fetchPlan(token)
  }, [token])

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark'
    setTheme(next)
    setIsDark(!isDark)
  }

  const handleLogout = async () => {
    resetPlan()
    await logout()
    navigate('/login', { replace: true })
  }

  const openHelp = () => {
    const subject = encodeURIComponent('Rankly — Help request')
    const body = encodeURIComponent(
      `Hi Rankly team,\n\n(Describe what you need help with)\n\n— ${user?.email || ''}`
    )
    window.open(`mailto:${HELP_EMAIL}?subject=${subject}&body=${body}`, '_blank')
    notify.info('Help is on the way', `Opening an email to ${HELP_EMAIL}. We usually reply within a day.`)
  }

  const initials   = user?.initials || user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  const activeId   = auditId || currentAudit?.id
  const hasAudit   = !!currentAudit

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {hasAudit && (
        <div className={`sb-overlay${sbOpen ? ' open' : ''}`} onClick={() => setSbOpen(false)} />
      )}

      <div className={`shell${!hasAudit ? ' no-sidebar' : ''}`}>
        {/* ═══ SIDEBAR ═══ */}
        {hasAudit && (
          <aside className={`sb${sbOpen ? ' open' : ''}`}>
            <div className="sb-logo">
              <div className="sb-logo-mark">{Ic.bolt}</div>
              <div>
                <div className="sb-logo-text" style={{ fontFamily: "'Syne',sans-serif" }}>
                  Rank<span>ly</span>
                </div>
                <div className="sb-logo-sub">Intelligence Engine</div>
              </div>
            </div>

            {/* Active audit context */}
            <div className="sb-audit-ctx">
              <div className="sac-label">Current Audit</div>
              <div className="sac-url">{currentAudit.url}</div>
              <div className="sac-kw" style={{display:'flex',alignItems:'center',gap:5}}><Search size={11} strokeWidth={1.8} /> {currentAudit.keyword}</div>
            </div>

            {/* Navigation */}
            <div className="sb-section-label">Audit Analysis</div>
            <nav className="sb-nav">
              <NavLink
                to={`/audit/${currentAudit.id}`}
                end
                className={({ isActive }) => `sb-item${isActive ? ' active-nav' : ''}`}
                onClick={() => setSbOpen(false)}
              >
                {Ic.chart} AI Analysis
                <span className="sb-badge">!</span>
              </NavLink>
              <NavLink
                to={`/audit/${currentAudit.id}/competitors`}
                className={({ isActive }) => `sb-item${isActive ? ' active-nav' : ''}`}
                onClick={() => setSbOpen(false)}
              >
                {Ic.users} Competitors
              </NavLink>
              <NavLink
                to={`/audit/${currentAudit.id}/roadmap`}
                className={({ isActive }) => `sb-item${isActive ? ' active-nav' : ''}`}
                onClick={() => setSbOpen(false)}
              >
                {Ic.map} Roadmap
              </NavLink>
            </nav>

            <div className="sb-sep" />
            <button className="sb-cta" onClick={() => { navigate('/dashboard'); setSbOpen(false) }}>
              {Ic.plus} New Audit
            </button>

            <div className="sb-bottom">
              <button className="sb-item" onClick={() => { openHelp(); setSbOpen(false) }}>{Ic.help} Help</button>
              <button className="sb-theme-toggle" onClick={toggleTheme}>
                {isDark ? <Moon size={14} strokeWidth={1.8} /> : <Sun size={14} strokeWidth={1.8} />}
                <span>{isDark ? 'Dark mode' : 'Light mode'}</span>
                <div className={`tt-track${isDark ? ' on' : ''}`}>
                  <div className="tt-thumb" />
                </div>
              </button>
              <button className="sb-item" onClick={handleLogout}>{Ic.logout} Logout</button>
            </div>
          </aside>
        )}

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="right-col">
          {/* Topbar */}
          <header className="topbar">
            {hasAudit && (
              <button className="sb-mobile-btn" onClick={() => setSbOpen(true)}>{Ic.menu}</button>
            )}

            <div className="topbar-breadcrumb">
              <span className="tb-crumb-base">Rankly</span>
              <span className="tb-crumb-sep">{Ic.chevron}</span>
              <span className="tb-crumb-current">
                {activeId && currentAudit ? 'AI Analysis' : 'Dashboard'}
              </span>
              {currentAudit && (
                <span className="tb-crumb-url">{currentAudit.url}</span>
              )}
            </div>

            {/* Topbar Navigation (Home & History) */}
            <nav className="tb-nav">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `tb-nav-link${isActive ? ' active' : ''}`}
                title="Home Dashboard"
              >
                {Ic.chart} Home
              </NavLink>
              <NavLink
                to="/history"
                className={({ isActive }) => `tb-nav-link${isActive ? ' active' : ''}`}
                title="Audit History"
              >
                {Ic.history} History
              </NavLink>
              <NavLink
                to="/bulk"
                className={({ isActive }) => `tb-nav-link${isActive ? ' active' : ''}`}
                title="Bulk Sitemap Audit"
              >
                {Ic.bulk} Bulk
              </NavLink>
              <NavLink
                to="/developer"
                className={({ isActive }) => `tb-nav-link${isActive ? ' active' : ''}`}
                title="Developer API Keys"
              >
                {Ic.dev} API
              </NavLink>
            </nav>

            <div className="topbar-right">
              <button className="tb-icon-btn" onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}>
                {isDark ? Ic.sun : Ic.moon}
              </button>

              <div className="tb-bell-wrap">
                <button className="tb-icon-btn">
                  {Ic.bell}
                  <div className="tb-bell-dot" />
                </button>
              </div>

              <div className="tb-profile-wrap" ref={profileRef}>
                <button className="tb-profile-btn" onClick={() => setProfOpen(p => !p)}>
                  {initials}
                </button>
                {profOpen && (
                  <div className="tb-dropdown">
                    <div className="tb-dd-hdr">
                      <div className="tb-dd-av">{initials}</div>
                      <div>
                        <div className="tb-dd-name">{user?.name || 'User'}</div>
                        <div className="tb-dd-email">{user?.email || ''}</div>
                      </div>
                    </div>
                    <div className="tb-dd-items">
                      <button className="tb-dd-item">{Ic.user} My Profile</button>
                      <button className="tb-dd-item" onClick={() => { setProfOpen(false); navigate('/billing') }}>
                        <CreditCard size={14} strokeWidth={1.8} /> Billing
                      </button>
                      <button className="tb-dd-item">{Ic.settings} Settings</button>
                      <div className="tb-dd-sep" />
                      <button className="tb-dd-item" onClick={toggleTheme}>
                        {isDark ? Ic.sun : Ic.moon}
                        {isDark ? 'Light mode' : 'Dark mode'}
                      </button>
                      <div className="tb-dd-sep" />
                      <button className="tb-dd-item danger" onClick={handleLogout}>
                        {Ic.logout} Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="content-area">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
