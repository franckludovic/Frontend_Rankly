import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from "recharts";

/* ─────────────────────── STYLES ─────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root{
  --bg:#030c1a; --bg2:#050f22; --bg3:rgba(255,255,255,0.025);
  --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.12);
  --text:rgba(255,255,255,0.88); --muted:rgba(255,255,255,0.4); --faint:rgba(255,255,255,0.18);
  --teal:#2dd4bf; --teal-d:rgba(20,184,166,0.12); --teal-b:rgba(20,184,166,0.25);
  --indigo:#818cf8; --indigo-d:rgba(99,102,241,0.1); --indigo-b:rgba(99,102,241,0.25);
  --amber:#fbbf24; --amber-d:rgba(245,158,11,0.1); --amber-b:rgba(245,158,11,0.22);
  --red:#f87171; --red-d:rgba(239,68,68,0.08); --red-b:rgba(239,68,68,0.2);
  --green:#34d399; --green-d:rgba(52,211,153,0.08); --green-b:rgba(52,211,153,0.2);
  --sb:200px; --r:13px;
}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px;}
.root{display:flex;min-height:100vh;background:var(--bg);font-family:'Outfit',sans-serif;color:var(--text);}

/* ══ SIDEBAR ══ */
.sb{width:var(--sb);min-width:var(--sb);background:rgba(2,7,18,0.98);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:18px 0;position:sticky;top:0;height:100vh;overflow-y:auto;}
.sb-logo{display:flex;align-items:center;gap:9px;padding:0 16px 18px;border-bottom:1px solid var(--border);margin-bottom:16px;}
.sb-icon{width:28px;height:28px;background:linear-gradient(135deg,#0d9488,#0891b2);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.sb-wm{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;letter-spacing:-0.3px;}
.sb-wm span{color:var(--teal);}
.sb-tag{font-family:'DM Mono',monospace;font-size:8px;color:var(--faint);letter-spacing:1px;text-transform:uppercase;margin-top:1px;}
.sb-nav{flex:1;display:flex;flex-direction:column;gap:2px;padding:0 8px;}
.sb-btn{display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:9px;border:none;background:none;color:var(--muted);font-family:'Outfit',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.15s;width:100%;text-align:left;}
.sb-btn:hover{color:rgba(255,255,255,.78);background:rgba(255,255,255,.05);}
.sb-btn.active{color:var(--teal);background:var(--teal-d);font-weight:600;}
.sb-sep{height:1px;background:var(--border);margin:10px 16px;}
.sb-cta{margin:0 8px 10px;padding:10px 12px;background:linear-gradient(135deg,#0d9488,#0f766e);border:none;border-radius:10px;color:white;font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .2s;}
.sb-cta:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(13,148,136,.28);}
.sb-foot{padding:0 8px;display:flex;flex-direction:column;gap:2px;}

/* ══ MAIN ══ */
.main{flex:1;overflow-y:auto;padding:30px 28px 52px;min-width:0;}

/* Header */
.hdr{margin-bottom:22px;animation:fadeUp .5s ease both;}
.hdr-eyebrow{display:inline-flex;align-items:center;gap:6px;background:var(--bg3);border:1px solid var(--border2);border-radius:6px;padding:4px 11px;margin-bottom:10px;}
.hdr-eyebrow-txt{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.1px;text-transform:uppercase;color:var(--muted);}
.hdr-title{font-family:'Syne',sans-serif;font-size:clamp(18px,2.3vw,26px);font-weight:800;letter-spacing:-0.5px;margin-bottom:8px;}
.hdr-title em{color:var(--teal);font-style:normal;}
.hdr-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.hdr-chip{display:inline-flex;align-items:center;gap:6px;background:var(--bg3);border:1px solid var(--border);border-radius:7px;padding:5px 11px;font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);}
.hdr-chip b{color:rgba(255,255,255,.75);font-weight:500;}
.count-badge{background:var(--teal-d);border:1px solid var(--teal-b);border-radius:100px;padding:3px 10px;font-family:'DM Mono',monospace;font-size:9px;color:var(--teal);}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}

/* ══ OVERVIEW CHART CARD ══ */
.chart-card{
  background:var(--bg2);
  border:1px solid var(--border);
  border-radius:var(--r);
  padding:20px 20px 16px;
  margin-bottom:20px;
  animation:fadeUp .5s .05s ease both;
}
.chart-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px;flex-wrap:wrap;}
.chart-title-group{}
.chart-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:white;margin-bottom:3px;}
.chart-subtitle{font-family:'DM Mono',monospace;font-size:9.5px;color:var(--faint);}
.chart-legend{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
.leg-item{display:flex;align-items:center;gap:5px;font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);}
.leg-dot{width:9px;height:9px;border-radius:3px;flex-shrink:0;}

