import { useEffect, useState, useCallback, useRef } from 'react'
import { Check, X, Download, Activity, FileText, Search, Settings, Zap, LayoutGrid, Globe, Users, Map } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useParams, useNavigate } from 'react-router-dom'
import { getAudit } from './services/auditService.js'
import { useAudit } from '../../store/auditSlice.js'
import { printSeoReport } from '../reports/reportGenerator.js'
import { api } from '../../shared/services/apiClient.js'
import { usePlanStore } from '../../store/planSlice.js'

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;}
.ad{padding:30px 28px 52px;min-width:0;font-family:'Outfit',sans-serif;color:var(--text);}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
.ad-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:18px;}
.ad-spin{width:44px;height:44px;border:3px solid var(--border,rgba(255,255,255,.08));border-top-color:var(--teal,#2dd4bf);border-radius:50%;animation:spin 1s linear infinite;}
.ad-load-txt{font-family:'DM Mono',monospace;font-size:12px;color:var(--muted,rgba(255,255,255,.4));letter-spacing:.5px;}

/* header */
.ad-hdr{margin-bottom:26px;animation:fadeUp .5s ease both;}
.ad-eyebrow{display:inline-flex;align-items:center;gap:6px;background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border2,rgba(255,255,255,.11));border-radius:6px;padding:4px 11px;margin-bottom:11px;}
.ad-eyebrow-txt{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.1px;text-transform:uppercase;color:var(--muted,rgba(255,255,255,.4));}
.ad-title{font-family:'Syne',sans-serif;font-size:clamp(20px,2.4vw,28px);font-weight:800;letter-spacing:-.5px;line-height:1.15;margin-bottom:10px;}
.ad-title em{color:var(--teal,#2dd4bf);font-style:normal;}
.ad-meta{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.ad-chip{display:inline-flex;align-items:center;gap:7px;background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border,rgba(255,255,255,.07));border-radius:7px;padding:5px 11px;}
.ad-chip-lbl{font-family:'DM Mono',monospace;font-size:11px;color:var(--muted,rgba(255,255,255,.4));}
.ad-chip-lbl b{color:var(--text);font-weight:500;}
.ad-live{display:inline-flex;align-items:center;gap:5px;background:var(--green-d,rgba(52,211,153,.08));border:1px solid var(--green-b,rgba(52,211,153,.2));border-radius:100px;padding:3px 10px;}
.ad-ldot{width:6px;height:6px;border-radius:50%;background:#10b981;animation:pulse 2s infinite;}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(16,185,129,.4);}70%{box-shadow:0 0 0 7px transparent;}100%{box-shadow:0 0 0 0 transparent;}}
.ad-ltxt{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.8px;text-transform:uppercase;color:var(--green,#34d399);}

/* hero row */
.ad-hero-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;animation:fadeUp .5s .05s ease both;}
.ad-hc{border-radius:13px;padding:20px 22px;position:relative;overflow:hidden;}
.ad-hc-quality{background:linear-gradient(135deg,rgba(251,191,36,.08),rgba(245,158,11,.04));border:1px solid rgba(245,158,11,.22);}
.ad-hc-quality::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 100% 0%,rgba(251,191,36,.1),transparent 65%);pointer-events:none;}
.ad-hc-rank{background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(79,70,229,.04));border:1px solid rgba(99,102,241,.25);}
.ad-hc-rank::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 100% 0%,rgba(99,102,241,.14),transparent 65%);pointer-events:none;}
.ad-hc-lbl{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;}
.ad-hc-quality .ad-hc-lbl{color:rgba(251,191,36,.55);}
.ad-hc-rank .ad-hc-lbl{color:rgba(165,180,252,.55);}
.ad-hc-main{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;}
.ad-hc-val{font-family:'Syne',sans-serif;line-height:1;}
.ad-hc-quality .ad-hc-val{font-size:32px;font-weight:800;color:var(--amber,#fbbf24);}
.ad-hc-rank .ad-hc-val{font-size:52px;font-weight:800;color:var(--indigo,#818cf8);}
.ad-rank-hash{font-size:26px;color:rgba(165,180,252,.45);margin-right:1px;}
.ad-hc-aside{text-align:right;}
.ad-hc-pill{display:inline-flex;align-items:center;gap:5px;border-radius:100px;padding:4px 10px;font-family:'DM Mono',monospace;font-size:9.5px;font-weight:500;margin-bottom:6px;}
.ad-hc-quality .ad-hc-pill{background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.2);color:var(--amber,#fbbf24);}
.ad-hc-rank .ad-hc-pill{background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.2);color:var(--indigo,#818cf8);}
.ad-hc-note{font-family:'DM Mono',monospace;font-size:9px;color:var(--faint,rgba(255,255,255,.18));}
.ad-qual-levels{display:flex;gap:5px;margin-top:14px;}
.ad-ql{flex:1;height:5px;border-radius:3px;}
.ad-ql.low{background:#f87171;}.ad-ql.med{background:var(--amber,#fbbf24);}.ad-ql.high{background:var(--green,#34d399);}.ad-ql.off{background:var(--bg3,rgba(255,255,255,.08));}
.ad-qual-tags{display:flex;justify-content:space-between;margin-top:5px;}
.ad-qual-tag{font-family:'DM Mono',monospace;font-size:8px;color:var(--faint,rgba(255,255,255,.18));}
.ad-qual-tag.current{font-weight:600;}
.ad-qual-tag.current.low{color:#f87171;}.ad-qual-tag.current.med{color:var(--amber,#fbbf24);}.ad-qual-tag.current.high{color:var(--green,#34d399);}
.ad-rank-track{height:4px;background:var(--bg3,rgba(255,255,255,.07));border-radius:3px;margin-top:14px;overflow:hidden;}
.ad-rank-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#6366f1,#a5b4fc);}
.ad-rank-labels{display:flex;justify-content:space-between;margin-top:5px;}
.ad-rank-lbl{font-family:'DM Mono',monospace;font-size:8px;color:var(--faint,rgba(255,255,255,.18));}
.ad-rank-lbl.current{color:var(--indigo,#818cf8);font-weight:500;}

/* secondary metrics */
.ad-sec-row{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:20px;animation:fadeUp .5s .1s ease both;}
.ad-sc{background:var(--bg3);border:1px solid var(--border);border-radius:11px;padding:13px 14px;transition:all .2s;}
.ad-sc:hover{background:var(--bg-hover);border-color:var(--border2,rgba(255,255,255,.11));}
.ad-sc-lbl{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.8px;text-transform:uppercase;color:var(--faint,rgba(255,255,255,.18));margin-bottom:5px;}
.ad-sc-val{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;line-height:1.05;}
.ad-sc-unit{font-family:'DM Mono',monospace;font-size:10px;color:var(--muted,rgba(255,255,255,.38));}
.ad-sc-sub{font-family:'DM Mono',monospace;font-size:8px;color:var(--faint,rgba(255,255,255,.18));margin-top:3px;}
.ad-pips{display:flex;gap:3px;margin-top:6px;}
.ad-pip{height:5px;border-radius:2px;flex:1;}
.ad-pip.teal{background:var(--teal,#2dd4bf);}.ad-pip.amber{background:var(--amber,#fbbf24);}.ad-pip.off{background:var(--bg3,rgba(255,255,255,.08));}

/* panel grid */
.ad-pgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;}
.ad-panel{background:var(--bg2);border:1px solid var(--border);border-radius:13px;overflow:hidden;animation:fadeUp .5s ease both;}
.ad-ph{display:flex;align-items:center;justify-content:space-between;padding:13px 16px 12px;border-bottom:1px solid var(--border,rgba(255,255,255,.07));}
.ad-ph-title{display:flex;align-items:center;gap:7px;font-family:'DM Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.6px;color:var(--muted);text-transform:uppercase;}
.ad-pb-body{padding:16px;}

/* badges */
.ad-badge{font-family:'DM Mono',monospace;font-size:8px;font-weight:500;letter-spacing:.3px;padding:2px 8px;border-radius:4px;text-transform:uppercase;white-space:nowrap;}
.ad-badge.crit{background:var(--red-d,rgba(239,68,68,.08));color:var(--red,#f87171);border:1px solid var(--red-b,rgba(239,68,68,.2));}
.ad-badge.warn{background:var(--amber-d,rgba(245,158,11,.1));color:var(--amber,#fbbf24);border:1px solid var(--amber-b,rgba(245,158,11,.22));}
.ad-badge.ok{background:var(--green-d,rgba(52,211,153,.08));color:var(--green,#34d399);border:1px solid var(--green-b,rgba(52,211,153,.2));}
.ad-badge.miss{background:var(--red-d,rgba(239,68,68,.08));color:var(--red,#fca5a5);border:1px solid var(--red-b,rgba(239,68,68,.14));}
.ad-badge.info{background:var(--indigo-d,rgba(99,102,241,.1));color:var(--indigo,#818cf8);border:1px solid var(--indigo-b,rgba(99,102,241,.25));}

/* meta rows */
.ad-mrow{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--border,rgba(255,255,255,.07));}
.ad-mrow:last-child{border-bottom:none;}
.ad-mr-left{flex:1;min-width:0;}
.ad-mr-key{font-family:'DM Mono',monospace;font-size:10px;color:var(--faint,rgba(255,255,255,.18));margin-bottom:3px;text-transform:uppercase;letter-spacing:.4px;}
.ad-mr-val{font-family:'DM Mono',monospace;font-size:12px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ad-mr-right{flex-shrink:0;display:flex;align-items:center;}

/* suggestions */
.ad-sugg-list{display:flex;flex-direction:column;gap:8px;}
.ad-sugg{display:flex;gap:12px;padding:11px 13px;background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border,rgba(255,255,255,.07));border-radius:10px;transition:all .2s;}
.ad-sugg:hover{background:var(--bg-hover);border-color:var(--border2,rgba(255,255,255,.11));}
.ad-sugg-rank{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--faint,rgba(255,255,255,.18));flex-shrink:0;width:36px;text-align:center;align-self:center;}
.ad-sugg-body{flex:1;min-width:0;}
.ad-sugg-fix{font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px;line-height:1.35;}
.ad-sugg-why{font-family:'Outfit',sans-serif;font-size:11.5px;color:var(--muted,rgba(255,255,255,.38));line-height:1.5;}
.ad-impact-wrap{text-align:right;flex-shrink:0;}
.ad-impact-val{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;}
.ad-impact-high{color:var(--red,#f87171);}.ad-impact-med{color:var(--amber,#fbbf24);}
.ad-impact-lbl{font-family:'DM Mono',monospace;font-size:8px;color:var(--faint,rgba(255,255,255,.18));text-transform:uppercase;margin-bottom:3px;}

/* Score Timeline */
.ad-tl{background:var(--bg2);border:1px solid var(--border);border-radius:13px;overflow:hidden;margin-bottom:14px;animation:fadeUp .5s .15s ease both;}
.ad-tl-body{padding:18px 16px 14px;}
.ad-tl-empty{display:flex;align-items:center;justify-content:center;height:80px;font-family:'DM Mono',monospace;font-size:11px;color:var(--faint);letter-spacing:.3px;}
.ad-tl-chart{height:160px;margin-bottom:12px;}
.ad-tl-sched{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding-top:10px;border-top:1px solid var(--border);}
.ad-tl-sched-lbl{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);}
.ad-tl-freq-row{display:flex;gap:6px;}
.ad-tl-freq{padding:4px 12px;border-radius:6px;border:1px solid var(--border2);background:transparent;font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);cursor:pointer;transition:all .15s;}
.ad-tl-freq:hover{border-color:var(--teal-b,rgba(20,184,166,.3));color:var(--teal,#2dd4bf);}
.ad-tl-freq.active{border-color:var(--teal-b,rgba(20,184,166,.3));background:rgba(20,184,166,.08);color:var(--teal,#2dd4bf);}
.ad-tl-off{padding:4px 12px;border-radius:6px;border:1px solid var(--border2);background:transparent;font-family:'DM Mono',monospace;font-size:10px;color:var(--faint);cursor:pointer;transition:all .15s;margin-left:4px;}
.ad-tl-off:hover{border-color:rgba(239,68,68,.3);color:var(--red,#f87171);}
.ad-tl-note{font-family:'DM Mono',monospace;font-size:9px;color:var(--faint);margin-left:auto;}
.ad-tl-tt{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:8px 12px;font-family:'DM Mono',monospace;font-size:10px;color:var(--text);}
.ad-tl-tt-lbl{color:var(--muted);margin-bottom:2px;}

/* A/B Scorer */
.ad-ab-body{padding:18px 16px;}
.ad-ab-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-bottom:16px;}
.ad-ab-group{background:var(--bg3,rgba(255,255,255,.025));border:1px solid var(--border);border-radius:10px;padding:12px 14px;}
.ad-ab-group-lbl{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:8px;}
.ad-ab-lbl{font-family:'DM Mono',monospace;font-size:8.5px;color:var(--faint);text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px;margin-top:8px;}
.ad-ab-lbl:first-of-type{margin-top:0;}
.ad-ab-input{width:100%;background:var(--bg2);border:1px solid var(--border2);border-radius:7px;padding:7px 10px;font-family:'DM Mono',monospace;font-size:11px;color:var(--text);outline:none;resize:none;transition:border-color .15s;line-height:1.4;}
.ad-ab-input:focus{border-color:var(--teal-b,rgba(20,184,166,.35));}
.ad-ab-char{font-family:'DM Mono',monospace;font-size:8px;margin-top:3px;text-align:right;}
.ad-ab-char.ok{color:var(--green,#34d399);}.ad-ab-char.warn{color:var(--amber,#fbbf24);}.ad-ab-char.miss{color:var(--muted);}
.ad-ab-run-row{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
.ad-ab-run{padding:8px 20px;border-radius:9px;border:1px solid var(--teal-b,rgba(20,184,166,.3));background:var(--teal-d,rgba(20,184,166,.1));color:var(--teal,#2dd4bf);font-family:'DM Mono',monospace;font-size:11px;font-weight:500;letter-spacing:.4px;cursor:pointer;transition:all .2s;}
.ad-ab-run:hover:not(:disabled){background:rgba(20,184,166,.18);border-color:rgba(20,184,166,.45);}
.ad-ab-run:disabled{opacity:.4;cursor:not-allowed;}
.ad-ab-note{font-family:'DM Mono',monospace;font-size:10px;color:var(--faint);}
.ad-ab-results{display:flex;flex-direction:column;gap:8px;}
.ad-ab-res{border-radius:10px;border:1px solid var(--border);padding:12px 16px;}
.ad-ab-res.r1{border-color:rgba(52,211,153,.25);background:rgba(52,211,153,.04);}
.ad-ab-res.r2{border-color:rgba(251,191,36,.18);background:rgba(245,158,11,.03);}
.ad-ab-res-hdr{display:flex;align-items:center;gap:10px;margin-bottom:7px;flex-wrap:wrap;}
.ad-ab-var{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--muted);min-width:24px;}
.ad-ab-res.r1 .ad-ab-var{color:var(--green,#34d399);}.ad-ab-res.r2 .ad-ab-var{color:var(--amber,#fbbf24);}
.ad-ab-res-ttl{font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;color:var(--text);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.ad-ab-res-meta{font-family:'Outfit',sans-serif;font-size:11.5px;color:var(--muted);line-height:1.45;margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
.ad-ab-sigs{display:flex;gap:5px;flex-wrap:wrap;}
.ab-sig{font-family:'DM Mono',monospace;font-size:8px;padding:2px 6px;border-radius:4px;border:1px solid;white-space:nowrap;}
.ab-sig.ok{color:var(--green,#34d399);border-color:rgba(52,211,153,.25);background:rgba(52,211,153,.08);}
.ab-sig.warn{color:var(--amber,#fbbf24);border-color:rgba(251,191,36,.2);background:rgba(245,158,11,.06);}
.ab-sig.miss{color:var(--red,#f87171);border-color:rgba(239,68,68,.2);background:rgba(239,68,68,.06);}
.ad-ab-winner{font-family:'DM Mono',monospace;font-size:8.5px;padding:2px 8px;border-radius:4px;background:rgba(52,211,153,.1);color:var(--green,#34d399);border:1px solid rgba(52,211,153,.25);text-transform:uppercase;letter-spacing:.4px;margin-left:auto;flex-shrink:0;}
.ad-ab-rank{font-family:'DM Mono',monospace;font-size:10px;color:var(--indigo,#818cf8);flex-shrink:0;}

/* Brief modal */
.ad-brief-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:40px 20px 20px;overflow-y:auto;}
.ad-brief-modal{background:var(--bg1,#0a0f1e);border:1px solid var(--border);border-radius:18px;width:100%;max-width:780px;overflow:hidden;animation:fadeUp .3s ease both;flex-shrink:0;}
.ad-brief-mhdr{display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg1,#0a0f1e);z-index:1;}
.ad-brief-mhdr-left{display:flex;align-items:center;gap:10px;}
.ad-brief-mtitle{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:var(--text);}
.ad-brief-mbadge{font-family:'DM Mono',monospace;font-size:8px;padding:2px 8px;border-radius:4px;background:rgba(251,191,36,.1);color:var(--amber,#fbbf24);border:1px solid rgba(251,191,36,.2);text-transform:uppercase;letter-spacing:.4px;}
.ad-brief-close{width:30px;height:30px;border-radius:7px;border:1px solid var(--border);background:none;color:var(--muted);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.ad-brief-close:hover{border-color:var(--red,#f87171);color:var(--red,#f87171);}
.ad-brief-body{padding:24px;}
.ad-brief-kw{font-family:'DM Mono',monospace;font-size:10px;color:var(--faint);margin-bottom:20px;}
.ad-brief-kw strong{color:var(--teal,#2dd4bf);}
.ad-brief-title-tag{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px 16px;margin-bottom:14px;}
.ad-brief-lbl{font-family:'DM Mono',monospace;font-size:8.5px;text-transform:uppercase;letter-spacing:.6px;color:var(--faint);margin-bottom:6px;}
.ad-brief-val{font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;color:var(--text);line-height:1.4;}
.ad-brief-meta-tag{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px 16px;margin-bottom:14px;}
.ad-brief-meta-val{font-family:'Outfit',sans-serif;font-size:13px;color:var(--muted);line-height:1.5;}
.ad-brief-summary{background:rgba(20,184,166,.05);border:1px solid rgba(20,184,166,.15);border-radius:10px;padding:14px 16px;margin-bottom:20px;}
.ad-brief-summary-txt{font-family:'Outfit',sans-serif;font-size:13px;color:var(--muted);line-height:1.6;}
.ad-brief-stat-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px;}
.ad-brief-stat{background:var(--bg2);border:1px solid var(--border);border-radius:9px;padding:12px 14px;text-align:center;}
.ad-brief-stat-n{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--teal,#2dd4bf);}
.ad-brief-stat-l{font-family:'DM Mono',monospace;font-size:9px;color:var(--faint);text-transform:uppercase;letter-spacing:.4px;margin-top:2px;}
.ad-brief-section{margin-bottom:22px;}
.ad-brief-sh{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--text);margin-bottom:10px;display:flex;align-items:center;gap:7px;}
.ad-brief-sh::before{content:'';display:block;width:3px;height:13px;background:var(--amber,#fbbf24);border-radius:2px;}
.ad-brief-outline{display:flex;flex-direction:column;gap:6px;}
.ad-brief-ol-item{display:flex;align-items:flex-start;gap:10px;padding:9px 12px;background:var(--bg2);border-radius:8px;border:1px solid var(--border);}
.ad-brief-ol-lvl{font-family:'DM Mono',monospace;font-size:9px;padding:2px 6px;border-radius:4px;flex-shrink:0;margin-top:1px;}
.ol-h2{background:rgba(20,184,166,.1);color:var(--teal,#2dd4bf);border:1px solid rgba(20,184,166,.2);}
.ol-h3{background:rgba(129,140,248,.08);color:var(--indigo,#818cf8);border:1px solid rgba(129,140,248,.18);}
.ad-brief-ol-txt{flex:1;}
.ad-brief-ol-heading{font-family:'Outfit',sans-serif;font-size:12.5px;font-weight:600;color:var(--text);}
.ad-brief-ol-notes{font-family:'Outfit',sans-serif;font-size:11px;color:var(--faint);margin-top:2px;}
.ad-brief-pills{display:flex;flex-wrap:wrap;gap:6px;}
.ad-brief-pill{font-family:'DM Mono',monospace;font-size:10px;padding:4px 10px;border-radius:6px;background:var(--bg2);border:1px solid var(--border);color:var(--muted);}
.ad-brief-qs{display:flex;flex-direction:column;gap:5px;}
.ad-brief-q{font-family:'Outfit',sans-serif;font-size:12.5px;color:var(--muted);padding:7px 12px;background:var(--bg2);border-radius:7px;border:1px solid var(--border);}
.ad-brief-q::before{content:'Q: ';font-family:'DM Mono',monospace;font-size:10px;color:var(--amber,#fbbf24);}
.ad-brief-gaps{display:flex;flex-direction:column;gap:5px;}
.ad-brief-gap{font-family:'Outfit',sans-serif;font-size:12.5px;color:var(--muted);padding:7px 12px;background:rgba(244,63,94,.04);border-radius:7px;border:1px solid rgba(244,63,94,.15);}
.ad-brief-gap::before{content:'';font-family:'DM Mono',monospace;font-size:9px;color:var(--red,#f87171);}
.ad-brief-note{font-family:'Outfit',sans-serif;font-size:12px;color:var(--muted);background:var(--bg2);border-radius:8px;padding:10px 14px;border:1px solid var(--border);line-height:1.5;}
.ad-brief-mftr{padding:16px 24px;border-top:1px solid var(--border);display:flex;gap:10px;}
.ad-brief-copy{flex:1;padding:10px;border-radius:9px;border:1px solid rgba(251,191,36,.3);background:rgba(251,191,36,.08);color:var(--amber,#fbbf24);font-family:'DM Mono',monospace;font-size:11px;font-weight:500;cursor:pointer;transition:all .2s;letter-spacing:.3px;}
.ad-brief-copy:hover{background:rgba(251,191,36,.15);}
.ad-brief-copy.copied{background:rgba(52,211,153,.1);border-color:rgba(52,211,153,.3);color:var(--green,#34d399);}
.ad-brief-dismiss{padding:10px 18px;border-radius:9px;border:1px solid var(--border);background:none;color:var(--muted);font-family:'DM Mono',monospace;font-size:11px;cursor:pointer;transition:all .15s;}
.ad-brief-dismiss:hover{border-color:var(--border2);}

/* CTA */
.ad-cta-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px;animation:fadeUp .5s .25s ease both;}
.ad-cta-card{background:linear-gradient(135deg,rgba(13,148,136,.1),rgba(15,118,110,.04));border:1px solid rgba(13,148,136,.25);border-radius:13px;padding:20px 22px;cursor:pointer;transition:all .2s;text-decoration:none;display:block;}
.ad-cta-card.indigo{background:linear-gradient(135deg,rgba(99,102,241,.1),rgba(79,70,229,.04));border-color:rgba(99,102,241,.25);}
.ad-cta-card.rose{background:linear-gradient(135deg,rgba(244,63,94,.08),rgba(190,18,60,.04));border-color:rgba(244,63,94,.25);}
.ad-cta-card:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.25);}
.ad-cta-icon{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;}
.ad-cta-card:not(.indigo):not(.rose) .ad-cta-icon{background:rgba(13,148,136,.18);border:1px solid rgba(13,148,136,.3);}
.ad-cta-card.indigo .ad-cta-icon{background:rgba(99,102,241,.18);border:1px solid rgba(99,102,241,.3);}
.ad-cta-card.rose .ad-cta-icon{background:rgba(244,63,94,.14);border:1px solid rgba(244,63,94,.3);}
.ad-cta-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:var(--text);margin-bottom:5px;}
.ad-cta-sub{font-family:'Outfit',sans-serif;font-size:12px;color:var(--muted,rgba(255,255,255,.38));line-height:1.5;}
.ad-cta-arrow{display:inline-flex;align-items:center;gap:5px;margin-top:10px;font-family:'DM Mono',monospace;font-size:11px;}
.ad-cta-card:not(.indigo):not(.rose) .ad-cta-arrow{color:var(--teal,#2dd4bf);}
.ad-cta-card.indigo .ad-cta-arrow{color:var(--indigo,#818cf8);}
.ad-cta-card.rose .ad-cta-arrow{color:#fb7185;}
/* download btn in header */
.ad-dl-btn{display:inline-flex;align-items:center;gap:7px;background:rgba(244,63,94,.1);border:1px solid rgba(244,63,94,.25);color:#fb7185;border-radius:8px;padding:6px 14px;font-family:'DM Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.4px;text-transform:uppercase;cursor:pointer;transition:all .2s;}
.ad-dl-btn:hover{background:rgba(244,63,94,.18);border-color:rgba(244,63,94,.4);transform:translateY(-1px);}

@media(min-width:900px){.ad-cta-row{grid-template-columns:repeat(4,1fr);}}
@media(max-width:900px){.ad-sec-row{grid-template-columns:repeat(3,1fr);}.ad-pgrid{grid-template-columns:1fr;}}
@media(max-width:600px){.ad-hero-row{grid-template-columns:1fr;}.ad-sec-row{grid-template-columns:1fr 1fr;}.ad-cta-row{grid-template-columns:1fr;}.ad{padding:20px 16px 40px;}}
`

const check = (ok) => ok
  ? <Check size={14} strokeWidth={2.5} stroke="#34d399" />
  : <X size={14} strokeWidth={2.5} stroke="#f87171" />

export default function AuditDashboard() {
  const { id }            = useParams()
  const navigate          = useNavigate()
  const { currentAudit, isLoading, setAudit } = useAudit()
  const can = usePlanStore(s => s.can)
  const [error,    setError]    = useState('')
  const [abVars,      setAbVars]      = useState([{ title: '', meta_description: '' }, { title: '', meta_description: '' }])
  const [abResults,   setAbResults]   = useState([])
  const [abLoading,   setAbLoading]   = useState(false)
  const [brief,       setBrief]        = useState(null)
  const [briefLoading,setBriefLoading] = useState(false)
  const [briefCopied, setBriefCopied]  = useState(false)
  const [scoreHistory,setScoreHistory] = useState([])
  const [schedule,    setSchedule]    = useState(null)
  const [schedLoading,setSchedLoading] = useState(false)
  const tlLoadedFor = useRef(null)

  const runAbScore = useCallback(async () => {
    if (!currentAudit) return
    setAbLoading(true)
    try {
      const res = await api.abScore(currentAudit.id, abVars)
      setAbResults(res.results || [])
    } finally {
      setAbLoading(false)
    }
  }, [currentAudit, abVars])

  const toggleSchedule = useCallback(async (frequency) => {
    if (!currentAudit) return
    if (schedule?.id) {
      if (schedule.frequency === frequency) {
        setSchedLoading(true)
        try { await api.deleteSchedule(schedule.id); setSchedule(null) } finally { setSchedLoading(false) }
      } else {
        setSchedLoading(true)
        try { await api.deleteSchedule(schedule.id); const s = await api.createSchedule(currentAudit.url, currentAudit.keyword, frequency); setSchedule(s) } finally { setSchedLoading(false) }
      }
    } else {
      setSchedLoading(true)
      try { const s = await api.createSchedule(currentAudit.url, currentAudit.keyword, frequency); setSchedule(s) } finally { setSchedLoading(false) }
    }
  }, [currentAudit, schedule])

  useEffect(() => {
    if (currentAudit?.id === id) return
    getAudit(id)
      .then(setAudit)
      .catch(() => setError('Audit not found. It may have been deleted.'))
  }, [id])

  const handleGenerateBrief = useCallback(async () => {
    if (!currentAudit) return
    setBriefLoading(true)
    try {
      const b = await api.generateBrief(currentAudit.id)
      setBrief(b)
    } catch (e) {
      console.error('Brief generation failed:', e)
    } finally {
      setBriefLoading(false)
    }
  }, [currentAudit])

  const copyBrief = useCallback(() => {
    if (!brief) return
    const lines = [
      `# Content Brief: ${brief.keyword}`,
      `URL: ${brief.url}`,
      '',
      `## Title Tag`,
      brief.title_suggestion,
      '',
      `## Meta Description`,
      brief.meta_description,
      '',
      `## Strategy`,
      brief.summary,
      '',
      `## Targets`,
      `- Word count: ${brief.word_count_target}`,
      `- Keyword density: ${brief.keyword_density_target}%`,
      '',
      `## Content Outline`,
      ...(brief.outline || []).map(o => `${'  '.repeat(o.level === 'h3' ? 1 : 0)}${o.level.toUpperCase()}: ${o.heading}${o.notes ? `- ${o.notes}` : ''}`),
      '',
      `## Entities to Mention`,
      ...(brief.entities || []).map(e => `- ${e}`),
      '',
      `## Questions to Answer`,
      ...(brief.questions || []).map(q => `- ${q}`),
      '',
      `## Content Gaps vs Competitors`,
      ...(brief.content_gaps || []).map(g => `- ${g}`),
      '',
      `## Internal Linking`,
      brief.internal_link_notes || '',
    ]
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setBriefCopied(true)
      setTimeout(() => setBriefCopied(false), 2500)
    })
  }, [brief])

  useEffect(() => {
    if (!currentAudit) return
    const key = `${currentAudit.url}|||${currentAudit.keyword}`
    if (tlLoadedFor.current === key) return
    tlLoadedFor.current = key
    api.getScoreHistory(currentAudit.url, currentAudit.keyword)
      .then(r => setScoreHistory(r.history || []))
      .catch(() => {})
    api.getScheduleFor(currentAudit.url, currentAudit.keyword)
      .then(s => setSchedule(s?.id ? s : null))
      .catch(() => {})
  }, [currentAudit])

  if (isLoading || (!currentAudit && !error) || (currentAudit?.id !== id && !error)) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className="ad">
          <div className="ad-loading">
            <div className="ad-spin" />
            <div className="ad-load-txt">Loading audit analysis…</div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className="ad" style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'50vh',gap:12 }}>
          <div style={{ fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:700,color:'var(--text)' }}>Audit not found</div>
          <div style={{ fontFamily:"'DM Mono',monospace",fontSize:12,color:'var(--muted)' }}>{error}</div>
          <button onClick={() => navigate('/dashboard')} style={{ marginTop:12,padding:'10px 22px',borderRadius:9,background:'var(--teal-d)',border:'1px solid var(--teal-b)',color:'var(--teal)',fontFamily:"'Outfit',sans-serif",fontSize:13,cursor:'pointer' }}>
            Back to Dashboard
          </button>
        </div>
      </>
    )
  }

  const a = currentAudit
  const qualityLevel = a.quality === 'HIGH' ? 'high' : a.quality === 'MEDIUM' ? 'med' : 'low'
  const rankPct = Math.max(5, Math.round(((100 - a.predictedRank) / 100) * 100))

  const handleDownloadReport = () => {
    printSeoReport({ ...a, roadmapTasks: a.roadmapTasks || [] })
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="ad">
        {/* ── Header ── */}
        <div className="ad-hdr">
          <div className="ad-eyebrow">
            <span className="ad-eyebrow-txt">AI Analysis Complete</span>
          </div>
          <h1 className="ad-title">SEO Analysis- <em>{a.keyword}</em></h1>
          <div className="ad-meta">
            <div className="ad-chip"><span className="ad-chip-lbl"><Search size={11} strokeWidth={1.8} style={{display:'inline',verticalAlign:'middle',marginRight:3}} /><b>{a.keyword}</b></span></div>
            <div className="ad-chip"><span className="ad-chip-lbl"><Globe size={11} strokeWidth={1.8} style={{display:'inline',verticalAlign:'middle',marginRight:3}} /><b>{a.url}</b></span></div>
            <button className="ad-dl-btn" onClick={handleDownloadReport} id="download-report-btn">
              <Download size={12} strokeWidth={2.2} />
              Download Report
            </button>
          </div>
        </div>

        {/* ── Hero cards ── */}
        <div className="ad-hero-row">
          <div className="ad-hc ad-hc-quality">
            <div className="ad-hc-lbl">Content Quality</div>
            <div className="ad-hc-main">
              <div className="ad-hc-val">{a.quality}</div>
              <div className="ad-hc-aside">
                <div className={`ad-hc-pill`}>SEO Score: {a.seoScore}</div>
                <div className="ad-hc-note">Based on {a.signalCount} signals</div>
              </div>
            </div>
            <div className="ad-qual-levels">
              <div className={`ad-ql ${qualityLevel === 'low' ? 'low' : 'off'}`}/>
              <div className={`ad-ql ${qualityLevel === 'med' || qualityLevel === 'high' ? 'med' : 'off'}`}/>
              <div className={`ad-ql ${qualityLevel === 'high' ? 'high' : 'off'}`}/>
            </div>
            <div className="ad-qual-tags">
              <span className={`ad-qual-tag ${qualityLevel === 'low' ? 'current low' : ''}`}>Low</span>
              <span className={`ad-qual-tag ${qualityLevel === 'med' ? 'current med' : ''}`}>Medium</span>
              <span className={`ad-qual-tag ${qualityLevel === 'high' ? 'current high' : ''}`}>High</span>
            </div>
          </div>

          <div className="ad-hc ad-hc-rank">
            <div className="ad-hc-lbl">Predicted Position</div>
            <div className="ad-hc-main">
              <div className="ad-hc-val">
                <span className="ad-rank-hash">#</span>{a.predictedRank}
              </div>
              <div className="ad-hc-aside">
                <div className="ad-hc-pill">
                  Confidence: {a.classificationConfidence >= 80 ? 'High' : a.classificationConfidence >= 55 ? 'Medium' : 'Low'} ({a.classificationConfidence}%)
                </div>
                <div className="ad-hc-note">{a.rankR2 != null ? `R²=${a.rankR2.toFixed(2)} · ` : ''}on-page signals only</div>
              </div>
            </div>
            <div className="ad-rank-track"><div className="ad-rank-fill" style={{ width:`${rankPct}%` }}/></div>
            <div className="ad-rank-labels">
              <span className="ad-rank-lbl">#100</span>
              <span className="ad-rank-lbl current">#{a.predictedRank}</span>
              <span className="ad-rank-lbl">#1</span>
            </div>
          </div>
        </div>

        {/* ── Secondary metrics ── */}
        <div className="ad-sec-row">
          {[
            { lbl:'Keyword Coverage', val: a.keywordCoverage, unit:'/5', sub:'placement signals', pips: a.keywordCoverage, max:5, color:'teal' },
            { lbl:'Technical Score',  val: a.technicalScore,  unit:'/5', sub:'page health',       pips: a.technicalScore, max:5, color:'teal' },
            { lbl:'Issues Found',     val: a.issuesFound,     unit:'',   sub:'fix recommended',   pips: a.issuesFound, max:5, color:'amber' },
            { lbl:'Checks Passed',    val: a.checksPassed,    unit:'',   sub:`of ${a.checksPassed + a.issuesFound} total`, pips: null },
            { lbl:'Word Count',       val: a.wordCount,       unit:'',   sub:'words on page', pips: null },
          ].map(m => (
            <div key={m.lbl} className="ad-sc">
              <div className="ad-sc-lbl">{m.lbl}</div>
              <div className="ad-sc-val" style={{ color: m.color==='amber' ? 'var(--amber,#fbbf24)' : m.color==='teal' ? 'var(--teal,#2dd4bf)' : 'var(--text,rgba(255,255,255,.88))' }}>
                {m.val.toLocaleString()}<span className="ad-sc-unit">{m.unit}</span>
              </div>
              <div className="ad-sc-sub">{m.sub}</div>
              {m.pips !== null && (
                <div className="ad-pips">
                  {Array.from({ length: m.max || 5 }).map((_, i) => (
                    <div key={i} className={`ad-pip ${i < m.pips ? m.color : 'off'}`}/>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Score Timeline ── */}
        <div className="ad-tl">
          <div className="ad-ph">
            <div className="ad-ph-title">
              <Activity size={13} strokeWidth={1.8} />
              SEO Score Timeline
            </div>
            {scoreHistory.length > 1 && <span className="ad-badge ok">{scoreHistory.length} audits</span>}
          </div>
          <div className="ad-tl-body">
            {scoreHistory.length <= 1 ? (
              <div className="ad-tl-empty">Run more audits for this URL to see your score trend.</div>
            ) : (
              <div className="ad-tl-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#2dd4bf" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false}/>
                    <XAxis dataKey="date" tick={{ fontFamily:'DM Mono', fontSize:9, fill:'rgba(255,255,255,.3)' }} axisLine={false} tickLine={false}/>
                    <YAxis domain={[0, 100]} tick={{ fontFamily:'DM Mono', fontSize:9, fill:'rgba(255,255,255,.3)' }} axisLine={false} tickLine={false}/>
                    <Tooltip
                      content={({ active, payload, label }) =>
                        active && payload?.length ? (
                          <div className="ad-tl-tt">
                            <div className="ad-tl-tt-lbl">{label}</div>
                            <div>Score: <strong>{payload[0].value}</strong></div>
                            <div>Quality: <strong>{payload[0].payload.quality}</strong></div>
                            <div>Rank: <strong>#{payload[0].payload.predicted_rank}</strong></div>
                          </div>
                        ) : null
                      }
                    />
                    <Area type="monotone" dataKey="seo_score" stroke="#2dd4bf" strokeWidth={2} fill="url(#tealGrad)" dot={{ r:4, fill:'#2dd4bf', strokeWidth:0 }} activeDot={{ r:5 }}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="ad-tl-sched">
              <span className="ad-tl-sched-lbl">Auto re-audit:</span>
              <div className="ad-tl-freq-row">
                <button className={`ad-tl-freq${schedule?.frequency === 'weekly' ? ' active' : ''}`} disabled={schedLoading} onClick={can('scheduling') ? () => toggleSchedule('weekly') : () => navigate('/billing')}>Weekly</button>
                <button className={`ad-tl-freq${schedule?.frequency === 'monthly' ? ' active' : ''}`} disabled={schedLoading} onClick={can('scheduling') ? () => toggleSchedule('monthly') : () => navigate('/billing')}>Monthly</button>
                {schedule && can('scheduling') && <button className="ad-tl-off" disabled={schedLoading} onClick={() => toggleSchedule(schedule.frequency)}>Off</button>}
                {!can('scheduling') && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#0d9488', background:'rgba(13,148,136,.08)', border:'1px solid rgba(13,148,136,.2)', borderRadius:5, padding:'2px 8px', cursor:'pointer' }} onClick={() => navigate('/billing')}>Pro</span>}
              </div>
              <span className="ad-tl-note">
                {can('scheduling')
                  ? (schedule ? `Next: ${schedule.next_run_at?.slice(0, 10) || '-'}` : 'Enable to track score over time')
                  : 'Upgrade to Pro to enable auto re-auditing'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Panels ── */}
        <div className="ad-pgrid">
          {/* On-page Metadata */}
          <div className="ad-panel">
            <div className="ad-ph">
              <div className="ad-ph-title">
                <FileText size={13} strokeWidth={1.8} />
                On-Page Metadata
              </div>
              <span className={`ad-badge ${a.issuesFound > 2 ? 'crit' : 'warn'}`}>{a.issuesFound} issues</span>
            </div>
            <div className="ad-pb-body">
              {[
                { key:'Page Title',       val: a.pageTitle,       badge: a.titleHasKw ? null : { cls:'miss', txt:'Missing KW' } },
                { key:'Meta Description', val: a.metaDescription, badge: a.metaHasKw  ? null : { cls:'miss', txt:'Missing KW' } },
                { key:'H1 Heading',       val: a.h1,              badge: a.h1HasKw    ? null : { cls:'miss', txt:'Missing KW' } },
                { key:'Canonical URL',    val: a.canonical,       badge: null },
                { key:'Index Status',     val: a.indexStatus,     badge: { cls:'ok', txt:'OK' } },
              ].map(r => (
                <div key={r.key} className="ad-mrow">
                  <div className="ad-mr-left">
                    <div className="ad-mr-key">{r.key}</div>
                    <div className="ad-mr-val">{r.val}</div>
                  </div>
                  <div className="ad-mr-right">
                    {r.badge
                      ? <span className={`ad-badge ${r.badge.cls}`}>{r.badge.txt}</span>
                      : <span className={`ad-badge ok`}>OK</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Keyword presence */}
          <div className="ad-panel">
            <div className="ad-ph">
              <div className="ad-ph-title">
                <Search size={13} strokeWidth={1.8} />
                Keyword Presence
              </div>
              <span className="ad-badge info">{a.keyword}</span>
            </div>
            <div className="ad-pb-body">
              {[
                { loc:'Title Tag',        ok: a.titleHasKw },
                { loc:'Meta Description', ok: a.metaHasKw  },
                { loc:'H1 Heading',       ok: a.h1HasKw    },
                { loc:'Image Alt Text',   ok: a.altHasKw   },
                { loc:'Body Content',     ok: a.bodyHasKw  },
              ].map(r => (
                <div key={r.loc} className="ad-mrow">
                  <div className="ad-mr-left">
                    <div className="ad-mr-val">{r.loc}</div>
                  </div>
                  <div className="ad-mr-right" style={{ gap: 8, display:'flex', alignItems:'center' }}>
                    {check(r.ok)}
                    <span className={`ad-badge ${r.ok ? 'ok' : 'miss'}`}>{r.ok ? 'Found' : 'Missing'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content stats */}
          <div className="ad-panel">
            <div className="ad-ph">
              <div className="ad-ph-title">
                <LayoutGrid size={13} strokeWidth={1.8} />
                Content Statistics
              </div>
            </div>
            <div className="ad-pb-body">
              {[
                { key:'Word Count',        val: a.wordCount + ' words',       badge: a.wordCount >= 1500 ? { cls:'ok',txt:'Good' } : { cls:'warn',txt:'Too short' } },
                { key:'Keyword Density',   val: a.keywordDensity + '%',       badge: a.keywordDensity >= 1 && a.keywordDensity <= 3 ? { cls:'ok',txt:'Good' } : { cls:'warn',txt:'Check' } },
                { key:'Paragraphs',        val: a.paragraphs + ' sections',   badge: null },
                { key:'H2 Headings',       val: a.h2Count + ' subheadings',   badge: null },
                { key:'H3 Headings',       val: a.h3Count + ' sub-sections',  badge: null },
              ].map(r => (
                <div key={r.key} className="ad-mrow">
                  <div className="ad-mr-left">
                    <div className="ad-mr-key">{r.key}</div>
                    <div className="ad-mr-val">{r.val}</div>
                  </div>
                  <div className="ad-mr-right">
                    {r.badge
                      ? <span className={`ad-badge ${r.badge.cls}`}>{r.badge.txt}</span>
                      : null
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical */}
          <div className="ad-panel">
            <div className="ad-ph">
              <div className="ad-ph-title">
                <Settings size={13} strokeWidth={1.8} />
                Technical Signals
              </div>
            </div>
            <div className="ad-pb-body">
              {[
                { key:'Alt Text Coverage',  val: a.altCoverage + '%',          badge: a.altCoverage >= 80 ? { cls:'ok',txt:'Good' } : { cls:'warn',txt:'Low' } },
                { key:'Internal Links',     val: a.internalLinks + ' links',   badge: a.internalLinks >= 50 ? { cls:'ok',txt:'Good' } : { cls:'warn',txt:'Low' } },
                { key:'External Links',     val: a.externalLinks + ' links',   badge: null },
                { key:'Schema Markup',      val: a.hasSchema ? 'Present' : 'Not detected', badge: a.hasSchema ? { cls:'ok',txt:'Present' } : { cls:'miss',txt:'Missing' } },
                { key:'Readability Score',  val: a.readabilityScore + '/100',  badge: a.readabilityScore >= 60 ? { cls:'ok',txt:'Good' } : { cls:'warn',txt:'Improve' } },
              ].map(r => (
                <div key={r.key} className="ad-mrow">
                  <div className="ad-mr-left">
                    <div className="ad-mr-key">{r.key}</div>
                    <div className="ad-mr-val">{r.val}</div>
                  </div>
                  <div className="ad-mr-right">
                    {r.badge ? <span className={`ad-badge ${r.badge.cls}`}>{r.badge.txt}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Suggestions ── */}
        <div className="ad-panel" style={{ marginBottom:14, animation:'fadeUp .5s .2s ease both' }}>
          <div className="ad-ph">
            <div className="ad-ph-title">
              <Zap size={13} strokeWidth={1.8} />
              Top AI Suggestions
            </div>
            <span className="ad-badge warn">{a.suggestions.length} improvements</span>
          </div>
          <div className="ad-pb-body">
            <div className="ad-sugg-list">
              {a.suggestions.map(s => (
                <div key={s.rank} className="ad-sugg">
                  <div className="ad-sugg-rank">#{s.rank}</div>
                  <div className="ad-sugg-body">
                    <div className="ad-sugg-fix">{s.fix}</div>
                    <div className="ad-sugg-why">{s.why}</div>
                  </div>
                  <div className="ad-impact-wrap">
                    <div className="ad-impact-lbl">Impact</div>
                    <div className={`ad-impact-val ${s.impact === 'high' ? 'ad-impact-high' : 'ad-impact-med'}`}>
                      +{s.pct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── A/B Title & Meta Scorer ── */}
        <div className="ad-panel" style={{ marginBottom:14, animation:'fadeUp .5s .23s ease both' }}>
          <div className="ad-ph">
            <div className="ad-ph-title">
              <LayoutGrid size={13} strokeWidth={1.8} />
              A/B Title &amp; Meta Scorer
            </div>
            <span className="ad-badge info">No extra credit usage</span>
          </div>
          <div className="ad-ab-body">
            <div className="ad-ab-grid">
              {abVars.map((v, i) => {
                const titleLen = v.title.length
                const metaLen  = v.meta_description.length
                const tClass   = titleLen === 0 ? 'miss' : titleLen >= 50 && titleLen <= 60 ? 'ok' : 'warn'
                const mClass   = metaLen  === 0 ? 'miss' : metaLen  >= 120 && metaLen  <= 160 ? 'ok' : 'warn'
                return (
                  <div key={i} className="ad-ab-group">
                    <div className="ad-ab-group-lbl">Variant {String.fromCharCode(65 + i)}</div>
                    <div className="ad-ab-lbl">Title Tag</div>
                    <input
                      className="ad-ab-input"
                      value={v.title}
                      placeholder={i === 0 ? a.pageTitle : 'Enter alternative title…'}
                      onChange={e => setAbVars(vars => vars.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                    />
                    <div className={`ad-ab-char ${tClass}`}>
                      {titleLen} chars{titleLen > 0 ? (titleLen < 50 ? ' · too short' : titleLen > 60 ? ' · too long' : ' · ideal') : ' · 50–60 recommended'}
                    </div>
                    <div className="ad-ab-lbl" style={{ marginTop:10 }}>Meta Description</div>
                    <textarea
                      className="ad-ab-input"
                      rows={2}
                      value={v.meta_description}
                      placeholder={i === 0 ? a.metaDescription : 'Enter alternative meta description…'}
                      onChange={e => setAbVars(vars => vars.map((x, j) => j === i ? { ...x, meta_description: e.target.value } : x))}
                    />
                    <div className={`ad-ab-char ${mClass}`}>
                      {metaLen} chars{metaLen > 0 ? (metaLen < 120 ? ' · too short' : metaLen > 160 ? ' · too long' : ' · ideal') : ' · 120–160 recommended'}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="ad-ab-run-row">
              <button className="ad-ab-run" onClick={runAbScore} disabled={abLoading || abVars.every(v => !v.title && !v.meta_description)}>
                {abLoading ? 'Scoring…' : 'Score Variants'}
              </button>
              <span className="ad-ab-note">Re-runs the ML classifier with your variants- instant, no Credit cost.</span>
            </div>
            {abResults.length > 0 && (
              <div className="ad-ab-results">
                {abResults.map((r, i) => (
                  <div key={r.variant} className={`ad-ab-res${i === 0 ? ' r1' : i === 1 ? ' r2' : ''}`}>
                    <div className="ad-ab-res-hdr">
                      <span className="ad-ab-var">{r.variant}</span>
                      <span className={`ad-badge ${r.quality === 'HIGH' ? 'ok' : r.quality === 'MEDIUM' ? 'warn' : 'crit'}`}>{r.quality}</span>
                      <span className="ad-ab-rank">#{r.predicted_rank} predicted</span>
                      {i === 0 && <span className="ad-ab-winner">Best</span>}
                    </div>
                    <div className="ad-ab-res-ttl">{r.title}</div>
                    <div className="ad-ab-res-meta">{r.meta_description}</div>
                    <div className="ad-ab-sigs">
                      <span className={`ab-sig ${r.title_has_kw ? 'ok' : 'miss'}`}>Title KW: {r.title_has_kw ? 'Yes' : 'No'}</span>
                      <span className={`ab-sig ${r.meta_has_kw ? 'ok' : 'miss'}`}>Meta KW: {r.meta_has_kw ? 'Yes' : 'No'}</span>
                      <span className={`ab-sig ${r.optimal_title ? 'ok' : 'warn'}`}>Title len: {r.title_length}c {r.optimal_title ? 'OK' : 'Warn'}</span>
                      <span className={`ab-sig ${r.optimal_meta ? 'ok' : 'warn'}`}>Meta len: {r.meta_length}c {r.optimal_meta ? 'OK' : 'Warn'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CTA cards ── */}
        <div className="ad-cta-row">
          <div className="ad-cta-card" onClick={() => navigate(`/audit/${a.id}/competitors`)}>
            <div className="ad-cta-icon">
              <Users size={18} strokeWidth={1.8} stroke="var(--teal,#2dd4bf)" />
            </div>
            <div className="ad-cta-title">View Competitor Benchmark</div>
            <div className="ad-cta-sub">See exactly how you stack up against the top 10 ranking pages with a head-to-head breakdown.</div>
            <div className="ad-cta-arrow">View Competitors →</div>
          </div>

          <div className="ad-cta-card indigo" onClick={() => navigate(`/audit/${a.id}/roadmap`)}>
            <div className="ad-cta-icon">
              <Map size={18} strokeWidth={1.8} stroke="var(--indigo,#818cf8)" />
            </div>
            <div className="ad-cta-title">Open Optimization Roadmap</div>
            <div className="ad-cta-sub">Your {a.roadmapTasks?.length || 0} prioritised tasks with estimated position gains. Tick them off as you go.</div>
            <div className="ad-cta-arrow">View Roadmap →</div>
          </div>

          {/* Content Brief CTA — shows for everyone; Free users are redirected to billing on click */}
          <div
            className="ad-cta-card"
            style={{background:'linear-gradient(135deg,rgba(251,191,36,.1),rgba(217,119,6,.04))',borderColor:'rgba(251,191,36,.28)', position:'relative'}}
            onClick={can('brief') ? handleGenerateBrief : () => navigate('/billing')}
          >
            {!can('brief') && (
              <span style={{position:'absolute',top:10,right:10,fontFamily:"'DM Mono',monospace",fontSize:9,color:'#0d9488',background:'rgba(13,148,136,.1)',border:'1px solid rgba(13,148,136,.25)',borderRadius:4,padding:'2px 7px'}}>Pro</span>
            )}
            <div className="ad-cta-icon" style={{background:'rgba(251,191,36,.14)',border:'1px solid rgba(251,191,36,.3)'}}>
              <FileText size={17} strokeWidth={1.8} stroke="#fbbf24" />
            </div>
            <div className="ad-cta-title">{briefLoading ? 'Generating…' : 'Content Brief'}</div>
            <div className="ad-cta-sub">{briefLoading ? 'Gemini 2.0 Flash is writing your brief…' : 'AI-generated brief with outline, entities, questions and content gaps vs competitors.'}</div>
            <div className="ad-cta-arrow" style={{color:'#fbbf24'}}>{briefLoading ? 'Working…' : 'Generate Brief'}</div>
          </div>

          {/* Download Report CTA — fully free, client-side render */}
          <div className="ad-cta-card rose" onClick={handleDownloadReport} id="cta-download-report">
            <div className="ad-cta-icon">
              <Download size={18} strokeWidth={1.8} stroke="#fb7185" />
            </div>
            <div className="ad-cta-title">Download PDF Report</div>
            <div className="ad-cta-sub">Export a print-ready SEO audit report with all checks, issues, and recommendations.</div>
            <div className="ad-cta-arrow">Download Report →</div>
          </div>
        </div>
      </div>

      {/* ── Content Brief Modal ── */}
      {brief && (
        <div className="ad-brief-overlay" onClick={e => e.target === e.currentTarget && setBrief(null)}>
          <div className="ad-brief-modal">
            <div className="ad-brief-mhdr">
              <div className="ad-brief-mhdr-left">
                <span className="ad-brief-mtitle">Content Brief</span>
                <span className="ad-brief-mbadge">Gemini 2.0 Flash</span>
              </div>
              <button className="ad-brief-close" onClick={() => setBrief(null)}><X size={14} strokeWidth={2} /></button>
            </div>
            <div className="ad-brief-body">
              <div className="ad-brief-kw">Keyword: <strong>{brief.keyword}</strong> · {brief.url}</div>

              {/* Title + Meta */}
              <div className="ad-brief-title-tag">
                <div className="ad-brief-lbl">Suggested Title Tag</div>
                <div className="ad-brief-val">{brief.title_suggestion}</div>
              </div>
              <div className="ad-brief-meta-tag">
                <div className="ad-brief-lbl">Suggested Meta Description</div>
                <div className="ad-brief-meta-val">{brief.meta_description}</div>
              </div>

              {/* Summary */}
              <div className="ad-brief-summary">
                <div className="ad-brief-lbl" style={{marginBottom:8}}>Strategy Summary</div>
                <div className="ad-brief-summary-txt">{brief.summary}</div>
              </div>

              {/* Stats */}
              <div className="ad-brief-stat-row">
                <div className="ad-brief-stat">
                  <div className="ad-brief-stat-n">{brief.word_count_target?.toLocaleString()}</div>
                  <div className="ad-brief-stat-l">Target Words</div>
                </div>
                <div className="ad-brief-stat">
                  <div className="ad-brief-stat-n">{brief.keyword_density_target}%</div>
                  <div className="ad-brief-stat-l">KW Density</div>
                </div>
                <div className="ad-brief-stat">
                  <div className="ad-brief-stat-n">{brief.outline?.length || 0}</div>
                  <div className="ad-brief-stat-l">Headings</div>
                </div>
              </div>

              {/* Outline */}
              {brief.outline?.length > 0 && (
                <div className="ad-brief-section">
                  <div className="ad-brief-sh">Content Outline</div>
                  <div className="ad-brief-outline">
                    {brief.outline.map((o, i) => (
                      <div key={i} className="ad-brief-ol-item">
                        <span className={`ad-brief-ol-lvl ol-${o.level}`}>{o.level?.toUpperCase()}</span>
                        <div className="ad-brief-ol-txt">
                          <div className="ad-brief-ol-heading">{o.heading}</div>
                          {o.notes && <div className="ad-brief-ol-notes">{o.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Entities */}
              {brief.entities?.length > 0 && (
                <div className="ad-brief-section">
                  <div className="ad-brief-sh">Entities to Mention</div>
                  <div className="ad-brief-pills">
                    {brief.entities.map((e, i) => <span key={i} className="ad-brief-pill">{e}</span>)}
                  </div>
                </div>
              )}

              {/* Questions */}
              {brief.questions?.length > 0 && (
                <div className="ad-brief-section">
                  <div className="ad-brief-sh">Questions to Answer</div>
                  <div className="ad-brief-qs">
                    {brief.questions.map((q, i) => <div key={i} className="ad-brief-q">{q}</div>)}
                  </div>
                </div>
              )}

              {/* Gaps */}
              {brief.content_gaps?.length > 0 && (
                <div className="ad-brief-section">
                  <div className="ad-brief-sh">Content Gaps vs Competitors</div>
                  <div className="ad-brief-gaps">
                    {brief.content_gaps.map((g, i) => <div key={i} className="ad-brief-gap">{g}</div>)}
                  </div>
                </div>
              )}

              {/* Internal linking */}
              {brief.internal_link_notes && (
                <div className="ad-brief-section">
                  <div className="ad-brief-sh">Internal Linking</div>
                  <div className="ad-brief-note">{brief.internal_link_notes}</div>
                </div>
              )}
            </div>
            <div className="ad-brief-mftr">
              <button className={`ad-brief-copy${briefCopied ? ' copied' : ''}`} onClick={copyBrief}>
                {briefCopied ? 'Copied to clipboard' : 'Copy as Markdown'}
              </button>
              <button className="ad-brief-dismiss" onClick={() => setBrief(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
