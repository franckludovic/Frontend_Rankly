import { useState } from "react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root{
  --bg:        #030c1a;
  --bg2:       #050f22;
  --surface:   rgba(255,255,255,0.03);
  --border:    rgba(255,255,255,0.07);
  --border2:   rgba(255,255,255,0.11);
  --text:      rgba(255,255,255,0.88);
  --muted:     rgba(255,255,255,0.38);
  --faint:     rgba(255,255,255,0.18);
  --teal:      #2dd4bf;
  --teal-dim:  rgba(20,184,166,0.12);
  --teal-border:rgba(20,184,166,0.22);
  --indigo:    #a5b4fc;
  --indigo-dim:rgba(99,102,241,0.1);
  --indigo-border:rgba(99,102,241,0.25);
  --amber:     #fbbf24;
  --amber-dim: rgba(245,158,11,0.1);
  --amber-border:rgba(245,158,11,0.22);
  --red:       #f87171;
  --red-dim:   rgba(239,68,68,0.08);
  --red-border:rgba(239,68,68,0.2);
  --green:     #34d399;
  --green-dim: rgba(52,211,153,0.08);
  --green-border:rgba(52,211,153,0.2);
  --sb-w:      200px;
  --r:         13px;
}

/* ── Scrollbar ── */
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px;}

/* ── Root layout ── */
.root{display:flex;min-height:100vh;background:var(--bg);font-family:'Outfit',sans-serif;color:var(--text);}

/* ════════════════════════════════
   SIDEBAR
════════════════════════════════ */
.sb{
  width:var(--sb-w);min-width:var(--sb-w);
  background:rgba(2,7,18,0.97);
  border-right:1px solid var(--border);
  display:flex;flex-direction:column;
  padding:18px 0;
  position:sticky;top:0;height:100vh;
  overflow-y:auto;
  transition:transform 0.3s ease;
  z-index:100;
}
.sb-logo{display:flex;align-items:center;gap:9px;padding:0 16px 18px;border-bottom:1px solid var(--border);margin-bottom:16px;}
.sb-icon{width:28px;height:28px;background:linear-gradient(135deg,#0d9488,#0891b2);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.sb-wordmark{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;letter-spacing:-0.3px;}
.sb-wordmark span{color:var(--teal);}
.sb-tagline{font-family:'DM Mono',monospace;font-size:8px;color:var(--faint);letter-spacing:1px;text-transform:uppercase;margin-top:1px;}
.sb-nav{flex:1;display:flex;flex-direction:column;gap:2px;padding:0 8px;}
.sb-item{
  display:flex;align-items:center;gap:9px;
  padding:9px 11px;border-radius:9px;
  border:none;background:none;
  color:var(--muted);font-family:'Outfit',sans-serif;
  font-size:13px;font-weight:500;cursor:pointer;
  transition:all 0.15s;width:100%;text-align:left;
}
.sb-item:hover{color:rgba(255,255,255,0.78);background:rgba(255,255,255,0.05);}
.sb-item.active{color:var(--teal);background:var(--teal-dim);font-weight:600;}
.sb-item svg{flex-shrink:0;opacity:0.7;}
.sb-item.active svg{opacity:1;}
.sb-sep{height:1px;background:var(--border);margin:10px 16px;}
.sb-cta{margin:0 8px 10px;padding:10px 12px;background:linear-gradient(135deg,#0d9488,#0f766e);border:none;border-radius:10px;color:white;font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all 0.2s;}
.sb-cta:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(13,148,136,0.28);}
.sb-foot{padding:0 8px;display:flex;flex-direction:column;gap:2px;}

/* ════════════════════════════════
   MAIN
════════════════════════════════ */
.main{flex:1;overflow-y:auto;padding:32px 28px 52px;min-width:0;}

/* ── Page header ── */
.hdr{margin-bottom:26px;animation:fadeUp .5s ease both;}
.hdr-eyebrow{display:inline-flex;align-items:center;gap:6px;background:var(--surface);border:1px solid var(--border2);border-radius:6px;padding:4px 11px;margin-bottom:11px;}
.hdr-eyebrow-txt{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.1px;text-transform:uppercase;color:var(--muted);}
.hdr-title{font-family:'Syne',sans-serif;font-size:clamp(20px,2.4vw,28px);font-weight:800;letter-spacing:-0.5px;line-height:1.15;margin-bottom:10px;}
.hdr-title em{color:var(--teal);font-style:normal;}
.hdr-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.kw-tag{display:inline-flex;align-items:center;gap:7px;background:var(--surface);border:1px solid var(--border);border-radius:7px;padding:5px 11px;}
.kw-icon{color:var(--muted);}
.kw-label{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);}
.kw-label b{color:rgba(255,255,255,0.75);font-weight:500;}
.live{display:inline-flex;align-items:center;gap:5px;background:var(--green-dim);border:1px solid var(--green-border);border-radius:100px;padding:3px 10px;}
.ldot{width:6px;height:6px;border-radius:50%;background:#10b981;animation:pulse 2s infinite;}
.ltxt{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.8px;text-transform:uppercase;color:var(--green);}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(16,185,129,.4);}70%{box-shadow:0 0 0 7px transparent;}100%{box-shadow:0 0 0 0 transparent;}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}

/* ════════════════════════════════
   HERO METRICS — top 2 large cards
════════════════════════════════ */
.hero-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;animation:fadeUp .5s .05s ease both;}