/* Metric selector */
.metric-selector{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;}
.ms-btn{
  padding:5px 12px;border-radius:7px;border:1px solid var(--border);
  background:none;font-family:'DM Mono',monospace;font-size:10px;
  color:var(--muted);cursor:pointer;transition:all .15s;letter-spacing:.2px;
}
.ms-btn:hover{border-color:var(--border2);color:rgba(255,255,255,.7);}
.ms-btn.active{background:var(--indigo-d);border-color:var(--indigo-b);color:var(--indigo);font-weight:500;}

/* Custom tooltip */
.ct{
  background:rgba(5,12,28,0.97);
  border:1px solid rgba(255,255,255,.12);
  border-radius:9px;padding:10px 13px;
  min-width:140px;
}
.ct-domain{font-family:'DM Mono',monospace;font-size:10px;color:rgba(255,255,255,.5);margin-bottom:4px;}
.ct-val{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;}
.ct-unit{font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,.3);margin-top:2px;}

/* ══ COMPETITOR SELECTOR ══ */
.comp-selector{margin-bottom:20px;animation:fadeUp .5s .12s ease both;}
.comp-selector-label{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.8px;color:var(--faint);margin-bottom:10px;}
.comp-tabs{display:flex;gap:7px;overflow-x:auto;padding-bottom:4px;}
.comp-tabs::-webkit-scrollbar{height:3px;}
.comp-tab{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 12px;border-radius:10px;border:1px solid var(--border);background:var(--bg3);cursor:pointer;transition:all .2s;flex-shrink:0;min-width:70px;}
.comp-tab:hover{border-color:var(--border2);background:rgba(255,255,255,.04);}
.comp-tab.active{border-color:var(--teal-b);background:var(--teal-d);}
.ct-rank{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;line-height:1;}
.comp-tab.active .ct-rank{color:var(--teal);}
.ct-rlbl{font-family:'DM Mono',monospace;font-size:7.5px;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);}
.ct-domain2{font-family:'DM Mono',monospace;font-size:8.5px;color:var(--muted);max-width:68px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;}
.comp-tab.active .ct-domain2{color:var(--teal);}

/* ══ OVERVIEW ROW ══ */
.overview-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;animation:fadeUp .5s .18s ease both;}
.ov-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:16px 18px;position:relative;overflow:hidden;}
.ov-label{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.8px;text-transform:uppercase;color:var(--faint);margin-bottom:6px;}
.ov-value{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;line-height:1;}
.ov-note{font-family:'DM Mono',monospace;font-size:9px;margin-top:4px;}
.ov-pill{display:inline-flex;align-items:center;gap:4px;border-radius:100px;padding:3px 9px;font-family:'DM Mono',monospace;font-size:9px;font-weight:500;margin-top:6px;}
.ov-rank{border-color:var(--indigo-b);background:linear-gradient(135deg,rgba(99,102,241,.08),rgba(79,70,229,.03));}
.ov-rank::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 100% 0%,rgba(99,102,241,.12),transparent 65%);pointer-events:none;}
.ov-rank .ov-value{color:var(--indigo);}
.ov-presence{border-color:rgba(251,191,36,.18);background:rgba(251,191,36,.03);}
.ov-presence .ov-value{color:var(--amber);}
.ov-kw{border-color:var(--teal-b);background:var(--teal-d);}
.ov-kw .ov-value{color:var(--teal);}
.ov-tech{border-color:var(--green-b);background:var(--green-d);}
.ov-tech .ov-value{color:var(--green);}
.pips{display:flex;gap:3px;margin-top:8px;}
.pip{height:5px;flex:1;border-radius:2px;}
.pip.on-t{background:#0d9488;}.pip.on-g{background:#10b981;}.pip.off{background:rgba(255,255,255,.08);}

/* ══ H2H ══ */
.h2h-wrap{animation:fadeUp .5s .22s ease both;}
.section-hdr{display:flex;align-items:center;gap:9px;margin-bottom:14px;}
.section-bar{width:3px;height:17px;border-radius:2px;}
.section-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;}
.h2h-col-labels{display:grid;grid-template-columns:1fr 140px 1fr;margin-bottom:8px;padding:0 2px;}
.col-comp{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:var(--indigo);text-align:right;}
.col-mid{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:var(--faint);text-align:center;}
.col-you{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:var(--teal);text-align:left;}
.metric-rows{display:flex;flex-direction:column;gap:6px;margin-bottom:18px;}
.mrow{display:grid;grid-template-columns:1fr 140px 1fr;align-items:center;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px 14px;transition:all .2s;}
.mrow:hover{background:rgba(255,255,255,.04);border-color:var(--border2);}
.mrow.comp-win{border-color:rgba(239,68,68,.13);}
.mrow.you-win{border-color:rgba(20,184,166,.15);}
.mrow-val{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;line-height:1;}
.mrow-left{text-align:right;}
.mrow-right{text-align:left;}
.c-teal{color:var(--teal);} .c-indigo{color:var(--indigo);}
.c-win{color:rgba(45,212,191,.9);} .c-lose{color:rgba(248,113,113,.75);}
.mrow-mid{display:flex;flex-direction:column;align-items:center;gap:4px;padding:0 10px;}
.mrow-name{font-family:'Outfit',sans-serif;font-size:12px;font-weight:500;color:rgba(255,255,255,.5);text-align:center;line-height:1.3;}
.result-badge{font-family:'DM Mono',monospace;font-size:8.5px;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:.3px;font-weight:500;white-space:nowrap;}
.rb-ahead{background:var(--teal-d);color:var(--teal);border:1px solid var(--teal-b);}
.rb-behind{background:var(--red-d);color:var(--red);border:1px solid var(--red-b);}
.rb-tied{background:rgba(255,255,255,.05);color:var(--muted);border:1px solid var(--border);}

