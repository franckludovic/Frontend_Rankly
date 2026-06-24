import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme, getPreferredTheme, applyTheme } from '../../styles/theme.js'
import { Cpu, BarChart2, FileText, Code2, Link, TrendingUp, ArrowUpDown, LayoutGrid, Sun, Moon, ArrowRight, Check, X, ArrowUp, CircleDot } from 'lucide-react'

/* ─── 3D card tilt hook ─────────────────────────────────────────── */
/* NOTE: We must clear the CSS `animation` on the element before driving
   transforms via JS. Per the cascade spec, @keyframes animation values
   (including fill-mode) sit ABOVE normal author styles (incl. inline),
   so el.style.transform is silently ignored while any animation is active. */
function useTilt(ref, { max = 10 } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    function releaseAnimation() {
      el.style.animation = 'none'
    }

    // Clear the entry animation as soon as it finishes so inline transforms work
    el.addEventListener('animationend', releaseAnimation, { once: true })
    // Fallback: clear after animation duration (1s delay + 1s duration = 1.4s)
    const fallbackTimer = setTimeout(releaseAnimation, 1500)

    function onMove(e) {
      // Safety: ensure animation is cleared even if events fire before animationend
      if (el.style.animation !== 'none') el.style.animation = 'none'

      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width  - 0.5   // −0.5 → +0.5
      const y = (e.clientY - r.top)  / r.height - 0.5

      el.style.transition = 'transform 0.12s ease, box-shadow 0.2s ease'
      el.style.transform  = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) scale3d(1.03,1.03,1.03)`
      el.style.boxShadow  = '0 40px 90px rgba(0,0,0,.65), 0 0 0 1px rgba(45,212,191,.14)'
    }

    function onLeave() {
      // cubic-bezier(.34,1.56,.64,1) = spring curve that overshoots slightly → bounce
      el.style.transition = 'transform 0.65s cubic-bezier(.34,1.56,.64,1), box-shadow 0.5s ease'
      el.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
      el.style.boxShadow  = ''
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)

    return () => {
      clearTimeout(fallbackTimer)
      el.removeEventListener('animationend', releaseAnimation)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [ref, max])
}

/* ─── Scroll-reveal hook ────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed') }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ─── Animated counter ──────────────────────────────────────────── */
function Counter({ to, suffix = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      let start = 0
      const step = Math.ceil(to / 60)
      const t = setInterval(() => {
        start = Math.min(start + step, to)
        el.textContent = start.toLocaleString() + suffix
        if (start >= to) clearInterval(t)
      }, 18)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [to, suffix])
  return <span ref={ref}>0</span>
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{
  background-color:#030a14;
  background-image:url('/images/background1.png');
  background-size:cover;
  background-position:center top;
  background-attachment:fixed;
  color:#e2e8f0;font-family:'Outfit',sans-serif;overflow-x:hidden;
  position:relative;
}
body::before{
  content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
  background:rgba(3,10,20,.72);
}
body > *{position:relative;z-index:1;}

/* ── LIGHT MODE background ── */
[data-theme="light"] body{
  background-color:#e8eef5;
  background-image:url('/images/background_light1.png');
  color:#0f172a;
}
[data-theme="light"] body::before{background:rgba(232,238,245,.80);}

/* ── LIGHT MODE overrides ── */
[data-theme="light"] .lp-nav{background:rgba(232,238,245,.85);border-bottom-color:rgba(0,0,0,.08);}
[data-theme="light"] .lp-logo{color:#0f172a;}
[data-theme="light"] .lp-nl{color:rgba(15,23,42,.5);}
[data-theme="light"] .lp-login{color:rgba(15,23,42,.5);border-color:rgba(0,0,0,.1);}
[data-theme="light"] .lp-login:hover{background:rgba(0,0,0,.05);color:#0f172a;}
[data-theme="light"] .lp-h1,[data-theme="light"] .lp-h2,[data-theme="light"] .lp-cta-h{color:#0f172a;}
[data-theme="light"] .lp-hero-sub,[data-theme="light"] .lp-section-sub{color:rgba(15,23,42,.55);}
[data-theme="light"] .lp-hero-trust .lp-trust-txt{color:rgba(15,23,42,.35);}
[data-theme="light"] .lp-widget{background:rgba(241,245,249,.88);border-color:rgba(0,0,0,.09);box-shadow:0 24px 60px rgba(0,0,0,.1);}
[data-theme="light"] .lp-w-title{color:rgba(15,23,42,.35);}
[data-theme="light"] .lp-score-kw{color:rgba(15,23,42,.4);}
[data-theme="light"] .lp-score-url{color:#0d9488;}
[data-theme="light"] .lp-wm{background:rgba(0,0,0,.03);border-color:rgba(0,0,0,.06);}
[data-theme="light"] .lp-wm-lbl{color:rgba(15,23,42,.3);}
[data-theme="light"] .lp-ws{background:rgba(0,0,0,.02);border-color:rgba(0,0,0,.05);}
[data-theme="light"] .lp-ws-txt{color:rgba(15,23,42,.5);}
[data-theme="light"] .lp-chip-float{background:rgba(255,255,255,.9);border-color:rgba(0,0,0,.1);}
[data-theme="light"] .lp-chip1{color:#4f46e5;}[data-theme="light"] .lp-chip2{color:#0d9488;}
[data-theme="light"] .lp-social{border-top-color:rgba(0,0,0,.06);}
[data-theme="light"] .lp-social-item{background:rgba(0,0,0,.03);border-color:rgba(0,0,0,.06);}
[data-theme="light"] .lp-social-item-txt{color:rgba(15,23,42,.45);}
[data-theme="light"] .lp-social-lbl{color:rgba(15,23,42,.3);}
[data-theme="light"] .lp-metrics-bar{background:rgba(0,0,0,.04);border-color:rgba(0,0,0,.06);}
[data-theme="light"] .lp-mb-col{background:#e8eef5;}
[data-theme="light"] .lp-mb-lbl{color:rgba(15,23,42,.4);}
[data-theme="light"] .lp-bc{background:rgba(241,245,249,.72);border-color:rgba(0,0,0,.08);}
[data-theme="light"] .lp-bc:hover{border-color:rgba(0,0,0,.16);background:rgba(241,245,249,.85);}
[data-theme="light"] .lp-bc-title{color:#0f172a;}
[data-theme="light"] .lp-bc-desc{color:rgba(15,23,42,.55);}
[data-theme="light"] .lp-bc-icon{background:rgba(0,0,0,.04);border-color:rgba(0,0,0,.07);}
[data-theme="light"] .lp-bc-glass{background:rgba(215,225,237,.58);border-color:rgba(0,0,0,.09);}
[data-theme="light"] .lp-bc-glass::after{background:linear-gradient(160deg,rgba(255,255,255,.45) 0%,transparent 55%);}
[data-theme="light"] .lp-bc-glass-icon{background:rgba(0,0,0,.05);border-color:rgba(0,0,0,.1);}
[data-theme="light"] .lp-bc-glass-title{color:#0f172a;text-shadow:0 2px 24px rgba(255,255,255,.8);}
[data-theme="light"] .lp-step-title{color:#0f172a;}
[data-theme="light"] .lp-step-desc{color:rgba(15,23,42,.5);}
[data-theme="light"] .lp-who-card{background:rgba(241,245,249,.72);border-color:rgba(0,0,0,.08);}
[data-theme="light"] .lp-who-card::after{display:none;}
[data-theme="light"] .lp-who-title{color:#0f172a;}
[data-theme="light"] .lp-who-desc{color:rgba(15,23,42,.55);}
[data-theme="light"] .lp-wl{color:rgba(15,23,42,.6);}
[data-theme="light"] .lp-spot-visual{background:rgba(241,245,249,.78);border-color:rgba(0,0,0,.09);box-shadow:0 12px 40px rgba(0,0,0,.08);}
[data-theme="light"] .lp-sv-title,[data-theme="light"] .lp-sv-lbl,[data-theme="light"] .lp-cv-hdr-lbl{color:rgba(15,23,42,.4);}
[data-theme="light"] .lp-sv-track{background:rgba(0,0,0,.07);}
[data-theme="light"] .lp-cv-row{border-bottom-color:rgba(0,0,0,.06);}
[data-theme="light"] .lp-cv-domain{color:rgba(15,23,42,.7);}
[data-theme="light"] .lp-cta-sub{color:rgba(15,23,42,.5);}
[data-theme="light"] .lp-cta-note{color:rgba(15,23,42,.3);}
[data-theme="light"] .lp-footer{border-top-color:rgba(0,0,0,.08);}
[data-theme="light"] .lp-footer-logo,[data-theme="light"] .lp-fl,[data-theme="light"] .lp-footer-copy{color:rgba(15,23,42,.35);}
[data-theme="light"] .lp-section-sub{color:rgba(15,23,42,.5);}
[data-theme="light"] .lp-final-cta::before{background:radial-gradient(circle,rgba(13,148,136,.06),transparent 65%);}
[data-theme="light"] .lp-w-badge{background:rgba(4,120,87,.08);border-color:rgba(4,120,87,.2);}
[data-theme="light"] .lp-w-btxt{color:#047857;}
[data-theme="light"] .lp-w-bdot{background:#047857;}
/* ── Light mode: inline-style colour fixes ── */
[data-theme="light"] .lp-ring-val{color:#0f172a;}
[data-theme="light"] .lp-ring-lbl{color:rgba(15,23,42,.35);}
[data-theme="light"] .lp-ring svg circle:first-child{stroke:rgba(0,0,0,.06);}
.lp-spot-bullet{font-family:'DM Mono',monospace;font-size:11px;color:rgba(226,232,240,.5);display:flex;align-items:center;gap:10px;}
[data-theme="light"] .lp-spot-bullet{color:rgba(15,23,42,.6);}
.lp-check-icon{color:#2dd4bf;font-size:14px;flex-shrink:0;}
[data-theme="light"] .lp-check-icon{color:#0d9488;}
.lp-circle-icon{font-size:14px;flex-shrink:0;}
.lp-circle-teal{color:#2dd4bf;}[data-theme="light"] .lp-circle-teal{color:#0d9488;}
.lp-circle-indigo{color:#818cf8;}[data-theme="light"] .lp-circle-indigo{color:#4f46e5;}
.lp-social-icon{font-family:'DM Mono',monospace;font-size:12px;color:rgba(226,232,240,.25);}
[data-theme="light"] .lp-social-icon{color:rgba(15,23,42,.4);}
.lp-terminal-auth{color:#86efac;}
[data-theme="light"] .lp-terminal-auth{color:#047857;}
.lp-terminal-key{color:#fbbf24;}
[data-theme="light"] .lp-terminal-key{color:#b45309;}
.lp-terminal-comment{color:rgba(226,232,240,.25);}
[data-theme="light"] .lp-terminal-comment{color:rgba(15,23,42,.3);}

/* ── Scroll reveal ── */
.reveal{opacity:0;transform:translateY(28px);transition:opacity .65s ease,transform .65s ease;}
.reveal.revealed{opacity:1;transform:none;}
.reveal-left{opacity:0;transform:translateX(-36px);transition:opacity .65s ease,transform .65s ease;}
.reveal-left.revealed{opacity:1;transform:none;}
.reveal-right{opacity:0;transform:translateX(36px);transition:opacity .65s ease,transform .65s ease;}
.reveal-right.revealed{opacity:1;transform:none;}

/* ── Orbs / Background ── */
@keyframes float1{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(60px,-40px) scale(1.08);}}
@keyframes float2{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(-50px,60px) scale(1.05);}}
@keyframes float3{0%,100%{transform:translate(0,0) scale(1);}33%{transform:translate(40px,30px) scale(1.06);}66%{transform:translate(-30px,-20px) scale(.96);}}
.orb{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0;}
.orb1{width:700px;height:700px;background:radial-gradient(circle,rgba(20,184,166,.18),transparent 70%);top:-200px;right:-150px;animation:float1 18s ease-in-out infinite;}
.orb2{width:600px;height:600px;background:radial-gradient(circle,rgba(99,102,241,.15),transparent 70%);bottom:-200px;left:-100px;animation:float2 22s ease-in-out infinite;}
.orb3{width:400px;height:400px;background:radial-gradient(circle,rgba(244,63,94,.1),transparent 70%);top:40%;right:10%;animation:float3 26s ease-in-out infinite;}

/* ── NAV ── */
.lp-nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 32px;height:64px;display:flex;align-items:center;gap:32px;background:rgba(3,10,20,.7);border-bottom:1px solid rgba(255,255,255,.06);backdrop-filter:blur(16px);}
.lp-logo{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#fff;letter-spacing:-.4px;text-decoration:none;}
.lp-logo em{color:#2dd4bf;font-style:normal;}
.lp-nav-links{display:flex;gap:24px;margin-left:16px;}
.lp-nl{font-family:'DM Mono',monospace;font-size:11px;color:rgba(255,255,255,.45);text-decoration:none;letter-spacing:.3px;transition:color .15s;}
.lp-nl:hover{color:#e2e8f0;}
.lp-nav-right{display:flex;align-items:center;gap:10px;margin-left:auto;}
.lp-login{font-family:'DM Mono',monospace;font-size:11px;color:rgba(255,255,255,.45);text-decoration:none;padding:7px 14px;border-radius:7px;border:1px solid rgba(255,255,255,.08);transition:all .15s;}
.lp-login:hover{background:rgba(255,255,255,.05);color:#e2e8f0;border-color:rgba(255,255,255,.15);}
.lp-cta-nav{font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;color:#fff;background:linear-gradient(135deg,#0d9488,#0f766e);padding:8px 18px;border-radius:8px;text-decoration:none;transition:all .2s;border:none;cursor:pointer;}
.lp-cta-nav:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(13,148,136,.35);}

/* ── HERO ── */
.lp-hero{position:relative;min-height:100vh;display:flex;align-items:center;padding:96px 5vw 80px;gap:64px;}
.lp-hero-left{flex:1;max-width:640px;z-index:1;}
.lp-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(20,184,166,.08);border:1px solid rgba(20,184,166,.22);border-radius:100px;padding:5px 14px;margin-bottom:28px;}
.lp-eyebrow-dot{width:7px;height:7px;border-radius:50%;background:#2dd4bf;animation:pulse 2s infinite;}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(45,212,191,.4);}70%{box-shadow:0 0 0 8px transparent;}100%{box-shadow:0 0 0 0 transparent;}}
.lp-eyebrow-txt{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#2dd4bf;}
.lp-h1{font-family:'Syne',sans-serif;font-size:clamp(38px,5.5vw,72px);font-weight:800;line-height:1.06;letter-spacing:-1.5px;color:#f0f8ff;margin-bottom:22px;}
.lp-h1 em{color:#2dd4bf;font-style:normal;position:relative;}
.lp-h1 em::after{content:'';position:absolute;left:0;bottom:-3px;width:100%;height:2px;background:linear-gradient(90deg,#2dd4bf,transparent);}
.lp-h1 strong{color:#818cf8;font-weight:800;}
.lp-hero-sub{font-family:'Outfit',sans-serif;font-size:17px;line-height:1.7;color:rgba(226,232,240,.55);max-width:520px;margin-bottom:36px;}
.lp-hero-sub b{color:rgba(226,232,240,.8);}
.lp-hero-btns{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
.lp-btn-primary{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff;font-family:'Outfit',sans-serif;font-size:15px;font-weight:600;padding:14px 28px;border-radius:12px;text-decoration:none;transition:all .22s;border:none;cursor:pointer;}
.lp-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(13,148,136,.38);}
.lp-btn-ghost{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.04);color:rgba(226,232,240,.6);font-family:'Outfit',sans-serif;font-size:15px;font-weight:500;padding:14px 26px;border-radius:12px;text-decoration:none;border:1px solid rgba(255,255,255,.1);transition:all .22s;cursor:pointer;}
.lp-btn-ghost:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.18);color:#e2e8f0;}
.lp-hero-trust{display:flex;align-items:center;gap:6px;margin-top:24px;}
.lp-trust-txt{font-family:'DM Mono',monospace;font-size:10px;color:rgba(226,232,240,.3);letter-spacing:.3px;}

/* ── HERO WIDGET ── */
.lp-hero-right{flex:0 0 420px;z-index:1;position:relative;}
@keyframes widgetIn{from{opacity:0;transform:translateY(24px) scale(.97);}to{opacity:1;transform:none;}}
.lp-widget{background:rgba(10,18,36,.85);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:24px;backdrop-filter:blur(20px);animation:widgetIn 1s .3s ease both;box-shadow:0 32px 80px rgba(0,0,0,.5),0 0 0 1px rgba(45,212,191,.06);}
.lp-w-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
.lp-w-title{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:rgba(226,232,240,.3);}
.lp-w-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.2);border-radius:100px;padding:3px 10px;}
.lp-w-bdot{width:5px;height:5px;border-radius:50%;background:#10b981;animation:pulse 1.8s infinite;}
.lp-w-btxt{font-family:'DM Mono',monospace;font-size:8px;color:#34d399;letter-spacing:.8px;text-transform:uppercase;}
/* score ring */
.lp-score-row{display:flex;align-items:center;gap:20px;margin-bottom:20px;}
.lp-ring-wrap{position:relative;width:88px;height:88px;flex-shrink:0;}
.lp-ring-svg{transform:rotate(-90deg);}
@keyframes ringFill{from{stroke-dashoffset:220;}to{stroke-dashoffset:48;}}
.lp-ring-arc{stroke-dasharray:220;stroke-dashoffset:48;animation:ringFill 1.6s 0.5s ease both;}
.lp-ring-num{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.lp-ring-val{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:#f0f8ff;line-height:1;}
.lp-ring-lbl{font-family:'DM Mono',monospace;font-size:7px;color:rgba(226,232,240,.3);letter-spacing:.6px;text-transform:uppercase;}
.lp-score-meta{flex:1;}
.lp-score-kw{font-family:'DM Mono',monospace;font-size:9.5px;color:rgba(226,232,240,.35);margin-bottom:4px;}
.lp-score-url{font-family:'DM Mono',monospace;font-size:11px;color:#2dd4bf;margin-bottom:10px;word-break:break-all;}
.lp-score-qual{display:inline-flex;align-items:center;gap:4px;font-family:'DM Mono',monospace;font-size:9px;padding:3px 9px;border-radius:4px;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.2);color:#fbbf24;text-transform:uppercase;letter-spacing:.4px;}
/* mini metrics */
.lp-w-metrics{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:16px;}
.lp-wm{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:8px 10px;}
.lp-wm-val{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;line-height:1;margin-bottom:3px;}
.lp-wm-lbl{font-family:'DM Mono',monospace;font-size:7.5px;color:rgba(226,232,240,.25);text-transform:uppercase;letter-spacing:.4px;}
/* mini suggestions */
.lp-w-sugg{display:flex;flex-direction:column;gap:5px;}
.lp-ws{display:flex;align-items:center;gap:8px;padding:7px 10px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:7px;}
.lp-ws-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
.lp-ws-txt{font-family:'DM Mono',monospace;font-size:9.5px;color:rgba(226,232,240,.4);}
/* floating chips */
@keyframes chipFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
.lp-chip-float{position:absolute;background:rgba(8,15,32,.95);border-radius:12px;padding:10px 14px;backdrop-filter:blur(16px);font-family:'DM Mono',monospace;font-size:10.5px;white-space:nowrap;display:flex;align-items:center;gap:7px;box-shadow:0 8px 32px rgba(0,0,0,.4);}
.lp-chip1{top:-44px;right:-24px;color:#818cf8;border:1px solid rgba(99,102,241,.35);animation:chipFloat 4s ease-in-out infinite;}
.lp-chip2{bottom:-40px;left:-16px;color:#2dd4bf;border:1px solid rgba(45,212,191,.3);animation:chipFloat 5s 1s ease-in-out infinite;}

/* ── SOCIAL PROOF ── */
.lp-social{position:relative;z-index:1;padding:28px 5vw;border-top:1px solid rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;}
.lp-social-lbl{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:rgba(226,232,240,.2);margin-right:8px;}
.lp-social-item{display:flex;align-items:center;gap:7px;padding:7px 14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:8px;}
.lp-social-item-txt{font-family:'DM Mono',monospace;font-size:10px;color:rgba(226,232,240,.35);}
.lp-social-item-txt b{color:rgba(226,232,240,.6);font-weight:500;}

/* ── METRICS BAR ── */
.lp-metrics-bar{position:relative;z-index:1;border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06);padding:36px 5vw;display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,.04);}
.lp-mb-col{background:#030a14;padding:24px 32px;display:flex;flex-direction:column;align-items:center;gap:6px;}
.lp-mb-val{font-family:'Syne',sans-serif;font-size:38px;font-weight:800;line-height:1;background:linear-gradient(135deg,#2dd4bf,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.lp-mb-lbl{font-family:'DM Mono',monospace;font-size:10px;color:rgba(226,232,240,.3);text-align:center;letter-spacing:.4px;text-transform:uppercase;}

/* ── SECTION SHARED ── */
.lp-section{position:relative;z-index:1;padding:80px 5vw;}
.lp-section-eyebrow{display:inline-flex;align-items:center;gap:7px;margin-bottom:14px;}
.lp-section-tag{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;padding:4px 12px;border-radius:100px;background:rgba(20,184,166,.06);border:1px solid rgba(20,184,166,.18);color:#2dd4bf;}
.lp-section-tag.indigo{background:rgba(99,102,241,.06);border-color:rgba(99,102,241,.18);color:#818cf8;}
.lp-section-tag.amber{background:rgba(251,191,36,.06);border-color:rgba(251,191,36,.18);color:#fbbf24;}
.lp-section-tag.rose{background:rgba(244,63,94,.06);border-color:rgba(244,63,94,.18);color:#fb7185;}
.lp-h2{font-family:'Syne',sans-serif;font-size:clamp(28px,3.5vw,48px);font-weight:800;line-height:1.12;letter-spacing:-.8px;color:#f0f8ff;margin-bottom:14px;}
.lp-h2 em{color:#2dd4bf;font-style:normal;}
.lp-h2 strong{color:#818cf8;font-weight:800;}
.lp-section-sub{font-family:'Outfit',sans-serif;font-size:16px;line-height:1.7;color:rgba(226,232,240,.45);max-width:520px;}

/* ── BENTO GRID- static cards ── */
.lp-bento{display:grid;grid-template-columns:repeat(12,1fr);gap:14px;margin-top:48px;}
.bc-1{grid-column:span 5;}.bc-2{grid-column:span 4;}.bc-3{grid-column:span 3;}
.bc-4{grid-column:span 4;}.bc-5{grid-column:span 4;}.bc-6{grid-column:span 4;}
.bc-7{grid-column:span 6;}.bc-8{grid-column:span 6;}
.lp-bc{
  position:relative;border-radius:16px;padding:26px;
  border:1px solid rgba(255,255,255,.08);
  background:rgba(8,15,30,.9);
  display:flex;flex-direction:column;
  transition:border-color .25s,background .25s;
  min-height:200px;
}
.lp-bc:hover{border-color:rgba(255,255,255,.16);}
/* subtle colour glow in top-right corner per theme */
.bc-teal::before,.bc-indigo::before,.bc-amber::before,.bc-rose::before,.bc-green::before{
  content:'';position:absolute;inset:0;border-radius:16px;pointer-events:none;opacity:.7;transition:opacity .25s;}
.lp-bc:hover::before{opacity:1;}
.bc-teal::before{background:radial-gradient(ellipse at 90% 0%,rgba(20,184,166,.12),transparent 55%);}
.bc-indigo::before{background:radial-gradient(ellipse at 90% 0%,rgba(99,102,241,.11),transparent 55%);}
.bc-amber::before{background:radial-gradient(ellipse at 90% 0%,rgba(251,191,36,.08),transparent 55%);}
.bc-rose::before{background:radial-gradient(ellipse at 90% 0%,rgba(244,63,94,.08),transparent 55%);}
.bc-green::before{background:radial-gradient(ellipse at 90% 0%,rgba(52,211,153,.08),transparent 55%);}
/* card content */
.lp-bc{overflow:hidden;}
.lp-bc-hdr{display:flex;align-items:center;gap:12px;margin-bottom:14px;}
.lp-bc-icon{width:38px;height:38px;flex-shrink:0;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);}
.lp-bc-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:#f0f8ff;line-height:1.25;}
.lp-bc-desc{font-family:'Outfit',sans-serif;font-size:12.5px;color:rgba(226,232,240,.48);line-height:1.65;}
/* liquid glass overlay- same technique as navbar */
.lp-bc-glass{
  position:absolute;inset:0;border-radius:16px;
  background:rgba(3,10,20,.41);
  backdrop-filter:blur(10px);
  -webkit-backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,.1);
  border-top-color:rgba(255,255,255,.18);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:16px;
  padding:28px;
  transition:transform .58s cubic-bezier(.4,0,.15,1);
  will-change:transform;
}
/* glass shimmer */
.lp-bc-glass::after{
  content:'';position:absolute;inset:0;border-radius:15px;pointer-events:none;
  background:linear-gradient(160deg,rgba(255,255,255,.07) 0%,transparent 50%);
}
.lp-bc:hover .lp-bc-glass{transform:translateY(-102%);}
/* icon on glass */
.lp-bc-glass-icon{
  width:44px;height:44px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  background:rgba(255,255,255,.1);
  border:1px solid rgba(255,255,255,.18);
  backdrop-filter:blur(4px);
  flex-shrink:0;
}
/* big centered title */
.lp-bc-glass-title{
  font-family:'Syne',sans-serif;
  font-size:clamp(16px,1.5vw,21px);
  font-weight:800;
  color:#ffffff;
  line-height:1.2;
  text-align:center;
  text-shadow:0 2px 24px rgba(0,0,0,.6);
  letter-spacing:-.01em;
}

/* ── HOW IT WORKS ── */
.lp-steps{display:flex;align-items:flex-start;gap:0;margin-top:56px;}
.lp-step{flex:1;text-align:center;padding:0 16px;}
.lp-step-conn{flex:0 0 64px;display:flex;flex-direction:column;align-items:center;padding-top:35px;gap:4px;}
.lp-step-conn-line{width:100%;height:2px;border-radius:2px;background:linear-gradient(90deg,rgba(45,212,191,.35),rgba(129,140,248,.35));}
.lp-step-conn-dot{width:6px;height:6px;border-radius:50%;background:linear-gradient(135deg,#2dd4bf,#818cf8);margin-top:2px;}
.lp-step-num{width:70px;height:70px;border-radius:18px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-family:'Syne',sans-serif;font-size:24px;font-weight:800;position:relative;}
.sn-1{background:rgba(20,184,166,.1);border:1.5px solid rgba(20,184,166,.3);color:#2dd4bf;box-shadow:0 0 24px rgba(20,184,166,.08);}
.sn-2{background:rgba(99,102,241,.1);border:1.5px solid rgba(99,102,241,.3);color:#818cf8;box-shadow:0 0 24px rgba(99,102,241,.08);}
.sn-3{background:rgba(52,211,153,.1);border:1.5px solid rgba(52,211,153,.3);color:#34d399;box-shadow:0 0 24px rgba(52,211,153,.08);}
.lp-step-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:#f0f8ff;margin-bottom:10px;}
.lp-step-desc{font-family:'Outfit',sans-serif;font-size:13.5px;color:rgba(226,232,240,.4);line-height:1.6;}

/* ── FOR WHO ── */
.lp-who-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px;}
.lp-who-card{border-radius:16px;border:1px solid rgba(255,255,255,.07);background:rgba(10,18,36,.5);padding:32px 28px;transition:all .25s;position:relative;overflow:hidden;}
.lp-who-card:hover{border-color:rgba(255,255,255,.14);transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,.3);}
.lp-who-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;}
.wc-seo::after{background:linear-gradient(90deg,#2dd4bf,transparent);}
.wc-agency::after{background:linear-gradient(90deg,#818cf8,transparent);}
.wc-dev::after{background:linear-gradient(90deg,#fbbf24,transparent);}
.lp-who-icon{font-size:36px;margin-bottom:16px;display:block;}
.lp-who-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:#f0f8ff;margin-bottom:8px;}
.lp-who-role{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.8px;margin-bottom:14px;display:block;}
.lp-who-desc{font-family:'Outfit',sans-serif;font-size:13.5px;color:rgba(226,232,240,.45);line-height:1.65;margin-bottom:20px;}
.lp-who-list{display:flex;flex-direction:column;gap:7px;}
.lp-wl{display:flex;align-items:center;gap:8px;font-family:'DM Mono',monospace;font-size:10px;color:rgba(226,232,240,.45);}
.lp-wl-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}

/* ── SPOTLIGHT SECTIONS ── */
.lp-spot{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;padding:56px 5vw;}
.lp-spot.flip{direction:rtl;}
.lp-spot.flip>*{direction:ltr;}
.lp-spot-text{}
.lp-spot-visual{border-radius:20px;border:1px solid rgba(255,255,255,.09);background:rgba(10,18,36,.7);padding:28px;backdrop-filter:blur(12px);box-shadow:0 24px 64px rgba(0,0,0,.4);}
/* Visual 1: Score breakdown bars */
.lp-sv-title{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:rgba(226,232,240,.3);margin-bottom:16px;}
.lp-sv-row{display:flex;align-items:center;gap:12px;margin-bottom:10px;}
.lp-sv-lbl{font-family:'DM Mono',monospace;font-size:10px;color:rgba(226,232,240,.4);width:100px;flex-shrink:0;}
.lp-sv-track{flex:1;height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden;}
@keyframes barSlide{from{width:0;}to{width:var(--w,0);}}
.lp-sv-fill{height:100%;border-radius:3px;animation:barSlide 1.2s ease both;}
.lp-sv-val{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;width:36px;text-align:right;flex-shrink:0;}
/* Visual 2: Competitor table */
.lp-cv-hdr{display:grid;grid-template-columns:1fr repeat(3,80px);gap:8px;margin-bottom:8px;border-bottom:1px solid rgba(255,255,255,.06);padding-bottom:8px;}
.lp-cv-hdr-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.5px;color:rgba(226,232,240,.2);text-align:center;}
.lp-cv-hdr-lbl:first-child{text-align:left;}
.lp-cv-row{display:grid;grid-template-columns:1fr repeat(3,80px);gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04);align-items:center;}
.lp-cv-domain{font-family:'DM Mono',monospace;font-size:10.5px;color:rgba(226,232,240,.6);}
.lp-cv-val{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;text-align:center;}
.lp-cv-you{font-family:'DM Mono',monospace;font-size:8px;padding:2px 7px;border-radius:4px;background:rgba(45,212,191,.1);border:1px solid rgba(45,212,191,.2);color:#2dd4bf;text-align:center;display:block;margin:0 auto;}

/* ── FINAL CTA ── */
.lp-final-cta{position:relative;z-index:1;text-align:center;padding:72px 5vw 100px;overflow:hidden;}
.lp-final-cta::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;height:700px;background:radial-gradient(circle,rgba(20,184,166,.08),transparent 65%);pointer-events:none;}
.lp-cta-h{font-family:'Syne',sans-serif;font-size:clamp(32px,4.5vw,58px);font-weight:800;line-height:1.1;letter-spacing:-.8px;color:#f0f8ff;margin-bottom:18px;}
.lp-cta-h em{color:#2dd4bf;font-style:normal;}
.lp-cta-sub{font-family:'Outfit',sans-serif;font-size:16px;color:rgba(226,232,240,.4);margin-bottom:40px;line-height:1.6;}
.lp-cta-note{font-family:'DM Mono',monospace;font-size:10px;color:rgba(226,232,240,.2);margin-top:18px;letter-spacing:.3px;}

/* ── FOOTER ── */
.lp-footer{position:relative;z-index:1;border-top:1px solid rgba(255,255,255,.06);padding:40px 5vw;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;}
.lp-footer-logo{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:rgba(226,232,240,.4);}
.lp-footer-logo em{color:#2dd4bf;font-style:normal;}
.lp-footer-links{display:flex;gap:20px;}
.lp-fl{font-family:'DM Mono',monospace;font-size:10px;color:rgba(226,232,240,.25);text-decoration:none;transition:color .15s;cursor:pointer;}
.lp-fl:hover{color:rgba(226,232,240,.55);}
.lp-footer-copy{font-family:'DM Mono',monospace;font-size:10px;color:rgba(226,232,240,.2);}

/* ── THEME TOGGLE BUTTON ── */
.lp-theme-btn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.55);cursor:pointer;transition:all .2s;flex-shrink:0;}
.lp-theme-btn:hover{background:rgba(255,255,255,.1);color:#e2e8f0;}
[data-theme="light"] .lp-theme-btn{background:rgba(0,0,0,.05);border-color:rgba(0,0,0,.1);color:rgba(15,23,42,.5);}
[data-theme="light"] .lp-theme-btn:hover{background:rgba(0,0,0,.08);color:#0f172a;}

/* ── DEVELOPER API grid ── */
.lp-api-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
.lp-api-grid > *{min-width:0;}
.lp-terminal{background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.09);border-radius:14px;overflow:hidden;}
[data-theme="light"] .lp-terminal{background:rgba(15,23,42,.06);border-color:rgba(0,0,0,.12);}
.lp-terminal-bar{padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:8px;}
[data-theme="light"] .lp-terminal-bar{border-bottom-color:rgba(0,0,0,.08);}
.lp-terminal-lbl{font-family:'DM Mono',monospace;font-size:10px;color:rgba(226,232,240,.2);margin-left:8px;}
[data-theme="light"] .lp-terminal-lbl{color:rgba(15,23,42,.25);}
.lp-terminal pre{margin:0;padding:20px;font-family:'DM Mono',monospace;font-size:11.5px;line-height:1.75;color:#a5f3fc;overflow-x:auto;max-width:100%;}
[data-theme="light"] .lp-terminal pre{color:#0369a1;}

/* ── TABLET (≤1024px) ── */
@media(max-width:1024px){
  .lp-nav{padding:0 20px;}
  .lp-hero{flex-direction:column;padding:88px 5vw 60px;gap:40px;min-height:auto;}
  .lp-hero-left{max-width:100%;}
  .lp-hero-right{flex:none;width:100%;max-width:500px;margin:0 auto;}
  .lp-chip1,.lp-chip2{display:none;}
  .lp-metrics-bar{grid-template-columns:repeat(2,1fr);}
  .lp-mb-val{font-size:30px;}
  .lp-bento{grid-template-columns:1fr 1fr;}
  .bc-1,.bc-2{grid-column:span 2;}
  .bc-3,.bc-4,.bc-5,.bc-6,.bc-7,.bc-8{grid-column:span 1;}
  .lp-steps{flex-direction:column;align-items:center;gap:0;}
  .lp-step-conn{transform:rotate(90deg);padding:0;height:40px;width:40px;flex:0 0 40px;}
  .lp-who-grid{grid-template-columns:1fr 1fr;}
  .lp-spot,.lp-spot.flip{grid-template-columns:1fr;gap:36px;direction:ltr;}
  .lp-spot.flip>*{direction:ltr;}
  .lp-cv-hdr,.lp-cv-row{grid-template-columns:1fr repeat(2,70px);}
  .lp-api-grid{grid-template-columns:1fr;gap:40px;}
}

/* ── MOBILE (≤640px) ── */
@media(max-width:640px){
  .lp-nav{padding:0 16px;gap:12px;}
  .lp-nav-links{display:none;}
  .lp-hero{padding:80px 16px 48px;gap:32px;}
  .lp-hero-sub{font-size:15px;}
  .lp-hero-btns{flex-direction:column;align-items:stretch;}
  .lp-btn-primary,.lp-btn-ghost{justify-content:center;}
  .lp-hero-right{display:none;}
  .lp-section{padding:56px 16px;}
  .lp-spot{padding:40px 16px;gap:28px;}
  .lp-metrics-bar{grid-template-columns:1fr 1fr;padding:24px 16px;}
  .lp-mb-val{font-size:26px;}
  .lp-mb-col{padding:16px;}
  .lp-bento{grid-template-columns:1fr;gap:10px;}
  .bc-1,.bc-2,.bc-3,.bc-4,.bc-5,.bc-6,.bc-7,.bc-8{grid-column:span 1;}
  .lp-bc{min-height:170px;}
  .lp-steps{gap:0;}
  .lp-step{padding:0 8px;}
  .lp-step-title{font-size:15px;}
  .lp-who-grid{grid-template-columns:1fr;}
  .lp-who-card{padding:24px 20px;}
  .lp-spot-visual{padding:18px;overflow-x:auto;}
  .lp-sv-lbl{width:72px;font-size:9px;}
  .lp-cv-hdr,.lp-cv-row{grid-template-columns:1fr 54px 54px;font-size:9px;}
  .lp-api-grid{grid-template-columns:1fr;gap:28px;}
  .lp-final-cta{padding:48px 16px 64px;}
  .lp-cta-sub{font-size:14px;}
  .lp-footer{flex-direction:column;align-items:flex-start;gap:12px;padding:28px 16px;}
  .lp-footer-links{flex-wrap:wrap;gap:12px;}
  .lp-social{padding:20px 16px;gap:8px;}
}

/* ── COMPARISON TABLE ── */
.lp-comp-wrap{overflow-x:auto;margin-top:40px;}
.lp-comp-table{width:100%;border-collapse:collapse;min-width:540px;}
.lp-comp-table th{font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.6px;color:rgba(226,232,240,.3);padding:12px 16px;text-align:center;border-bottom:1px solid rgba(255,255,255,.07);}
.lp-comp-table th:first-child{text-align:left;}
.lp-comp-table th.th-us{color:#2dd4bf;}
.lp-comp-table td{padding:12px 16px;text-align:center;border-bottom:1px solid rgba(255,255,255,.04);font-family:'DM Mono',monospace;font-size:11px;color:rgba(226,232,240,.45);}
.lp-comp-table td:first-child{text-align:left;color:rgba(226,232,240,.65);font-size:12px;}
.lp-comp-table td.td-us{color:#2dd4bf;font-weight:700;}
.lp-comp-table tr:last-child td{border-bottom:none;}
.lp-comp-table tr:hover td{background:rgba(255,255,255,.015);}
.comp-yes{color:#2dd4bf;}
.comp-no{color:rgba(226,232,240,.18);}
.comp-price{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;}
[data-theme="light"] .lp-comp-table th{color:rgba(15,23,42,.3);}
[data-theme="light"] .lp-comp-table td{color:rgba(15,23,42,.5);}
[data-theme="light"] .lp-comp-table td:first-child{color:rgba(15,23,42,.65);}
[data-theme="light"] .lp-comp-table td.td-us{color:#0d9488;}
[data-theme="light"] .lp-comp-table th.th-us{color:#0d9488;}
[data-theme="light"] .comp-yes{color:#0d9488;}
[data-theme="light"] .comp-no{color:rgba(15,23,42,.15);}

/* ── PRICING ── */
.lp-pricing-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:48px;}
.lp-pc{border-radius:16px;padding:28px 24px;border:1px solid rgba(255,255,255,.08);background:rgba(8,15,30,.9);position:relative;transition:border-color .25s,transform .25s;display:flex;flex-direction:column;}
.lp-pc:hover{border-color:rgba(255,255,255,.16);transform:translateY(-4px);}
.lp-pc-pop{border-color:rgba(45,212,191,.3)!important;background:rgba(8,20,28,.95)!important;box-shadow:0 0 0 1px rgba(45,212,191,.1),0 24px 60px rgba(0,0,0,.4);}
.lp-pc-pop-badge{position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.8px;text-transform:uppercase;padding:4px 14px;border-radius:100px;white-space:nowrap;}
.lp-pc-tier{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:rgba(226,232,240,.3);margin-bottom:10px;}
.lp-pc-price{font-family:'Syne',sans-serif;font-size:38px;font-weight:800;color:#f0f8ff;line-height:1;margin-bottom:4px;letter-spacing:-1px;}
.lp-pc-price em{color:#2dd4bf;font-style:normal;}
.lp-pc-period{font-family:'DM Mono',monospace;font-size:10px;color:rgba(226,232,240,.3);margin-bottom:18px;}
.lp-pc-desc{font-family:'Outfit',sans-serif;font-size:13px;color:rgba(226,232,240,.45);line-height:1.55;margin-bottom:22px;}
.lp-pc-list{display:flex;flex-direction:column;gap:9px;margin-bottom:24px;flex:1;}
.lp-pc-item{display:flex;align-items:flex-start;gap:8px;font-family:'DM Mono',monospace;font-size:10.5px;color:rgba(226,232,240,.5);}
.lp-pc-check{color:#2dd4bf;flex-shrink:0;margin-top:1px;}
.lp-pc-btn{width:100%;padding:11px;border-radius:10px;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;border:none;transition:all .2s;}
.lp-pc-btn-outline{background:transparent;border:1px solid rgba(255,255,255,.12);color:rgba(226,232,240,.6);}
.lp-pc-btn-outline:hover{border-color:rgba(255,255,255,.25);color:#e2e8f0;background:rgba(255,255,255,.04);}
.lp-pc-btn-solid{background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff;box-shadow:0 6px 20px rgba(13,148,136,.3);}
.lp-pc-btn-solid:hover{transform:translateY(-1px);box-shadow:0 10px 28px rgba(13,148,136,.4);}
[data-theme="light"] .lp-pc{background:rgba(241,245,249,.72);border-color:rgba(0,0,0,.08);}
[data-theme="light"] .lp-pc-pop{background:rgba(241,245,249,.92)!important;border-color:rgba(13,148,136,.3)!important;}
[data-theme="light"] .lp-pc-tier{color:rgba(15,23,42,.3);}
[data-theme="light"] .lp-pc-price{color:#0f172a;}
[data-theme="light"] .lp-pc-period,[data-theme="light"] .lp-pc-item{color:rgba(15,23,42,.5);}
[data-theme="light"] .lp-pc-desc{color:rgba(15,23,42,.55);}
[data-theme="light"] .lp-pc-btn-outline{border-color:rgba(0,0,0,.15);color:rgba(15,23,42,.6);}
[data-theme="light"] .lp-pc-btn-outline:hover{color:#0f172a;}
@media(max-width:1024px){.lp-pricing-grid{grid-template-columns:1fr 1fr;}}
@media(max-width:640px){.lp-pricing-grid{grid-template-columns:1fr;}}
`

const IC = {
  mlScore:     (c='#2dd4bf') => <Cpu size={22} strokeWidth={1.8} style={{stroke:c}} />,
  competitors: (c='#818cf8') => <BarChart2 size={22} strokeWidth={1.8} style={{stroke:c}} />,
  brief:       (c='#fbbf24') => <FileText size={22} strokeWidth={1.8} style={{stroke:c}} />,
  schema:      (c='#2dd4bf') => <Code2 size={22} strokeWidth={1.8} style={{stroke:c}} />,
  linking:     (c='#818cf8') => <Link size={22} strokeWidth={1.8} style={{stroke:c}} />,
  timeline:    (c='#34d399') => <TrendingUp size={22} strokeWidth={1.8} style={{stroke:c}} />,
  abTest:      (c='#fb7185') => <ArrowUpDown size={22} strokeWidth={1.8} style={{stroke:c}} />,
  bulk:        (c='#fbbf24') => <LayoutGrid size={22} strokeWidth={1.8} style={{stroke:c}} />,
}

const BENTO_FEATURES = [
  { cls:'bc-1 bc-teal reveal',  color:'teal',   icon:IC.mlScore(),    tag:'tag-teal',   tagLabel:'ML Scoring',
    title:'Precision SEO Scoring',          desc:'Our model analyses 70+ on-page signals to predict your ranking position with 83.8% accuracy- a genuine probability, not a checklist.' },
  { cls:'bc-2 bc-indigo reveal',color:'indigo', icon:IC.competitors(),tag:'tag-indigo', tagLabel:'Competitors',
    title:'Real Competitor Benchmarking',   desc:'Head-to-head on word count, keyword density, internal links, and technical signals against every page currently outranking you.' },
  { cls:'bc-3 bc-amber reveal', color:'amber',  icon:IC.brief(),      tag:'tag-amber',  tagLabel:'Content AI',
    title:'Content Brief Generator',        desc:'AI-written outlines, semantic entities, FAQs, and target word counts- ready to hand to a writer or publish directly.' },
  { cls:'bc-4 bc-teal reveal',  color:'teal',   icon:IC.schema(),     tag:'tag-teal',   tagLabel:'Schema',
    title:'Schema Code Generator',          desc:'Detects your page type and generates copy-paste structured data you can drop straight into your site for rich search results.' },
  { cls:'bc-5 bc-indigo reveal',color:'indigo', icon:IC.linking(),    tag:'tag-indigo', tagLabel:'Linking',
    title:'Smart Internal Linking',         desc:'Finds semantic link opportunities across your whole site based on content similarity- not just keyword matching.' },
  { cls:'bc-6 bc-green reveal', color:'green',  icon:IC.timeline(),   tag:'tag-green',  tagLabel:'Timeline',
    title:'Score Timeline',                 desc:'Weekly or monthly re-audits tracked as a chart. Turn Rankly into a continuous monitoring platform, not a one-shot audit.' },
  { cls:'bc-7 bc-rose reveal',  color:'rose',   icon:IC.abTest(),     tag:'tag-rose',   tagLabel:'A/B',
    title:'Title & Meta A/B Scorer',        desc:'Write 2–3 title variants, get a score for each. See which one ranks best- before you publish.' },
  { cls:'bc-8 bc-amber reveal', color:'amber',  icon:IC.bulk(),       tag:'tag-amber',  tagLabel:'Bulk Audit',
    title:'Sitemap Bulk Audit',             desc:'Point at a sitemap.xml and audit up to 50 pages in parallel. Site-wide SEO health in minutes, not hours.' },
]

const SCORE_ROWS = [
  { label: 'Keyword signals',  pct: 88, color: '#2dd4bf', val: '88' },
  { label: 'Technical score',  pct: 72, color: '#818cf8', val: '7.2/10' },
  { label: 'Content depth',    pct: 65, color: '#fbbf24', val: '1,840w' },
  { label: 'Link authority',   pct: 54, color: '#34d399', val: '54%' },
  { label: 'Schema markup',    pct: 40, color: '#f87171', val: 'Missing' },
]

const COMP_ROWS = [
  { domain: 'ahrefs.com',       wc: '3,200', kd: '2.1%', links: '84', you: false },
  { domain: 'semrush.com',      wc: '2,850', kd: '1.8%', links: '72', you: false },
  { domain: 'your-page.com',    wc: '1,400', kd: '0.9%', links: '12', you: true  },
]

const CY = <span className="comp-yes" style={{display:'flex',justifyContent:'center'}}><Check size={14} strokeWidth={2.5} /></span>
const CN = <span className="comp-no" style={{display:'flex',justifyContent:'center'}}><X size={14} strokeWidth={2} /></span>

const COMPARISON_ROWS = [
  { label: 'Starting price',         us: <span className="comp-price" style={{color:'#2dd4bf'}}>Free</span>,  ahrefs: <span className="comp-price">$129/mo</span>, surfer: <span className="comp-price">$89/mo</span>, semrush: <span className="comp-price">$130/mo</span> },
  { label: 'ML rank prediction',     us: CY, ahrefs: CN, surfer: CN, semrush: CN },
  { label: 'Real-time SERP scrape',  us: CY, ahrefs: CY, surfer: CY, semrush: CY },
  { label: 'Content brief (AI)',      us: CY, ahrefs: CN, surfer: CY, semrush: CN },
  { label: 'Schema code generator',  us: CY, ahrefs: CN, surfer: CN, semrush: CN },
  { label: 'A/B title scorer',        us: CY, ahrefs: CN, surfer: CN, semrush: CN },
  { label: 'Sitemap bulk audit',      us: CY, ahrefs: CY, surfer: CN, semrush: CY },
  { label: 'REST API',                us: CY, ahrefs: CY, surfer: CN, semrush: CY },
  { label: 'Free tier',               us: CY, ahrefs: CN, surfer: CN, semrush: CN },
]

const PRICING_TIERS = [
  {
    name: 'Free', price: 0, xaf: null, popular: false,
    desc: 'For solo creators who want to stop flying blind on every publish.',
    features: ['3 audits / month', '10 SERP competitors per audit', 'SEO score + rank prediction', 'On-page recommendations', 'Schema code generator'],
  },
  {
    name: 'Pro', price: 14, xaf: '8,400', popular: true,
    desc: 'For SEO pros who run audits every week, not every quarter.',
    features: ['50 audits / month', 'PDF report export', 'AI content brief', 'A/B title scorer', 'Score timeline (weekly)', 'Competitor change alerts'],
  },
  {
    name: 'Agency', price: 39, xaf: '23,400', popular: false,
    desc: 'For teams billing clients who demand real data, not vague advice.',
    features: ['500 audits / month', 'Bulk sitemap audit (50 pages)', 'REST API access', 'Keyword cannibalization', 'Internal link suggestions', 'Up to 5 seats'],
  },
  {
    name: 'Business', price: 99, xaf: '59,400', popular: false,
    desc: 'Unlimited scale, white-label exports, and direct support.',
    features: ['Unlimited audits', 'Unlimited bulk runs', 'White-label PDF reports', 'Priority support', 'Custom report branding', 'Up to 15 seats'],
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const [theme, setThemeState] = useState(() => getPreferredTheme())
  const widgetRef = useRef(null)
  useReveal()
  useTilt(widgetRef, { max: 9 })

  useEffect(() => { applyTheme(theme) }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setThemeState(next)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Orbs */}
      <div className="orb orb1" aria-hidden />
      <div className="orb orb2" aria-hidden />
      <div className="orb orb3" aria-hidden />

      {/* ── NAV ── */}
      <nav className="lp-nav">
        <a className="lp-logo" href="/">Rank<em>ly</em></a>
        <div className="lp-nav-links">
          <a className="lp-nl" href="#features">Features</a>
          <a className="lp-nl" href="#how">How it works</a>
          <a className="lp-nl" href="#who">For who</a>
          <a className="lp-nl" href="#pricing">Pricing</a>
          <a className="lp-nl" href="#api">Developer API</a>
        </div>
        <div className="lp-nav-right">
          <button className="lp-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />}
          </button>
          <a className="lp-login" href="/login">Log in</a>
          <button className="lp-cta-nav" style={{display:'inline-flex',alignItems:'center',gap:6}} onClick={() => navigate('/register')}>Start Free <ArrowRight size={13} strokeWidth={2.2} /></button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-hero-left">
          <h1 className="lp-h1">
            Page 3 is where<br />good content <em>dies.</em>
          </h1>
          <p className="lp-hero-sub">
            Rankly runs <b>70+ on-page checks</b>, scrapes every page outranking you right now, and hands you a numbered list of what to fix - An "Add the keyword .... to your H1 tab" instead of a generic "improve your content" .
          </p>
          <div className="lp-hero-btns">
            <button className="lp-btn-primary" onClick={() => navigate('/register')}>
              Audit a page for free
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
            <a className="lp-btn-ghost" href="#how">See how it works ↓</a>
          </div>
          <div className="lp-hero-trust">
            <span className="lp-trust-txt">No credit card &nbsp;·&nbsp; First audit free &nbsp;·&nbsp; Results in 60s</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:20, flexWrap:'wrap' }}>
            {['SEO Pros','Agencies','Developers'].map((l,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <Check size={12} strokeWidth={2.5} color="#2dd4bf" />
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'rgba(226,232,240,.35)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lp-hero-right">
          <div className="lp-widget" ref={widgetRef} style={{ willChange:'transform', transformStyle:'preserve-3d' }}>
            <div className="lp-w-hdr">
              <span className="lp-w-title">Audit Result</span>
              <div style={{display:'inline-flex',alignItems:'center',gap:5,background:'rgba(99,102,241,.12)',border:'1px solid rgba(99,102,241,.3)',borderRadius:8,padding:'4px 10px',fontFamily:"'DM Mono',monospace",fontSize:10,color:'#818cf8',fontWeight:500}}><ArrowUp size={12} strokeWidth={1.8} /> Predicted Rank: #4</div>
            </div>
            <div className="lp-score-row">
              <div className="lp-ring-wrap">
                <svg className="lp-ring-svg" width="88" height="88" viewBox="0 0 88 88">
                  <circle cx="44" cy="44" r="35" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="7"/>
                  <circle className="lp-ring-arc" cx="44" cy="44" r="35" fill="none"
                    stroke="url(#rg)" strokeWidth="7" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2dd4bf"/>
                      <stop offset="100%" stopColor="#818cf8"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="lp-ring-num">
                  <div className="lp-ring-val">78</div>
                  <div className="lp-ring-lbl">/100</div>
                </div>
              </div>
              <div className="lp-score-meta">
                <div className="lp-score-kw">Keyword: "seo analysis tool"</div>
                <div className="lp-score-url">yourpage.com/blog/seo-tips</div>
                <span className="lp-score-qual">Medium Quality</span>
              </div>
            </div>
            <div className="lp-w-metrics">
              <div className="lp-wm"><div className="lp-wm-val" style={{color:'#818cf8'}}>#12</div><div className="lp-wm-lbl">Pred. rank</div></div>
              <div className="lp-wm"><div className="lp-wm-val" style={{color:'#fbbf24'}}>1,840</div><div className="lp-wm-lbl">Words</div></div>
              <div className="lp-wm"><div className="lp-wm-val" style={{color:'#f87171'}}>5</div><div className="lp-wm-lbl">Issues</div></div>
            </div>
            <div className="lp-w-sugg">
              <div className="lp-ws"><div className="lp-ws-dot" style={{background:'#f87171'}}/><span className="lp-ws-txt">Add keyword to H1 tag</span></div>
              <div className="lp-ws"><div className="lp-ws-dot" style={{background:'#fbbf24'}}/><span className="lp-ws-txt">Add JSON-LD schema markup</span></div>
              <div className="lp-ws"><div className="lp-ws-dot" style={{background:'#2dd4bf'}}/><span className="lp-ws-txt">Increase content to 2,400+ words</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <div className="lp-social">
        <span className="lp-social-lbl">Built for</span>
        {[
          { txt: <><b>SEO professionals</b> who want data, not opinions</> },
          { txt: <><b>Agencies</b> running multi-client audits at scale</> },
          { txt: <><b>Developers</b> integrating via REST API</> },
        ].map((s, i) => (
          <div key={i} className="lp-social-item">
            <span className="lp-social-item-txt">{s.txt}</span>
          </div>
        ))}
      </div>

      {/* ── METRICS BAR ── */}
      <div className="lp-metrics-bar">
        <div className="lp-mb-col reveal"><div className="lp-mb-val"><Counter to={83} suffix=".8%" /></div><div className="lp-mb-lbl">ML Model Accuracy</div></div>
        <div className="lp-mb-col reveal"><div className="lp-mb-val"><Counter to={70} suffix="+" /></div><div className="lp-mb-lbl">SEO Signals Analyzed</div></div>
        <div className="lp-mb-col reveal"><div className="lp-mb-val"><Counter to={10} /></div><div className="lp-mb-lbl">Competitors Per Audit</div></div>
        <div className="lp-mb-col reveal"><div className="lp-mb-val"><Counter to={50} /></div><div className="lp-mb-lbl">Pages Per Bulk Audit</div></div>
      </div>

      {/* ── FEATURES BENTO ── */}
      <section className="lp-section" id="features">
        <h2 className="lp-h2 reveal">Everything your SEO stack<br />is <em>missing.</em></h2>
        <p className="lp-section-sub reveal">One tool. Every signal. Predictions that tell you the truth- not a checklist of obvious advice.</p>
        <div className="lp-bento">
          {BENTO_FEATURES.map((f, i) => (
            <div key={i} className={`lp-bc ${f.cls}`}>
              {/* content revealed on hover */}
              <div className="lp-bc-hdr">
                <div className="lp-bc-icon">{f.icon}</div>
                <div className="lp-bc-title">{f.title}</div>
              </div>
              <div className="lp-bc-desc">{f.desc}</div>
              {/* glass curtain- shows by default, lifts up on hover */}
              <div className="lp-bc-glass">
                <div className="lp-bc-glass-icon">{f.icon}</div>
                <div className="lp-bc-glass-title">{f.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-section" id="how" style={{ borderTop:'1px solid rgba(255,255,255,.05)' }}>
        <h2 className="lp-h2 reveal">Results in <strong>60 seconds.</strong><br />Actionable in minutes.</h2>
        <div className="lp-steps">
          {[
            { n:'01', cls:'sn-1', title:'Enter your URL + keyword', desc:'Paste any page URL and the keyword you want to rank for. No tracking pixel, no site access- just a URL.' },
            { n:'02', cls:'sn-2', title:'Our model analyses 70+ signals', desc:'Title, meta, headings, content depth, technical factors, and real SERP competitor data- all processed in parallel.' },
            { n:'03', cls:'sn-3', title:'Get your score + action plan', desc:'SEO score, predicted rank, competitor gaps, schema code, content brief, and a prioritised roadmap- in one dashboard.' },
          ].map((s, i) => (
            <>
              {i > 0 && (
                <div key={`conn-${i}`} className="lp-step-conn">
                  <div className="lp-step-conn-line" />
                </div>
              )}
              <div key={i} className="lp-step reveal" style={{ transitionDelay: `${i * 0.15}s` }}>
                <div className={`lp-step-num ${s.cls}`}>{s.n}</div>
                <div className="lp-step-title">{s.title}</div>
                <div className="lp-step-desc">{s.desc}</div>
              </div>
            </>
          ))}
        </div>
      </section>

      {/* ── SPOTLIGHT 1: Score breakdown ── */}
      <div className="lp-spot" style={{ borderTop:'1px solid rgba(255,255,255,.05)' }}>
        <div className="lp-spot-text reveal-left">
          <div style={{ width:32, height:3, borderRadius:2, background:'linear-gradient(90deg,#2dd4bf,rgba(45,212,191,0))', marginBottom:20 }} />
          <h2 className="lp-h2" style={{ fontSize:'clamp(24px,2.8vw,38px)' }}>A score that<br /><em>explains itself.</em></h2>
          <p className="lp-section-sub" style={{ marginTop:12, fontSize:14 }}>
            Most SEO scores are black boxes. Rankly breaks your score into every contributing signal- so you know exactly which lever to pull first.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:22 }}>
            {['Prioritised roadmap- not just a list of problems', 'Competitor gap analysis per metric', 'Weekly re-audit to track improvements'].map((t, i) => (
              <div key={i} className="lp-spot-bullet">
                <span className="lp-check-icon"><Check size={14} strokeWidth={2} /></span> {t}
              </div>
            ))}
          </div>
        </div>
        <div className="lp-spot-visual reveal-right">
          <div className="lp-sv-title">Score Breakdown</div>
          {SCORE_ROWS.map((r, i) => (
            <div key={i} className="lp-sv-row">
              <div className="lp-sv-lbl">{r.label}</div>
              <div className="lp-sv-track">
                <div className="lp-sv-fill" style={{ width: r.pct + '%', background: r.color, '--w': r.pct + '%', animationDelay: i * 0.12 + 's' }} />
              </div>
              <div className="lp-sv-val" style={{ color: r.color }}>{r.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SPOTLIGHT 2: Competitor table ── */}
      <div className="lp-spot flip" style={{ borderTop:'1px solid rgba(255,255,255,.05)' }}>
        <div className="lp-spot-text reveal-right">
          <div style={{ width:32, height:3, borderRadius:2, background:'linear-gradient(90deg,#818cf8,rgba(99,102,241,0))', marginBottom:20 }} />
          <h2 className="lp-h2" style={{ fontSize:'clamp(24px,2.8vw,38px)' }}>See exactly where<br /><strong>you're losing.</strong></h2>
          <p className="lp-section-sub" style={{ marginTop:12, fontSize:14 }}>
            Rankly fetches the top 10 pages ranking for your keyword, scrapes their metrics, and shows you a side-by-side comparison of every signal that matters.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:22 }}>
            {['SERP feature detection- Featured Snippet, PAA, Images', 'Keyword placement heatmap across all competitors', 'Semantic similarity for internal linking gaps'].map((t, i) => (
              <div key={i} className="lp-spot-bullet">
                <span className="lp-circle-icon lp-circle-indigo"><CircleDot size={14} strokeWidth={2} /></span> {t}
              </div>
            ))}
          </div>
        </div>
        <div className="lp-spot-visual reveal-left">
          <div className="lp-cv-hdr">
            <div className="lp-cv-hdr-lbl">Domain</div>
            <div className="lp-cv-hdr-lbl">Words</div>
            <div className="lp-cv-hdr-lbl">KW Density</div>
            <div className="lp-cv-hdr-lbl">Int. Links</div>
          </div>
          {COMP_ROWS.map((r, i) => (
            <div key={i} className="lp-cv-row">
              <div>
                <div className="lp-cv-domain">{r.domain}</div>
                {r.you && <span className="lp-cv-you">you</span>}
              </div>
              <div className="lp-cv-val" style={{ color: r.you ? '#f87171' : '#818cf8' }}>{r.wc}</div>
              <div className="lp-cv-val" style={{ color: r.you ? '#f87171' : '#818cf8' }}>{r.kd}</div>
              <div className="lp-cv-val" style={{ color: r.you ? '#f87171' : '#818cf8' }}>{r.links}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOR WHO ── */}
      <section className="lp-section" id="who" style={{ borderTop:'1px solid rgba(255,255,255,.05)' }}>
        <div className="reveal" style={{ width:32, height:3, borderRadius:2, background:'linear-gradient(90deg,#fbbf24,rgba(251,191,36,0))', marginBottom:20 }} />
        <h2 className="lp-h2 reveal">Built for people who<br />take rankings <em>seriously.</em></h2>
        <div className="lp-who-grid">
          {[
            {
              cls: 'wc-seo', icon: <CircleDot size={36} strokeWidth={1.4} />, title: 'SEO Professionals',
              role: 'In-house SEO · Consultant', roleColor: '#2dd4bf',
              desc: 'Stop guessing which signal to fix first. Get ML-ranked recommendations and track score improvement week over week.',
              items: ['Predicted rank probability', 'Priority-ordered action roadmap', 'A/B test title variants before publishing'],
              dotColor: '#2dd4bf',
            },
            {
              cls: 'wc-agency', icon: <LayoutGrid size={36} strokeWidth={1.4} />, title: 'Digital Agencies',
              role: 'Agency · Freelancer', roleColor: '#818cf8',
              desc: 'Audit 50 client pages in one bulk run. Export a white-label PDF report. Monitor competitors weekly. Impress clients with data.',
              items: ['Bulk sitemap audit- 50 pages at once', 'PDF export for client delivery', 'Competitor monitoring with email alerts'],
              dotColor: '#818cf8',
            },
            {
              cls: 'wc-dev', icon: <Code2 size={36} strokeWidth={1.4} />, title: 'Developers',
              role: 'Full-stack · DevOps', roleColor: '#fbbf24',
              desc: 'Embed Rankly audits in your CI/CD pipeline, custom dashboard, or browser extension via the REST API with API key auth.',
              items: ['REST API with `rkly_` key auth', 'Full OpenAPI spec at /docs', 'All endpoints: audit, history, bulk, brief'],
              dotColor: '#fbbf24',
            },
          ].map((c, i) => (
            <div key={i} className={`lp-who-card ${c.cls} reveal`} style={{ transitionDelay: `${i * 0.12}s` }}>
              <span className="lp-who-icon">{c.icon}</span>
              <div className="lp-who-title">{c.title}</div>
              <span className="lp-who-role" style={{ color: c.roleColor }}>{c.role}</span>
              <div className="lp-who-desc">{c.desc}</div>
              <div className="lp-who-list">
                {c.items.map((item, j) => (
                  <div key={j} className="lp-wl">
                    <div className="lp-wl-dot" style={{ background: c.dotColor }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="lp-section" style={{ borderTop:'1px solid rgba(255,255,255,.05)' }}>
        <div style={{ textAlign:'center' }}>
          <div className="lp-section-eyebrow" style={{ justifyContent:'center' }}>
            <span className="lp-section-tag indigo">vs The Competition</span>
          </div>
          <h2 className="lp-h2 reveal" style={{ textAlign:'center' }}>
            Tools at $130/month give you<br />backlink graphs. We give you a <em>to-do list.</em>
          </h2>
          <p className="lp-section-sub reveal" style={{ textAlign:'center', margin:'0 auto', maxWidth:480 }}>
            No domain rating scores. No link prospecting rabbit holes. Just: here are the 5 things stopping you from ranking, in order of impact.
          </p>
        </div>
        <div className="lp-comp-wrap reveal">
          <table className="lp-comp-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="th-us">Rankly</th>
                <th>Ahrefs</th>
                <th>Surfer SEO</th>
                <th>SEMrush</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr key={i}>
                  <td>{row.label}</td>
                  <td className="td-us">{row.us}</td>
                  <td>{row.ahrefs}</td>
                  <td>{row.surfer}</td>
                  <td>{row.semrush}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="lp-section" id="pricing" style={{ borderTop:'1px solid rgba(255,255,255,.05)' }}>
        <div className="reveal" style={{ width:32, height:3, borderRadius:2, background:'linear-gradient(90deg,#2dd4bf,rgba(45,212,191,0))', marginBottom:20 }} />
        <h2 className="lp-h2 reveal">Simple pricing.<br /><em>No surprises.</em></h2>
        <p className="lp-section-sub reveal">Start free. Upgrade when your rankings do.</p>
        <div className="lp-pricing-grid" style={{ marginTop:48 }}>
          {PRICING_TIERS.map((tier, i) => (
            <div key={i} className={`lp-pc reveal${tier.popular ? ' lp-pc-pop' : ''}`} style={{ transitionDelay:`${i * 0.1}s` }}>
              {tier.popular && <div className="lp-pc-pop-badge">Most Popular</div>}
              <div className="lp-pc-tier">{tier.name}</div>
              <div className="lp-pc-price">
                {tier.price === 0 ? 'Free' : (
                  <>
                    <em>$</em>{tier.price}
                    {tier.xaf && (
                      <span style={{fontSize:'13px',fontWeight:500,color:'rgba(226,232,240,.32)',fontFamily:"'DM Mono',monospace",letterSpacing:0,marginLeft:6}}>
                        / {tier.xaf} XAF
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="lp-pc-period">{tier.price === 0 ? 'forever' : '/month, billed monthly'}</div>
              <div className="lp-pc-desc">{tier.desc}</div>
              <div className="lp-pc-list">
                {tier.features.map((f, j) => (
                  <div key={j} className="lp-pc-item">
                    <Check className="lp-pc-check" size={11} strokeWidth={2.5} />
                    {f}
                  </div>
                ))}
              </div>
              <button
                className={`lp-pc-btn ${tier.popular ? 'lp-pc-btn-solid' : 'lp-pc-btn-outline'}`}
                onClick={() => navigate('/register')}
              >
                {tier.price === 0 ? 'Start free' : 'Get started'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEVELOPER API ── */}
      <section className="lp-section" id="api" style={{ borderTop:'1px solid rgba(255,255,255,.05)', paddingTop:80, paddingBottom:80 }}>
        <div className="lp-api-grid">
          <div className="reveal-left">
            <div style={{ width:32, height:3, borderRadius:2, background:'linear-gradient(90deg,#fbbf24,rgba(251,191,36,0))', marginBottom:20 }} />
            <h2 className="lp-h2" style={{ fontSize:'clamp(24px,2.8vw,38px)' }}>Embed Rankly<br />in <em>your</em> stack.</h2>
            <p className="lp-section-sub" style={{ marginTop:12, fontSize:14 }}>
              Every Rankly feature is available over REST. Generate an API key from the dashboard and start auditing in minutes.
            </p>
            <button className="lp-btn-primary" style={{ marginTop:24 }} onClick={() => navigate('/register')}>
              Get an API Key <ArrowRight size={13} strokeWidth={2.2} />
            </button>
          </div>
          <div className="reveal-right" style={{minWidth:0}}>
            <div className="lp-terminal">
              <div className="lp-terminal-bar">
                <div style={{ width:10,height:10,borderRadius:'50%',background:'#f87171' }} />
                <div style={{ width:10,height:10,borderRadius:'50%',background:'#fbbf24' }} />
                <div style={{ width:10,height:10,borderRadius:'50%',background:'#34d399' }} />
                <span className="lp-terminal-lbl">terminal</span>
              </div>
              <pre>
{`curl -X POST https://api.rankly.app/api/audit/generate \\
  -H `}<span className="lp-terminal-auth">"Authorization: Bearer rkly_YOUR_KEY"</span>{` \\
  -H "Content-Type: application/json" \\
  -d '{
    `}<span className="lp-terminal-key">"url"</span>{`: "https://example.com/blog/seo-tips",
    `}<span className="lp-terminal-key">"keyword"</span>{`: "seo analysis tool"
  }'

`}<span className="lp-terminal-comment">{`# Returns: score, rank, competitors, suggestions`}</span></pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lp-final-cta">
        <h2 className="lp-cta-h reveal">
          You're 60 seconds from knowing<br /><em>exactly</em> what to fix.
        </h2>
        <p className="lp-cta-sub reveal">Free forever for solo audits. No credit card. No "book a demo."</p>
        <button className="lp-btn-primary reveal" style={{ margin:'0 auto', fontSize:16, padding:'16px 36px' }} onClick={() => navigate('/register')}>
          Audit your first page- it's free
          <ArrowRight size={17} strokeWidth={2.5} />
        </button>
        <div className="lp-cta-note reveal">60 seconds · 70+ SEO signals · ML rank prediction</div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-logo">Rank<em>ly</em></div>
        <div className="lp-footer-links">
          <a className="lp-fl" href="#features">Features</a>
          <a className="lp-fl" href="#how">How it works</a>
          <a className="lp-fl" href="#who">For who</a>
          <span className="lp-fl" onClick={() => navigate('/login')}>Login</span>
          <span className="lp-fl" onClick={() => navigate('/register')}>Sign up</span>
        </div>
        <div className="lp-footer-copy">© {new Date().getFullYear()} Rankly · ML-Powered SEO</div>
      </footer>
    </>
  )
}