.hero-card{border-radius:var(--r);padding:20px 22px;position:relative;overflow:hidden;}

/* Quality card */
.hc-quality{
  background:linear-gradient(135deg,rgba(251,191,36,0.08),rgba(245,158,11,0.04));
  border:1px solid var(--amber-border);
}
.hc-quality::after{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse at 100% 0%,rgba(251,191,36,0.1),transparent 65%);
  pointer-events:none;
}

/* Rank card */
.hc-rank{
  background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(79,70,229,0.04));
  border:1px solid var(--indigo-border);
}
.hc-rank::after{
  content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse at 100% 0%,rgba(99,102,241,0.14),transparent 65%);
  pointer-events:none;
}

.hc-label{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;}
.hc-quality .hc-label{color:rgba(251,191,36,0.55);}
.hc-rank   .hc-label{color:rgba(165,180,252,0.55);}

.hc-main{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;}
.hc-value{font-family:'Syne',sans-serif;line-height:1;}
.hc-quality .hc-value{font-size:32px;font-weight:800;color:var(--amber);}
.hc-rank    .hc-value{font-size:52px;font-weight:800;color:var(--indigo);}
.hc-rank-hash{font-size:26px;color:rgba(165,180,252,0.45);margin-right:1px;}

.hc-aside{text-align:right;}
.hc-pill{display:inline-flex;align-items:center;gap:5px;border-radius:100px;padding:4px 10px;font-family:'DM Mono',monospace;font-size:9.5px;font-weight:500;margin-bottom:6px;}
.hc-quality .hc-pill{background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.2);color:var(--amber);}
.hc-rank    .hc-pill{background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.2);color:var(--indigo);}
.hc-note{font-family:'DM Mono',monospace;font-size:9px;color:var(--faint);}

/* Quality sub-bar */
.qual-levels{display:flex;gap:5px;margin-top:14px;}
.ql{flex:1;height:5px;border-radius:3px;}
.ql.active-low{background:#f87171;}
.ql.active-med{background:var(--amber);}
.ql.active-high{background:var(--green);}
.ql.off{background:rgba(255,255,255,0.08);}
.qual-tags{display:flex;justify-content:space-between;margin-top:5px;}
.qual-tag{font-family:'DM Mono',monospace;font-size:8px;color:var(--faint);}
.qual-tag.current{font-weight:600;color:var(--amber);}

/* Rank progress */
.rank-track{height:4px;background:rgba(255,255,255,0.07);border-radius:3px;margin-top:14px;overflow:hidden;}
.rank-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#6366f1,#a5b4fc);}
.rank-labels{display:flex;justify-content:space-between;margin-top:5px;}
.rank-lbl{font-family:'DM Mono',monospace;font-size:8px;color:var(--faint);}
.rank-lbl.current{color:var(--indigo);font-weight:500;}

/* ════════════════════════════════
   SECONDARY METRICS — 5 small cards
════════════════════════════════ */
.sec-row{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:20px;animation:fadeUp .5s .1s ease both;}
.sc{background:var(--surface);border:1px solid var(--border);border-radius:11px;padding:13px 14px;transition:all .2s;}
.sc:hover{background:rgba(255,255,255,0.045);border-color:var(--border2);}
.sc-lbl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.8px;text-transform:uppercase;color:var(--faint);margin-bottom:5px;}
.sc-val{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;line-height:1.05;}
.sc-unit{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);}
.sc-sub{font-family:'DM Mono',monospace;font-size:8px;color:var(--faint);margin-top:3px;}
/* pips */
.pips{display:flex;gap:3px;margin-top:6px;}
.pip{height:5px;border-radius:2px;flex:1;}
.pip.on-teal{background:#0d9488;}.pip.on-amber{background:var(--amber);}
.pip.off{background:rgba(255,255,255,0.08);}
/* mini pass bars */
.pass-bars{display:flex;gap:2px;margin-top:6px;}
.pb-bar{width:4px;height:12px;border-radius:2px;}
.pb-bar.on{background:rgba(52,211,153,0.5);}.pb-bar.off{background:rgba(255,255,255,0.08);}

/* ════════════════════════════════
   PANELS GRID
════════════════════════════════ */
.pgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;}
.panel{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;animation:fadeUp .5s ease both;}
.ph{display:flex;align-items:center;justify-content:space-between;padding:13px 16px 12px;border-bottom:1px solid var(--border);}
.ph-title{display:flex;align-items:center;gap:7px;font-family:'DM Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.6px;color:rgba(255,255,255,0.55);text-transform:uppercase;}
.pb-body{padding:16px;}

/* Badges */
.badge{font-family:'DM Mono',monospace;font-size:8px;font-weight:500;letter-spacing:.3px;padding:2px 8px;border-radius:4px;text-transform:uppercase;white-space:nowrap;}
.badge.crit{background:var(--red-dim);color:var(--red);border:1px solid var(--red-border);}
.badge.warn{background:var(--amber-dim);color:var(--amber);border:1px solid var(--amber-border);}
.badge.ok{background:var(--green-dim);color:var(--green);border:1px solid var(--green-border);}
.badge.miss{background:rgba(239,68,68,0.08);color:#fca5a5;border:1px solid rgba(239,68,68,0.14);}
.badge.info{background:var(--indigo-dim);color:var(--indigo);border:1px solid var(--indigo-border);}

/* ── Section separator inside panels ── */
.p-sep{height:1px;background:var(--border);margin:12px 0;}

/* ── Semantic Analysis panel ── */
.sa-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}
.wc-big{display:flex;align-items:baseline;gap:5px;}
.wc-n{font-family:'Syne',sans-serif;font-size:30px;font-weight:800;color:white;}
.wc-t{font-family:'DM Mono',monospace;font-size:12px;color:var(--muted);}
.wc-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);}
.prog{height:5px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;margin:6px 0 4px;}
.prog-fill{height:100%;border-radius:3px;transition:width .6s ease;}
.flag{font-family:'DM Mono',monospace;font-size:9.5px;display:flex;align-items:center;gap:4px;margin-bottom:11px;}
.flag.red{color:var(--red);}.flag.green{color:var(--green);}.flag.amber{color:var(--amber);}