/* ══ KEYWORD PRESENCE ══ */
.kw-presence-wrap{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r);padding:16px;margin-bottom:18px;animation:fadeUp .5s .26s ease both;}
.kp-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:10px;}
.kp-cell{border-radius:8px;padding:9px 8px;border:1px solid;text-align:center;}
.kp-loc{font-family:'DM Mono',monospace;font-size:8.5px;text-transform:uppercase;letter-spacing:.4px;color:var(--faint);margin-bottom:5px;}
.kp-lbl{font-family:'DM Mono',monospace;font-size:7.5px;text-transform:uppercase;color:var(--faint);margin-top:3px;}

/* ══ TAKEAWAYS ══ */
.gaps-wrap{margin-bottom:8px;animation:fadeUp .5s .3s ease both;}
.gaps-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.gap-card{border-radius:11px;padding:14px 16px;border:1px solid;}
.gap-row{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:9px 11px;}

/* ══ RESPONSIVE ══ */
@media(max-width:1100px){
  .overview-row{grid-template-columns:repeat(2,1fr);}
  .kp-grid{grid-template-columns:repeat(3,1fr);}
  .gaps-grid{grid-template-columns:1fr;}
  .h2h-col-labels,.mrow{grid-template-columns:1fr 110px 1fr;}
}
@media(max-width:860px){
  :root{--sb:0px;}
  .sb{position:fixed;left:0;top:0;width:220px;transform:translateX(-100%);z-index:100;}
  .main{padding:20px 16px 40px;}
  .h2h-col-labels,.mrow{grid-template-columns:1fr 100px 1fr;}
  .mrow-val{font-size:15px;}
}
@media(max-width:560px){
  .overview-row{grid-template-columns:1fr 1fr;}
  .kp-grid{grid-template-columns:repeat(2,1fr);}
  .gaps-grid{grid-template-columns:1fr;}
  .h2h-col-labels,.mrow{grid-template-columns:1fr 88px 1fr;}
  .mrow-val{font-size:14px;}
}
`;

/* ── Icons ── */
const I={
  bolt:<svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/></svg>,
  chart:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  users:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  map:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  help:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  logout:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  plus:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  search:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  zap:<svg width="11" height="11" viewBox="0 0 24 24" fill="#a5b4fc"><path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"/></svg>,
  up:<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>,
  down:<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
};

/* ── Data ── */
const YOU_RAW = {
  wordCount:1250, keywordDensity:1.2, keywordSignal:2, technicalScore:3,
  altCoverage:74, internalLinks:45, externalLinks:12, hasSchema:false,
  titleHasKw:false, metaHasKw:false, h1HasKw:false, altHasKw:true, bodyHasKw:true,
  h2Count:5, h3Count:12, searchPresence:20,
};

const COMPETITORS = [
  {rank:1, domain:"amazon.com",        wordCount:3240,keywordDensity:2.1,keywordSignal:4,technicalScore:4,altCoverage:91,internalLinks:312,externalLinks:8, hasSchema:true, titleHasKw:true, metaHasKw:true, h1HasKw:true, altHasKw:true, bodyHasKw:true, searchPresence:94,h2Count:12,h3Count:28},
  {rank:2, domain:"bestbuy.com",       wordCount:2880,keywordDensity:1.9,keywordSignal:4,technicalScore:4,altCoverage:88,internalLinks:248,externalLinks:5, hasSchema:true, titleHasKw:true, metaHasKw:true, h1HasKw:true, altHasKw:true, bodyHasKw:true, searchPresence:87,h2Count:10,h3Count:22},
  {rank:3, domain:"walmart.com",       wordCount:2100,keywordDensity:1.7,keywordSignal:3,technicalScore:4,altCoverage:82,internalLinks:196,externalLinks:6, hasSchema:true, titleHasKw:true, metaHasKw:true, h1HasKw:true, altHasKw:false,bodyHasKw:true, searchPresence:81,h2Count:8, h3Count:16},
  {rank:4, domain:"notebookcheck.net", wordCount:4100,keywordDensity:2.3,keywordSignal:3,technicalScore:3,altCoverage:77,internalLinks:88, externalLinks:24,hasSchema:false,titleHasKw:true, metaHasKw:true, h1HasKw:true, altHasKw:false,bodyHasKw:true, searchPresence:62,h2Count:18,h3Count:34},
  {rank:5, domain:"rtings.com",        wordCount:3650,keywordDensity:2.0,keywordSignal:4,technicalScore:4,altCoverage:95,internalLinks:124,externalLinks:12,hasSchema:true, titleHasKw:true, metaHasKw:true, h1HasKw:true, altHasKw:true, bodyHasKw:true, searchPresence:71,h2Count:14,h3Count:26},
  {rank:6, domain:"tomsguide.com",     wordCount:3200,keywordDensity:1.8,keywordSignal:4,technicalScore:4,altCoverage:89,internalLinks:142,externalLinks:18,hasSchema:true, titleHasKw:true, metaHasKw:true, h1HasKw:true, altHasKw:true, bodyHasKw:true, searchPresence:68,h2Count:11,h3Count:20},
  {rank:7, domain:"techradar.com",     wordCount:2600,keywordDensity:1.6,keywordSignal:3,technicalScore:3,altCoverage:71,internalLinks:98, externalLinks:15,hasSchema:false,titleHasKw:true, metaHasKw:false,h1HasKw:true, altHasKw:false,bodyHasKw:true, searchPresence:55,h2Count:9, h3Count:14},
  {rank:8, domain:"cnet.com",          wordCount:2900,keywordDensity:1.7,keywordSignal:4,technicalScore:4,altCoverage:86,internalLinks:168,externalLinks:22,hasSchema:true, titleHasKw:true, metaHasKw:true, h1HasKw:true, altHasKw:true, bodyHasKw:true, searchPresence:78,h2Count:10,h3Count:18},
  {rank:9, domain:"laptopmag.com",     wordCount:2400,keywordDensity:1.5,keywordSignal:3,technicalScore:3,altCoverage:68,internalLinks:76, externalLinks:14,hasSchema:false,titleHasKw:true, metaHasKw:false,h1HasKw:true, altHasKw:false,bodyHasKw:true, searchPresence:48,h2Count:8, h3Count:12},
  {rank:10,domain:"pcmag.com",         wordCount:2200,keywordDensity:1.4,keywordSignal:3,technicalScore:3,altCoverage:72,internalLinks:82, externalLinks:16,hasSchema:false,titleHasKw:true, metaHasKw:false,h1HasKw:true, altHasKw:false,bodyHasKw:true, searchPresence:51,h2Count:7, h3Count:10},
];

/* Chart metric definitions */
const CHART_METRICS = [
  {key:"wordCount",      label:"Word Count",       unit:"words",  avg:true},
  {key:"keywordSignal",  label:"Keyword Coverage", unit:"/ 4",    avg:false, max:4},
  {key:"technicalScore", label:"Technical Score",  unit:"/ 4",    avg:false, max:4},
  {key:"altCoverage",    label:"Alt Text Coverage",unit:"%",      avg:true},
  {key:"searchPresence", label:"Search Presence",  unit:"/ 100",  avg:true},
];

/* Custom chart tooltip */
function ChartTooltip({active,payload,unit}){
  if(!active||!payload?.length) return null;
  const d=payload[0].payload;
  return(
    <div className="ct">
      <div className="ct-domain">{d.fullDomain}</div>
      <div className="ct-val" style={{color:d.isYou?"#2dd4bf":d.isSelected?"#818cf8":"rgba(255,255,255,.8)",fontFamily:"'Syne',sans-serif"}}>{payload[0].value.toLocaleString()}</div>
      <div className="ct-unit">{unit}</div>
    </div>
  );
}

function cmp(compVal,youVal){
  if(compVal>youVal) return "ahead";
  if(compVal<youVal) return "behind";
  return "tied";
}

function ResultBadge({result}){
  const c={
    ahead:{cls:"result-badge rb-behind",lbl:"Gap to close"},
    behind:{cls:"result-badge rb-ahead",lbl:"You're ahead"},
    tied:{cls:"result-badge rb-tied",lbl:"Matched"},
  }[result];
  return <span className={c.cls}>{c.lbl}</span>;
}

export default function CompetitorPage(){
  const [activeNav,setActiveNav]=useState("COMPETITORS");
  const [selected,setSelected]=useState(0);
  const [chartMetric,setChartMetric]=useState("wordCount");

  const C=COMPETITORS[selected];
  const metricDef=CHART_METRICS.find(m=>m.key===chartMetric);

  /* Build chart data- YOUR page first, then competitors in rank order */
  const chartData=[
    {
      name:"You",
      fullDomain:"Your page (example.com)",
      value:YOU_RAW[chartMetric],
      isYou:true,
      isSelected:false,
    },
    ...COMPETITORS.map((c,i)=>({
      name:`#${c.rank}`,
      fullDomain:c.domain,
      value:c[chartMetric],
      isYou:false,
      isSelected:i===selected,
    })),
  ];

  /* Average line for bar chart */
  const avg=Math.round(chartData.reduce((s,d)=>s+d.value,0)/chartData.length);

  /* H2H metrics */
  const metrics=[
    {name:"Word Count",        comp:C.wordCount.toLocaleString(),   you:YOU_RAW.wordCount.toLocaleString(), result:cmp(C.wordCount,YOU_RAW.wordCount)},
    {name:"Keyword Density",   comp:`${C.keywordDensity}%`,         you:`${YOU_RAW.keywordDensity}%`,        result:cmp(C.keywordDensity,YOU_RAW.keywordDensity)},
    {name:"Keyword Coverage",  comp:`${C.keywordSignal}/4`,          you:`${YOU_RAW.keywordSignal}/4`,        result:cmp(C.keywordSignal,YOU_RAW.keywordSignal)},
    {name:"Technical Health",  comp:`${C.technicalScore}/4`,         you:`${YOU_RAW.technicalScore}/4`,       result:cmp(C.technicalScore,YOU_RAW.technicalScore)},
    {name:"Alt Text Coverage", comp:`${C.altCoverage}%`,             you:`${YOU_RAW.altCoverage}%`,           result:cmp(C.altCoverage,YOU_RAW.altCoverage)},
    {name:"Internal Links",    comp:C.internalLinks,                 you:YOU_RAW.internalLinks,               result:cmp(C.internalLinks,YOU_RAW.internalLinks)},
    {name:"External Links",    comp:C.externalLinks,                 you:YOU_RAW.externalLinks,               result:cmp(C.externalLinks,YOU_RAW.externalLinks)},
    {name:"Structured Data",   comp:C.hasSchema?"✓ Yes":"✗ No",     you:YOU_RAW.hasSchema?"✓ Yes":"✗ No",    result:cmp(C.hasSchema?1:0,YOU_RAW.hasSchema?1:0)},
    {name:"Subheadings (H2)",  comp:C.h2Count,                      you:YOU_RAW.h2Count,                     result:cmp(C.h2Count,YOU_RAW.h2Count)},
  ];

  const gapsToClose=metrics.filter(m=>m.result==="ahead");
  const youAhead=metrics.filter(m=>m.result==="behind");

  /* Keyword presence */
  const kwLocs=[
    {loc:"Title",    comp:C.titleHasKw, you:YOU_RAW.titleHasKw},
    {loc:"H1",       comp:C.h1HasKw,    you:YOU_RAW.h1HasKw},
    {loc:"Meta Desc",comp:C.metaHasKw,  you:YOU_RAW.metaHasKw},
    {loc:"Alt Text", comp:C.altHasKw,   you:YOU_RAW.altHasKw},
    {loc:"Body",     comp:C.bodyHasKw,  you:YOU_RAW.bodyHasKw},
  ];

  return(
    <>
      <style dangerouslySetInnerHTML={{__html:css}}/>
      <div className="root">

        {/* SIDEBAR */}
        <aside className="sb">
          <div className="sb-logo">
            <div className="sb-icon">{I.bolt}</div>
            <div>
              <div className="sb-wm">SEO<span>Insight</span></div>
              <div className="sb-tag">Intelligence Engine</div>
            </div>
          </div>
          <nav className="sb-nav">
            {[["ANALYSIS","Analysis",I.chart],["COMPETITORS","Competitors",I.users],["ROADMAP","Roadmap",I.map]].map(([id,lbl,icon])=>(
              <button key={id} className={`sb-btn${activeNav===id?" active":""}`} onClick={()=>setActiveNav(id)}>{icon}{lbl}</button>
            ))}
          </nav>
          <div className="sb-sep"/>
          <button className="sb-cta">{I.plus} New Audit</button>
          <div className="sb-foot">
            <button className="sb-btn">{I.help} Help</button>
            <button className="sb-btn">{I.logout} Logout</button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main">

          {/* Header */}
          <div className="hdr">
            <div className="hdr-eyebrow">{I.users}<span className="hdr-eyebrow-txt">Competitor Analysis</span></div>
            <h1 className="hdr-title">Top 10 Ranking Pages for <em>'buy cheap laptops'</em></h1>
            <div className="hdr-meta">
              <div className="hdr-chip">{I.search}<span>Your page: <b>example.com/laptops</b></span></div>
              <span className="count-badge">10 competitors scraped</span>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              STATIC OVERVIEW CHART- all 11 sites
              Does not change when tabs are clicked
              (selected competitor is highlighted only)
          ══════════════════════════════════════════ */}
          <div className="chart-card">
            <div className="chart-top">
              <div className="chart-title-group">
                <div className="chart-title" style={{fontFamily:"'Syne',sans-serif"}}>All 11 Pages at a Glance</div>
                <div className="chart-subtitle">Your page vs. all 10 ranked competitors · click a bar to select</div>
              </div>
              <div className="chart-legend">
                <div className="leg-item"><div className="leg-dot" style={{background:"#2dd4bf"}}/> Your page</div>
                <div className="leg-item"><div className="leg-dot" style={{background:"#818cf8"}}/> Selected competitor</div>
                <div className="leg-item"><div className="leg-dot" style={{background:"rgba(99,102,241,0.35)"}}/> Other competitors</div>
                <div className="leg-item"><div className="leg-dot" style={{background:"rgba(255,255,255,0.15)",border:"1px dashed rgba(255,255,255,0.25)"}}/> Average</div>
              </div>
            </div>

            {/* Metric selector */}
            <div className="metric-selector">
              {CHART_METRICS.map(m=>(
                <button key={m.key} className={`ms-btn${chartMetric===m.key?" active":""}`} onClick={()=>setChartMetric(m.key)}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Bar chart */}
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barCategoryGap="20%" onClick={(d)=>{
                if(!d?.activePayload) return;
                const pl=d.activePayload[0]?.payload;
                if(!pl||pl.isYou) return;
                const idx=COMPETITORS.findIndex(c=>`#${c.rank}`===pl.name);
                if(idx>=0) setSelected(idx);
              }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="0"/>
                <XAxis
                  dataKey="name"
                  tick={{fontFamily:"'DM Mono',monospace",fontSize:10,fill:"rgba(255,255,255,0.35)"}}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{fontFamily:"'DM Mono',monospace",fontSize:9,fill:"rgba(255,255,255,0.25)"}}
                  axisLine={false} tickLine={false} width={40}
                />
                <Tooltip
                  content={<ChartTooltip unit={metricDef?.unit||""}/>}
                  cursor={{fill:"rgba(255,255,255,0.04)"}}
                />
                <ReferenceLine
                  y={avg} stroke="rgba(255,255,255,0.2)"
                  strokeDasharray="5 4"
                  label={{value:`avg ${avg.toLocaleString()}`,position:"insideTopRight",fontFamily:"'DM Mono',monospace",fontSize:9,fill:"rgba(255,255,255,0.3)"}}
                />
                <Bar dataKey="value" radius={[5,5,0,0]} maxBarSize={48}>
                  {chartData.map((d,i)=>(
                    <Cell
                      key={i}
                      fill={
                        d.isYou      ? "#2dd4bf" :
                        d.isSelected ? "#818cf8" :
                        "rgba(99,102,241,0.32)"
                      }
                      stroke={
                        d.isYou      ? "rgba(45,212,191,0.4)" :
                        d.isSelected ? "rgba(129,140,248,0.5)" :
                        "transparent"
                      }
                      strokeWidth={d.isYou||d.isSelected?1.5:0}
                      cursor={d.isYou?"default":"pointer"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"rgba(255,255,255,.18)",textAlign:"center",marginTop:"4px"}}>
              Click any competitor bar to select it for detailed benchmarking below
            </div>
          </div>

          {/* ══════════════════════════════════════════
              COMPETITOR SELECTOR TABS
              Changes the detail view below
          ══════════════════════════════════════════ */}
          <div className="comp-selector">
            <div className="comp-selector-label">Select a competitor to benchmark against</div>
            <div className="comp-tabs">
              {COMPETITORS.map((c,i)=>(
                <button key={i} className={`comp-tab${selected===i?" active":""}`} onClick={()=>setSelected(i)}>
                  <span className="ct-rank" style={{fontFamily:"'Syne',sans-serif"}}>#{c.rank}</span>
                  <span className="ct-rlbl">Rank</span>
                  <span className="ct-domain2">{c.domain}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ══ OVERVIEW CARDS ══ */}
          <div className="overview-row">
            <div className="ov-card ov-rank">
              <div className="ov-label">Google Rank</div>
              <div className="ov-value" style={{fontFamily:"'Syne',sans-serif"}}>
                <span style={{fontSize:"18px",opacity:.4}}>#</span>{C.rank}
              </div>
              <div className="ov-note" style={{color:"rgba(165,180,252,.5)"}}>{C.domain}</div>
              <div className="ov-pill" style={{background:"rgba(99,102,241,.12)",border:"1px solid rgba(99,102,241,.2)",color:"var(--indigo)"}}>
                {I.zap} Your page is at <b style={{marginLeft:3}}>#34</b>
              </div>
            </div>

            <div className="ov-card ov-presence">
              <div className="ov-label">Search Presence</div>
              <div className="ov-value" style={{fontFamily:"'Syne',sans-serif"}}>{C.searchPresence}</div>
              <div className="ov-note" style={{color:"rgba(251,191,36,.5)"}}>Based on historical SERP data</div>
              <div style={{height:"4px",background:"rgba(255,255,255,.07)",borderRadius:"2px",overflow:"hidden",marginTop:"8px"}}>
                <div style={{height:"100%",width:`${C.searchPresence}%`,background:"linear-gradient(90deg,#f59e0b,#fbbf24)",borderRadius:"2px"}}/>
              </div>
            </div>

            <div className="ov-card ov-kw">
              <div className="ov-label">Keyword Coverage</div>
              <div className="ov-value" style={{fontFamily:"'Syne',sans-serif"}}>
                {C.keywordSignal}<span style={{fontSize:"14px",opacity:.5,marginLeft:"2px"}}>/4</span>
              </div>
              <div className="ov-note" style={{color:"rgba(45,212,191,.5)"}}>
                Your page: {YOU_RAW.keywordSignal}/4
                {C.keywordSignal>YOU_RAW.keywordSignal
                  ? <span style={{color:"var(--red)",marginLeft:"5px"}}>↑ they win</span>
                  : <span style={{color:"var(--green)",marginLeft:"5px"}}>you match</span>}
              </div>
              <div className="pips">
                {[1,2,3,4].map(i=><div key={i} className={`pip${i<=C.keywordSignal?" on-t":" off"}`}/>)}
              </div>
            </div>

            <div className="ov-card ov-tech">
              <div className="ov-label">Technical Health</div>
              <div className="ov-value" style={{fontFamily:"'Syne',sans-serif"}}>
                {C.technicalScore}<span style={{fontSize:"14px",opacity:.5,marginLeft:"2px"}}>/4</span>
              </div>
              <div className="ov-note" style={{color:"rgba(52,211,153,.5)"}}>
                Your page: {YOU_RAW.technicalScore}/4
                {C.technicalScore>YOU_RAW.technicalScore
                  ? <span style={{color:"var(--red)",marginLeft:"5px"}}>↑ they win</span>
                  : <span style={{color:"var(--green)",marginLeft:"5px"}}>you match</span>}
              </div>
              <div className="pips">
                {[1,2,3,4].map(i=><div key={i} className={`pip${i<=C.technicalScore?" on-g":" off"}`}/>)}
              </div>
            </div>
          </div>

          {/* ══ KEYWORD PRESENCE ══ */}
          <div className="kw-presence-wrap">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:"10px",textTransform:"uppercase",letterSpacing:".6px",color:"rgba(255,255,255,.5)"}}>
                Keyword Placement- {C.domain} vs. your page
              </div>
              <div style={{display:"flex",gap:"12px"}}>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"var(--indigo)"}}>● {C.domain}</span>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",color:"var(--teal)"}}>● Your page</span>
              </div>
            </div>
            <div className="kp-grid">
              {kwLocs.map(({loc,comp,you})=>{
                const both=comp&&you, compOnly=comp&&!you, youOnly=!comp&&you;
                const borderC=both?"rgba(52,211,153,.2)":compOnly?"rgba(239,68,68,.2)":youOnly?"rgba(20,184,166,.2)":"rgba(255,255,255,.06)";
                const bgC=both?"rgba(52,211,153,.04)":compOnly?"rgba(239,68,68,.04)":"rgba(255,255,255,.02)";
                return(
                  <div key={loc} className="kp-cell" style={{borderColor:borderC,background:bgC}}>
                    <div className="kp-loc">{loc}</div>
                    <div style={{display:"flex",gap:"8px",justifyContent:"center",margin:"5px 0"}}>
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:"14px",color:comp?"var(--green)":"rgba(255,255,255,.12)"}}>{comp?"✓":"✗"}</span>
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:"14px",color:you?"var(--teal)":"rgba(255,255,255,.12)"}}>{you?"✓":"✗"}</span>
                    </div>
                    <div className="kp-lbl">{both?"Both":compOnly?"Only them":youOnly?"Only you":"Neither"}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ══ HEAD-TO-HEAD ══ */}
          <div className="h2h-wrap">
            <div className="section-hdr">
              <div className="section-bar" style={{background:"var(--indigo)"}}/>
              <span className="section-title" style={{fontFamily:"'Syne',sans-serif"}}>Head-to-Head</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",background:"var(--indigo-d)",border:"1px solid var(--indigo-b)",color:"var(--indigo)",borderRadius:"100px",padding:"2px 9px"}}>{C.domain} vs. your page</span>
            </div>

            <div className="h2h-col-labels">
              <div className="col-comp">{C.domain}</div>
              <div className="col-mid">Metric</div>
              <div className="col-you">Your Page</div>
            </div>

            <div className="metric-rows">
              {metrics.map((m,i)=>(
                <div key={i} className={`mrow ${m.result==="ahead"?"comp-win":m.result==="behind"?"you-win":""}`}>
                  <div className="mrow-left">
                    <div className={`mrow-val ${m.result==="ahead"?"c-indigo":"c-lose"}`} style={{fontFamily:"'Syne',sans-serif"}}>{m.comp}</div>
                  </div>
                  <div className="mrow-mid">
                    <div className="mrow-name">{m.name}</div>
                    <ResultBadge result={m.result}/>
                  </div>
                  <div className="mrow-right">
                    <div className={`mrow-val ${m.result==="behind"?"c-teal":m.result==="ahead"?"c-lose":"c-teal"}`} style={{fontFamily:"'Syne',sans-serif"}}>{m.you}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ TAKEAWAYS ══ */}
          <div className="gaps-wrap">
            <div className="section-hdr">
              <div className="section-bar" style={{background:"var(--amber)"}}/>
              <span className="section-title" style={{fontFamily:"'Syne',sans-serif"}}>Takeaways vs. {C.domain}</span>
            </div>
            <div className="gaps-grid">
              <div className="gap-card" style={{borderColor:"rgba(239,68,68,.18)",background:"rgba(239,68,68,.03)"}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",textTransform:"uppercase",letterSpacing:".7px",color:"rgba(248,113,113,.6)",marginBottom:"12px"}}>
                  Where {C.domain} beats you
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
                  {gapsToClose.length===0
                    ? <div style={{fontFamily:"'Outfit',sans-serif",fontSize:"13px",color:"rgba(52,211,153,.7)"}}>You match or beat this competitor on all metrics!</div>
                    : gapsToClose.map((m,i)=>(
                      <div key={i} className="gap-row">
                        <span style={{color:"var(--red)",flexShrink:0}}>{I.down}</span>
                        <div>
                          <div style={{fontFamily:"'Outfit',sans-serif",fontSize:"12.5px",fontWeight:500,color:"rgba(255,255,255,.75)"}}>{m.name}</div>
                          <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9.5px",color:"var(--faint)",marginTop:"1px"}}>Them: {m.comp} → You: {m.you}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
              <div className="gap-card" style={{borderColor:"rgba(52,211,153,.18)",background:"rgba(52,211,153,.03)"}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9px",textTransform:"uppercase",letterSpacing:".7px",color:"rgba(52,211,153,.6)",marginBottom:"12px"}}>
                  Where you beat {C.domain}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
                  {youAhead.length===0
                    ? <div style={{fontFamily:"'Outfit',sans-serif",fontSize:"13px",color:"rgba(251,191,36,.7)"}}>Work through the gaps- this competitor is strong.</div>
                    : youAhead.map((m,i)=>(
                      <div key={i} className="gap-row">
                        <span style={{color:"var(--green)",flexShrink:0}}>{I.up}</span>
                        <div>
                          <div style={{fontFamily:"'Outfit',sans-serif",fontSize:"12.5px",fontWeight:500,color:"rgba(255,255,255,.75)"}}>{m.name}</div>
                          <div style={{fontFamily:"'DM Mono',monospace",fontSize:"9.5px",color:"var(--faint)",marginTop:"1px"}}>You: {m.you} → Them: {m.comp}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