.stat-row{display:flex;gap:8px;margin-bottom:11px;}
.stat-box{flex:1;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:9px 11px;}
.stat-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);margin-bottom:3px;}
.stat-val{font-family:'Syne',sans-serif;font-size:19px;font-weight:700;color:white;}

.readability-row{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:9px 11px;}
.read-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;}
.read-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);}

/* ── Metadata Inspector panel ── */
.mf{margin-bottom:12px;}
.mf:last-child{margin-bottom:0;}
.mf-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;gap:8px;}
.mf-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);flex-shrink:0;}
.mf-box{font-family:'DM Mono',monospace;font-size:11.5px;color:rgba(255,255,255,0.72);background:var(--surface);border:1px solid var(--border);border-radius:7px;padding:8px 11px;line-height:1.55;}
.mf-chars{font-family:'DM Mono',monospace;font-size:8.5px;color:var(--faint);margin-top:4px;}
.mf-chars span{font-weight:500;}
.mf-pair{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;}
.mf-mini{background:var(--surface);border:1px solid var(--border);border-radius:7px;padding:9px 11px;}
.mf-mini-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);margin-bottom:4px;}
.mf-mini-val{font-family:'DM Mono',monospace;font-size:11px;}

/* ── Content Structure panel ── */
.h1-box{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:11px 13px;margin-bottom:12px;}
.h1-tag-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-bottom:5px;}
.h1-text{font-family:'Outfit',sans-serif;font-size:13.5px;font-weight:500;color:rgba(255,255,255,.8);margin-bottom:7px;}
.dom-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:12px;}
.ds{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:9px 10px;text-align:center;}
.ds-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.3px;color:var(--faint);margin-bottom:3px;}
.ds-val{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;}
.h2-section{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px 12px;}
.h2-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.h2-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);}
.samples{display:flex;flex-direction:column;gap:6px;}
.sample{display:flex;align-items:center;gap:7px;font-family:'Outfit',sans-serif;font-size:12px;color:var(--muted);}
.sample-dot{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.15);flex-shrink:0;}

/* ── Technical panel ── */
.tech-feature-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:10px;}
.tf{background:var(--surface);border:1px solid var(--border);border-radius:9px;padding:11px 12px;}
.tf-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);margin-bottom:5px;}
.tf-val-row{display:flex;align-items:baseline;gap:4px;}
.tf-big{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;color:white;line-height:1;}
.tf-unit{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);}
.tf-note{font-family:'DM Mono',monospace;font-size:8.5px;margin-top:3px;}
.link-stack{display:flex;flex-direction:column;gap:5px;}
.link-row{display:flex;justify-content:space-between;align-items:center;}
.link-lbl{font-family:'DM Mono',monospace;font-size:8.5px;text-transform:uppercase;letter-spacing:.3px;color:var(--faint);}
.link-val{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:white;}
.schema-fail{background:rgba(239,68,68,0.04);border:1px solid var(--red-border);border-radius:9px;padding:11px 12px;}

/* Checks row */
.checks-row{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px;}
.check{border-radius:8px;padding:9px 10px;border:1px solid;}
.check.pass{background:var(--green-dim);border-color:var(--green-border);}
.check.fail{background:var(--red-dim);border-color:var(--red-border);}
.check-lbl{font-family:'DM Mono',monospace;font-size:7.5px;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);margin-bottom:3px;}
.check-val{font-family:'DM Mono',monospace;font-size:10px;font-weight:600;}
.check.pass .check-val{color:var(--green);}
.check.fail .check-val{color:var(--red);}

/* ════════════════════════════════
   TOP SUGGESTIONS PREVIEW
════════════════════════════════ */
.sug-wrap{margin-bottom:14px;animation:fadeUp .5s .35s ease both;}
.sug-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px;}
.sug-title-group{display:flex;align-items:center;gap:9px;}
.sug-accent{width:3px;height:18px;background:#6366f1;border-radius:2px;}
.sug-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:white;}
.sug-count{font-family:'DM Mono',monospace;font-size:9px;background:var(--indigo-dim);border:1px solid var(--indigo-border);color:var(--indigo);border-radius:100px;padding:2px 9px;}
.roadmap-btn{display:flex;align-items:center;gap:5px;background:none;border:1px solid var(--border2);border-radius:7px;padding:6px 12px;color:var(--teal);font-family:'DM Mono',monospace;font-size:10.5px;cursor:pointer;transition:all .2s;}
.roadmap-btn:hover{background:var(--teal-dim);border-color:var(--teal-border);}

.sug-list{display:flex;flex-direction:column;gap:8px;}
.sug-card{
  display:grid;grid-template-columns:auto 1px 1fr auto;
  align-items:start;gap:0;
  border-radius:11px;border:1px solid;
  overflow:hidden;transition:all .2s;cursor:default;
}
.sug-card:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(0,0,0,0.25);}
.sug-card.high{border-color:rgba(239,68,68,0.2);background:rgba(239,68,68,0.025);}
.sug-card.med {border-color:rgba(245,158,11,0.16);background:rgba(245,158,11,0.02);}

.sug-num{padding:16px 16px;display:flex;flex-direction:column;align-items:center;gap:2px;}
.sug-n{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;line-height:1;}
.sug-card.high .sug-n{color:var(--red);}
.sug-card.med  .sug-n{color:var(--amber);}
.sug-nlbl{font-family:'DM Mono',monospace;font-size:7.5px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);}

.sug-div{background:var(--border);align-self:stretch;}

.sug-body{padding:14px 15px;}
.sug-fix{font-family:'Outfit',sans-serif;font-size:13.5px;font-weight:600;color:rgba(255,255,255,.88);margin-bottom:5px;line-height:1.4;}
.sug-why{font-family:'Outfit',sans-serif;font-size:12px;color:var(--muted);line-height:1.55;}

.sug-right{padding:14px 15px;display:flex;flex-direction:column;align-items:flex-end;gap:6px;}
.impact-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);}
.impact-track{width:52px;height:4px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden;}
.impact-fill{height:100%;border-radius:2px;}
.sug-card.high .impact-fill{background:linear-gradient(90deg,#ef4444,#f87171);}
.sug-card.med  .impact-fill{background:linear-gradient(90deg,#f59e0b,#fbbf24);}
.impact-pct{font-family:'DM Mono',monospace;font-size:9px;color:var(--faint);}

/* ════════════════════════════════
   STATUS BAR
════════════════════════════════ */
.status{
  display:flex;align-items:center;gap:0;
  background:var(--surface);border:1px solid var(--border);
  border-radius:11px;overflow:hidden;
  animation:fadeUp .5s .45s ease both;
}
.stat-seg{display:flex;align-items:center;gap:8px;padding:11px 16px;flex:1;}
.stat-seg+.stat-seg{border-left:1px solid var(--border);}
.seg-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.7px;color:var(--faint);}
.seg-val{font-family:'DM Mono',monospace;font-size:11px;font-weight:500;color:rgba(255,255,255,.6);}
.health-bar{width:56px;height:3px;background:rgba(255,255,255,0.07);border-radius:2px;overflow:hidden;}
.health-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,#f59e0b,#fbbf24);}
.net-ok{background:var(--green-dim);border:1px solid var(--green-border);border-radius:4px;padding:1px 7px;font-family:'DM Mono',monospace;font-size:9px;color:var(--green);font-weight:500;}
.seg-time{font-family:'DM Mono',monospace;font-size:9px;color:var(--faint);}
.ref-btn{padding:11px 14px;background:none;border:none;border-left:1px solid var(--border);cursor:pointer;color:var(--faint);display:flex;align-items:center;transition:all .15s;}
.ref-btn:hover{color:var(--teal);background:var(--teal-dim);}

/* ════════════════════════════════
   RESPONSIVE
════════════════════════════════ */
@media(max-width:1100px){
  .sec-row{grid-template-columns:repeat(3,1fr);}
  .pgrid{grid-template-columns:1fr;}
  .sug-card{grid-template-columns:auto 1px 1fr;}
  .sug-right{display:none;}
}
@media(max-width:860px){
  :root{--sb-w:0px;}
  .sb{position:fixed;left:0;top:0;width:220px;transform:translateX(-100%);}
  .sb.open{transform:translateX(0);box-shadow:0 0 0 100vw rgba(0,0,0,0.5);}
  .main{padding:20px 16px 40px;}
  .hero-row{grid-template-columns:1fr;}
  .sec-row{grid-template-columns:repeat(3,1fr);}
  .checks-row{grid-template-columns:repeat(2,1fr);}
  .status{flex-direction:column;border-radius:11px;}
  .stat-seg{border-left:none!important;border-top:1px solid var(--border);}
  .stat-seg:first-child{border-top:none;}
  .ref-btn{border-left:none;border-top:1px solid var(--border);width:100%;justify-content:center;}
  .hdr-title{font-size:18px;}
}
@media(max-width:560px){
  .hero-row{grid-template-columns:1fr;}
  .sec-row{grid-template-columns:repeat(2,1fr);}
  .dom-stats{grid-template-columns:repeat(2,1fr);}
  .tech-feature-grid{grid-template-columns:1fr;}
  .mf-pair{grid-template-columns:1fr;}
  .checks-row{grid-template-columns:repeat(2,1fr);}
}
`;

/* ── Icons ── */
const I = {
  bolt:    <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/></svg>,
  chart:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  users:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  map:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  help:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  logout:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  gear:    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  star:    <svg width="12" height="12" viewBox="0 0 24 24" fill="#2dd4bf"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  code:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  list:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  shield:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  search:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  plus:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  refresh: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  arrow:   <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  warn:    <svg width="9" height="9" viewBox="0 0 24 24" fill="#f87171"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>,
  info:    <svg width="9" height="9" viewBox="0 0 24 24" fill="#2dd4bf"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="white" strokeWidth="2"/></svg>,
  check:   <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  zap:     <svg width="11" height="11" viewBox="0 0 24 24" fill="#a5b4fc"><path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/></svg>,
};

/* ── Suggestions data — plain language, no model internals ── */
const suggestions = [
  {
    rank:1, impact:"high", pct:92,
    fix:"Add your target keyword to the meta description",
    why:"Your meta description doesn't mention 'buy cheap laptops' and is too short at 78 characters. A keyword-rich description of 120–160 chars improves click-through rate and relevance signals.",
  },
  {
    rank:2, impact:"high", pct:85,
    fix:"Include your target keyword in the page title",
    why:"'Buy Laptops Today | Best Deals' doesn't contain the exact phrase. Placing the keyword early in the title is one of the strongest on-page signals for ranking.",
  },
  {
    rank:3, impact:"med", pct:68,
    fix:"Expand your page content to at least 2,000 words",
    why:"At 1,250 words you're below the typical threshold for competitive keywords. Top-ranking pages for this query average 2,000+ words of substantive content.",
  },
  {
    rank:4, impact:"med", pct:54,
    fix:"Add structured data (schema markup) to your page",
    why:"No schema is detected. Adding Product or Article schema enables rich results in Google Search, which increases visibility and click-through rate.",
  },
];

export default function AnalysisPage() {
  const [activeNav, setActiveNav] = useState("ANALYSIS");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="root">

        {/* ════ SIDEBAR ════ */}
        <aside className="sb">
          <div className="sb-logo">
            <div className="sb-icon">{I.bolt}</div>
            <div>
              <div className="sb-wordmark">SEO<span>Insight</span></div>
              <div className="sb-tagline">Intelligence Engine</div>
            </div>
          </div>
          <nav className="sb-nav">
            {[["ANALYSIS","Analysis",I.chart],["COMPETITORS","Competitors",I.users],["ROADMAP","Roadmap",I.map]].map(([id,label,icon])=>(
              <button key={id} className={`sb-item${activeNav===id?" active":""}`} onClick={()=>setActiveNav(id)}>
                {icon}{label}
              </button>
            ))}
          </nav>
          <div className="sb-sep"/>
          <button className="sb-cta">{I.plus} New Audit</button>
          <div className="sb-foot">
            <button className="sb-item">{I.help} Help</button>
            <button className="sb-item">{I.logout} Logout</button>
          </div>
        </aside>

        {/* ════ MAIN ════ */}
        <div className="main">

          {/* Header */}
          <div className="hdr">
            <div className="hdr-eyebrow">{I.gear}<span className="hdr-eyebrow-txt">SEO Audit Report</span></div>
            <h1 className="hdr-title">Analysis: <em>www.example.com</em></h1>
            <div className="hdr-meta">
              <div className="kw-tag">
                <span className="kw-icon">{I.search}</span>
                <span className="kw-label">Keyword: <b>'buy cheap laptops'</b></span>
              </div>
              <div className="live"><span className="ldot"/><span className="ltxt">Monitoring active</span></div>
            </div>
          </div>

          {/* ── Hero metrics ── */}
          <div className="hero-row">
            {/* SEO Quality */}
            <div className="hero-card hc-quality">
              <div className="hc-label">SEO Quality</div>
              <div className="hc-main">
                <div className="hc-value">MEDIUM</div>
                <div className="hc-aside">
                  <div className="hc-pill">Page 4 of Google</div>
                  <div className="hc-note">Based on top-10 competitor analysis</div>
                </div>
              </div>
              <div className="qual-levels">
                <div className="ql off"/>
                <div className="ql active-med"/>
                <div className="ql off"/>
              </div>
              <div className="qual-tags">
                <span className="qual-tag">Low</span>
                <span className="qual-tag current">Medium ← you are here</span>
                <span className="qual-tag">High</span>
              </div>
            </div>

            {/* Predicted Position */}
            <div className="hero-card hc-rank">
              <div className="hc-label">Predicted Google Position</div>
              <div className="hc-main">
                <div>
                  <span className="hc-rank-hash">#</span>
                  <span className="hc-value">34</span>
                </div>
                <div className="hc-aside">
                  <div className="hc-pill">{I.zap} AI Prediction</div>
                  <div className="hc-note">Implement all fixes to reach top 10</div>
                </div>
              </div>
              <div className="rank-track">
                <div className="rank-fill" style={{width:"34%"}}/>
              </div>
              <div className="rank-labels">
                <span className="rank-lbl">#1 — Top result</span>
                <span className="rank-lbl current">#34 ← now</span>
                <span className="rank-lbl">#100</span>
              </div>
            </div>
          </div>

          {/* ── Secondary metrics ── */}
          <div className="sec-row">
            {/* SEO Score */}
            <div className="sc">
              <div className="sc-lbl">SEO Score</div>
              <div style={{display:"flex",alignItems:"baseline",gap:"1px"}}>
                <span className="sc-val" style={{fontFamily:"'Syne',sans-serif"}}>68</span>
                <span className="sc-unit">/100</span>
              </div>
              <div className="prog" style={{marginTop:"6px"}}>
                <div className="prog-fill" style={{width:"68%",background:"linear-gradient(90deg,#f59e0b,#fbbf24)"}}/>
              </div>
            </div>

            {/* Keyword Coverage */}
            <div className="sc" style={{borderColor:"rgba(20,184,166,.18)",background:"rgba(20,184,166,.03)"}}>
              <div className="sc-lbl">Keyword Coverage</div>
              <div style={{display:"flex",alignItems:"baseline",gap:"1px"}}>
                <span className="sc-val" style={{fontFamily:"'Syne',sans-serif",color:"#2dd4bf"}}>2</span>
                <span className="sc-unit">/4 locations</span>
              </div>
              <div className="pips">
                {[1,2,3,4].map(i=><div key={i} className={`pip${i<=2?" on-teal":" off"}`}/>)}
              </div>
            </div>

            {/* Technical Health */}
            <div className="sc" style={{borderColor:"rgba(20,184,166,.14)",background:"rgba(20,184,166,.02)"}}>
              <div className="sc-lbl">Technical Health</div>
              <div style={{display:"flex",alignItems:"baseline",gap:"1px"}}>
                <span className="sc-val" style={{fontFamily:"'Syne',sans-serif",color:"#5eead4"}}>3</span>
                <span className="sc-unit">/4 checks</span>
              </div>
              <div className="pips">
                {[1,2,3,4].map(i=><div key={i} className={`pip${i<=3?" on-teal":" off"}`}/>)}
              </div>
            </div>

            {/* Issues */}
            <div className="sc" style={{borderColor:"rgba(239,68,68,.18)",background:"rgba(239,68,68,.03)"}}>
              <div className="sc-lbl">Issues Found</div>
              <div className="sc-val" style={{fontFamily:"'Syne',sans-serif",color:"#f87171"}}>3</div>
              <div className="sc-sub" style={{color:"rgba(248,113,113,.5)"}}>Critical · needs attention</div>
            </div>

            {/* Checks passed */}
            <div className="sc" style={{borderColor:"rgba(52,211,153,.14)",background:"rgba(52,211,153,.02)"}}>
              <div className="sc-lbl">Checks Passed</div>
              <div className="sc-val" style={{fontFamily:"'Syne',sans-serif",color:"#34d399"}}>24</div>
              <div className="pass-bars">
                {[...Array(8)].map((_,i)=><div key={i} className={`pb-bar${i<6?" on":" off"}`}/>)}
              </div>
            </div>
          </div>

          {/* ════ FOUR PANELS ════ */}
          <div className="pgrid">

            {/* ── Semantic Analysis ── */}
            <div className="panel" style={{animationDelay:"0.1s"}}>
              <div className="ph">
                <div className="ph-title">{I.star} Content &amp; Keywords</div>
                <div className="badge warn">Needs Work</div>
              </div>
              <div className="pb-body">
                <div className="sa-top">
                  <div>
                    <div className="wc-lbl">Word Count</div>
                    <div className="wc-big">
                      <span className="wc-n" style={{fontFamily:"'Syne',sans-serif"}}>1,250</span>
                      <span className="wc-t">/ 2,000+ target</span>
                    </div>
                  </div>
                  <div className="badge miss">Below Target</div>
                </div>
                <div className="prog">
                  <div className="prog-fill" style={{width:"62%",background:"linear-gradient(90deg,#ef4444,#f87171)"}}/>
                </div>
                <div className="flag red" style={{marginBottom:"14px"}}>{I.warn} Add ~750 words to reach competitive length</div>

                <div className="stat-row">
                  <div className="stat-box">
                    <div className="stat-lbl">Keyword Frequency</div>
                    <div className="stat-val" style={{fontFamily:"'Syne',sans-serif"}}>15×</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-lbl">Keyword Density</div>
                    <div className="stat-val" style={{fontFamily:"'Syne',sans-serif"}}>1.2%</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-lbl">Paragraphs</div>
                    <div className="stat-val" style={{fontFamily:"'Syne',sans-serif"}}>14</div>
                  </div>
                </div>
                <div className="flag green">{I.check} Keyword density is in the optimal 1–2.5% range</div>

                <div className="p-sep"/>

                <div className="readability-row">
                  <div className="read-hdr">
                    <span className="read-lbl">Readability Score</span>
                    <span className="badge ok">8th Grade Level</span>
                  </div>
                  <div className="prog">
                    <div className="prog-fill" style={{width:"65%",background:"linear-gradient(90deg,#0d9488,#2dd4bf)"}}/>
                  </div>
                  <div className="flag green" style={{marginBottom:0}}>{I.check} 65/100 — readable for a broad audience</div>
                </div>

                <div className="p-sep"/>
                <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <span className="read-lbl">Alt Text Coverage</span>
                  <span style={{marginLeft:"auto",fontFamily:"'DM Mono',monospace",fontSize:"10px",color:"rgba(255,255,255,.4)"}}>14 / 18 images</span>
                </div>
                <div className="prog" style={{marginTop:"6px"}}>
                  <div className="prog-fill" style={{width:"74%",background:"linear-gradient(90deg,#f59e0b,#fbbf24)"}}/>
                </div>
                <div className="flag amber" style={{marginBottom:0}}>{I.warn} 4 images are missing alt text</div>
              </div>
            </div>

            {/* ── Metadata Inspector ── */}
            <div className="panel" style={{animationDelay:"0.15s"}}>
              <div className="ph">
                <div className="ph-title">{I.code} Metadata</div>
                <div className="badge crit">2 Critical Issues</div>
              </div>
              <div className="pb-body">
                {/* Title */}
                <div className="mf">
                  <div className="mf-hdr">
                    <span className="mf-lbl">Page Title</span>
                    <span className="badge miss">Keyword Missing</span>
                  </div>
                  <div className="mf-box">"Buy Laptops Today | Best Deals"</div>
                  <div className="mf-chars">
                    43 characters · <span style={{color:"#f87171"}}>Optimal: 50–60 chars</span> · keyword not found
                  </div>
                </div>

                {/* Meta description */}
                <div className="mf">
                  <div className="mf-hdr">
                    <span className="mf-lbl">Meta Description</span>
                    <span className="badge crit">Too Short + No Keyword</span>
                  </div>
                  <div className="mf-box">"Looking for the best laptops? Click here for amazing deals and fast shipping."</div>
                  <div className="mf-chars">
                    78 characters · <span style={{color:"#f87171"}}>Optimal: 120–160 chars</span> · keyword not found
                  </div>
                </div>

                <div className="p-sep"/>

                <div className="mf-pair">
                  <div className="mf-mini">
                    <div className="mf-mini-lbl">Canonical URL</div>
                    <div className="mf-mini-val" style={{color:"#34d399",fontSize:"11px"}}>✓ Set correctly</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"rgba(255,255,255,.25)",marginTop:"2px"}}>example.com/laptops</div>
                  </div>
                  <div className="mf-mini">
                    <div className="mf-mini-lbl">Index Status</div>
                    <div className="mf-mini-val" style={{color:"#34d399",fontSize:"11px"}}>✓ index, follow</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"rgba(255,255,255,.25)",marginTop:"2px"}}>Visible to search engines</div>
                  </div>
                </div>

                <div className="p-sep"/>
                <div style={{background:"rgba(99,102,241,.06)",border:"1px solid rgba(99,102,241,.18)",borderRadius:"8px",padding:"10px 12px"}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:"8px",textTransform:"uppercase",letterSpacing:".5px",color:"rgba(165,180,252,.5)",marginBottom:"6px"}}>Keyword Presence Across Page</div>
                  <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                    {[
                      {loc:"Title",   found:false},
                      {loc:"H1",      found:false},
                      {loc:"Meta Desc",found:false},
                      {loc:"Alt Text",found:true},
                      {loc:"Body",    found:true},
                    ].map(({loc,found})=>(
                      <div key={loc} style={{
                        display:"flex",alignItems:"center",gap:"4px",
                        background:found?"rgba(52,211,153,.08)":"rgba(239,68,68,.08)",
                        border:`1px solid ${found?"rgba(52,211,153,.18)":"rgba(239,68,68,.18)"}`,
                        borderRadius:"5px",padding:"3px 8px",
                        fontFamily:"'DM Mono',monospace",fontSize:"9.5px",
                        color:found?"#34d399":"#f87171",
                      }}>
                        {found ? "✓" : "✗"} {loc}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Content Structure (DOM) ── */}
            <div className="panel" style={{animationDelay:"0.2s"}}>
              <div className="ph">
                <div className="ph-title">{I.list} Content Structure</div>
              </div>
              <div className="pb-body">
                <div className="h1-tag-lbl">Main Heading (H1)</div>
                <div className="h1-box">
                  <div className="h1-text">"Buy Laptops Today"</div>
                  <span className="badge warn">Keyword not in H1</span>
                </div>

                <div className="dom-stats">
                  <div className="ds">
                    <div className="ds-lbl">H1</div>
                    <div className="ds-val" style={{fontFamily:"'Syne',sans-serif",color:"#34d399"}}>1</div>
                  </div>
                  <div className="ds">
                    <div className="ds-lbl">H2</div>
                    <div className="ds-val" style={{fontFamily:"'Syne',sans-serif",color:"white"}}>5</div>
                  </div>
                  <div className="ds">
                    <div className="ds-lbl">H3</div>
                    <div className="ds-val" style={{fontFamily:"'Syne',sans-serif",color:"white"}}>12</div>
                  </div>
                  <div className="ds">
                    <div className="ds-lbl">Total</div>
                    <div className="ds-val" style={{fontFamily:"'Syne',sans-serif",color:"#5eead4"}}>18</div>
                  </div>
                </div>

                <div className="h2-section">
                  <div className="h2-hdr">
                    <span className="h2-lbl">Subheadings (H2) — <span style={{color:"#f87171"}}>0 of 5 contain keyword</span></span>
                  </div>
                  <div className="samples">
                    {["'Top Rated Models'","'Customer Reviews'","'Shipping Information'"].map(s=>(
                      <div key={s} className="sample">
                        <span className="sample-dot"/>
                        {s}
                        <span style={{marginLeft:"auto",fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"rgba(248,113,113,.5)"}}>no match</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flag warn" style={{marginTop:"12px",marginBottom:0}}>
                  {I.warn} Weave the target keyword into at least 2 subheadings
                </div>
              </div>
            </div>

            {/* ── Technical & Accessibility ── */}
            <div className="panel" style={{animationDelay:"0.25s"}}>
              <div className="ph">
                <div className="ph-title">{I.shield} Technical Checks</div>
                <div className="badge info">3 / 4 Passed</div>
              </div>
              <div className="pb-body">
                <div className="checks-row">
                  {[
                    {label:"HTTPS",         pass:true,  note:"Secure connection"},
                    {label:"Mobile Ready",  pass:true,  note:"Viewport configured"},
                    {label:"Canonical Tag", pass:true,  note:"Duplicate guard set"},
                    {label:"Structured Data",pass:false, note:"Schema not found"},
                  ].map(({label,pass,note})=>(
                    <div key={label} className={`check ${pass?"pass":"fail"}`}>
                      <div className="check-lbl">{label}</div>
                      <div className="check-val">{pass ? "✓ Pass" : "✗ Fail"}</div>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:"8px",color:"rgba(255,255,255,.2)",marginTop:"2px"}}>{note}</div>
                    </div>
                  ))}
                </div>

                <div className="p-sep"/>

                <div className="tech-feature-grid">
                  <div className="tf">
                    <div className="tf-lbl">Images</div>
                    <div className="tf-val-row">
                      <span className="tf-big" style={{fontFamily:"'Syne',sans-serif"}}>18</span>
                      <span className="tf-unit">total</span>
                    </div>
                    <div className="tf-note" style={{color:"#fbbf24"}}>4 missing alt text</div>
                    <div className="tf-note" style={{color:"#34d399"}}>Keyword found in alt ✓</div>
                  </div>

                  <div className="tf">
                    <div className="tf-lbl">Page Links</div>
                    <div className="link-stack">
                      <div className="link-row">
                        <span className="link-lbl">Internal</span>
                        <span className="link-val" style={{fontFamily:"'Syne',sans-serif"}}>45</span>
                      </div>
                      <div className="link-row">
                        <span className="link-lbl">External</span>
                        <span className="link-val" style={{fontFamily:"'Syne',sans-serif"}}>12</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="schema-fail" style={{marginTop:"8px"}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:"8px",textTransform:"uppercase",letterSpacing:".5px",color:"rgba(248,113,113,.45)",marginBottom:"4px"}}>Structured Data</div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:"14px",fontWeight:700,color:"#f87171"}}>Not Detected</div>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontSize:"11.5px",color:"rgba(255,255,255,.35)",marginTop:"4px",lineHeight:1.5}}>Adding Product or Article schema enables rich results in Google Search and can significantly boost click-through rate.</div>
                </div>
              </div>
            </div>
          </div>

          {/* ════ TOP SUGGESTIONS ════ */}
          <div className="sug-wrap">
            <div className="sug-hdr">
              <div className="sug-title-group">
                <div className="sug-accent"/>
                <span className="sug-title" style={{fontFamily:"'Syne',sans-serif"}}>Top Fixes</span>
                <span className="sug-count">4 of 12 · highest impact</span>
              </div>
              <button className="roadmap-btn">{I.zap} Full Roadmap {I.arrow}</button>
            </div>

            <div className="sug-list">
              {suggestions.map(s => (
                <div key={s.rank} className={`sug-card ${s.impact}`}>
                  <div className="sug-num">
                    <span className="sug-n" style={{fontFamily:"'Syne',sans-serif"}}>#{s.rank}</span>
                    <span className="sug-nlbl">{s.impact === "high" ? "Critical" : "Medium"}</span>
                  </div>
                  <div className="sug-div"/>
                  <div className="sug-body">
                    <div className="sug-fix">{s.fix}</div>
                    <div className="sug-why">{s.why}</div>
                  </div>
                  <div className="sug-right">
                    <div className="impact-lbl">Impact</div>
                    <div className="impact-track">
                      <div className="impact-fill" style={{width:`${s.pct}%`}}/>
                    </div>
                    <div className="impact-pct">{s.pct}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ════ STATUS BAR ════ */}
          <div className="status">
            <div className="stat-seg">
              <span className="seg-lbl">Page Health</span>
              <div className="health-bar"><div className="health-fill" style={{width:"68%"}}/></div>
              <span className="seg-val">68%</span>
            </div>
            <div className="stat-seg">
              <span className="seg-lbl">Network</span>
              <span className="net-ok">Stable</span>
            </div>
            <div className="stat-seg">
              <span className="seg-lbl">Predicted Position</span>
              <span className="seg-val" style={{color:"#a5b4fc"}}>#34 of 100</span>
            </div>
            <div className="stat-seg">
              <span className="seg-lbl">Last Audit</span>
              <span className="seg-time">Oct 24, 2023 · 14:02 UTC</span>
            </div>
            <button className="ref-btn">{I.refresh}</button>
          </div>

        </div>
      </div>
    </>
  );
}
