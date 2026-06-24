import { useState, useMemo } from "react";

/* ─────────────────────────── STYLES ─────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root{
  --bg:#030c1a; --bg2:#050f22; --s:rgba(255,255,255,.025);
  --b:rgba(255,255,255,.07); --b2:rgba(255,255,255,.12);
  --text:rgba(255,255,255,.88); --muted:rgba(255,255,255,.4); --faint:rgba(255,255,255,.18);
  --teal:#2dd4bf; --td:rgba(20,184,166,.12); --tb:rgba(20,184,166,.25);
  --indigo:#818cf8; --id:rgba(99,102,241,.1); --ib:rgba(99,102,241,.25);
  --amber:#fbbf24; --ad:rgba(245,158,11,.1); --ab:rgba(245,158,11,.22);
  --red:#f87171; --rd:rgba(239,68,68,.08); --rb:rgba(239,68,68,.2);
  --green:#34d399; --gd:rgba(52,211,153,.08); --gb:rgba(52,211,153,.2);
  --violet:#c084fc; --vd:rgba(168,85,247,.1); --vb:rgba(168,85,247,.22);
  --sb-w:200px; --r:13px;
}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:4px;}
.root{display:flex;min-height:100vh;background:var(--bg);font-family:'Outfit',sans-serif;color:var(--text);}

/* ══ SIDEBAR ══ */
.sb{width:var(--sb-w);min-width:var(--sb-w);background:rgba(2,7,18,.98);border-right:1px solid var(--b);display:flex;flex-direction:column;padding:18px 0;position:sticky;top:0;height:100vh;overflow-y:auto;}
.sb-logo{display:flex;align-items:center;gap:9px;padding:0 16px 18px;border-bottom:1px solid var(--b);margin-bottom:16px;}
.sb-icon{width:28px;height:28px;background:linear-gradient(135deg,#0d9488,#0891b2);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.sb-wm{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;letter-spacing:-.3px;}
.sb-wm span{color:var(--teal);}
.sb-tag{font-family:'DM Mono',monospace;font-size:8px;color:var(--faint);letter-spacing:1px;text-transform:uppercase;margin-top:1px;}
.sb-nav{flex:1;display:flex;flex-direction:column;gap:2px;padding:0 8px;}
.sb-btn{display:flex;align-items:center;gap:9px;padding:9px 11px;border-radius:9px;border:none;background:none;color:var(--muted);font-family:'Outfit',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all .15s;width:100%;text-align:left;}
.sb-btn:hover{color:rgba(255,255,255,.78);background:rgba(255,255,255,.05);}
.sb-btn.active{color:var(--teal);background:var(--td);font-weight:600;}
.sb-sep{height:1px;background:var(--b);margin:10px 16px;}
.sb-cta{margin:0 8px 10px;padding:10px 12px;background:linear-gradient(135deg,#0d9488,#0f766e);border:none;border-radius:10px;color:white;font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .2s;}
.sb-cta:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(13,148,136,.28);}
.sb-foot{padding:0 8px;display:flex;flex-direction:column;gap:2px;}

/* ══ MAIN ══ */
.main{flex:1;overflow-y:auto;padding:30px 28px 52px;min-width:0;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}

/* ══ HEADER ══ */
.hdr{margin-bottom:24px;animation:fadeUp .5s ease both;}
.eyebrow{display:inline-flex;align-items:center;gap:6px;background:var(--s);border:1px solid var(--b2);border-radius:6px;padding:4px 11px;margin-bottom:10px;}
.eyebrow-txt{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:1.1px;text-transform:uppercase;color:var(--muted);}
.pg-title{font-family:'Syne',sans-serif;font-size:clamp(18px,2.3vw,26px);font-weight:800;letter-spacing:-.5px;margin-bottom:8px;}
.pg-title em{color:var(--teal);font-style:normal;}
.pg-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.meta-chip{display:inline-flex;align-items:center;gap:6px;background:var(--s);border:1px solid var(--b);border-radius:7px;padding:5px 11px;font-family:'DM Mono',monospace;font-size:11px;color:var(--muted);}
.meta-chip b{color:rgba(255,255,255,.75);font-weight:500;}

/* ══ PROGRESS BANNER ══ */
.progress-banner{
  background:var(--bg2);border:1px solid var(--b);
  border-radius:var(--r);padding:20px 22px;
  margin-bottom:18px;animation:fadeUp .5s .05s ease both;
}
.pb-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px;flex-wrap:wrap;}
.pb-left{}
.pb-headline{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.8px;color:var(--faint);margin-bottom:6px;}
.pb-rank-row{display:flex;align-items:center;gap:10px;}
.pb-rank-from{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:rgba(255,255,255,.35);line-height:1;}
.pb-arrow{color:var(--faint);font-size:18px;}
.pb-rank-to{font-family:'Syne',sans-serif;font-size:36px;font-weight:800;line-height:1;transition:all .4s ease;}
.pb-rank-note{font-family:'DM Mono',monospace;font-size:9px;color:var(--faint);margin-top:3px;}
.pb-stats{display:flex;gap:20px;flex-wrap:wrap;}
.pb-stat{text-align:center;}
.pb-stat-val{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;line-height:1;}
.pb-stat-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);margin-top:2px;}
.pb-bar-wrap{margin-top:0;}
.pb-bar-hdr{display:flex;justify-content:space-between;margin-bottom:6px;}
.pb-bar-lbl{font-family:'DM Mono',monospace;font-size:9px;color:var(--faint);}
.pb-bar-pct{font-family:'DM Mono',monospace;font-size:9px;color:var(--teal);}
.pb-track{height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden;}
.pb-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,#0d9488,#2dd4bf);transition:width .5s ease;}
.disclaimer{font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,.18);margin-top:8px;}

/* ══ SUMMARY CARDS ══ */
.summary-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;animation:fadeUp .5s .08s ease both;}
.sum-card{background:var(--bg2);border:1px solid var(--b);border-radius:11px;padding:14px 16px;}
.sum-card-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.7px;color:var(--faint);margin-bottom:5px;}
.sum-card-val{font-family:'Syne',sans-serif;font-size:24px;font-weight:700;line-height:1;}
.sum-card-sub{font-family:'DM Mono',monospace;font-size:8.5px;margin-top:3px;}

/* ══ FILTER BAR ══ */
.filter-bar{display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap;animation:fadeUp .5s .11s ease both;}
.filter-group{display:flex;gap:5px;flex-wrap:wrap;}
.filter-sep{width:1px;height:20px;background:var(--b);margin:0 4px;flex-shrink:0;}
.fbtn{padding:5px 11px;border-radius:7px;border:1px solid var(--b);background:none;font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);cursor:pointer;transition:all .15s;white-space:nowrap;}
.fbtn:hover{border-color:var(--b2);color:rgba(255,255,255,.7);}
.fbtn.active{font-weight:500;}
.fbtn.status-all.active    {background:rgba(255,255,255,.06);border-color:var(--b2);color:white;}
.fbtn.status-todo.active   {background:var(--rd);border-color:var(--rb);color:var(--red);}
.fbtn.status-progress.active{background:var(--ad);border-color:var(--ab);color:var(--amber);}
.fbtn.status-done.active   {background:var(--gd);border-color:var(--gb);color:var(--green);}
.fbtn.cat.active           {background:var(--id);border-color:var(--ib);color:var(--indigo);}

/* ══ TASK LIST ══ */
.task-list{display:flex;flex-direction:column;gap:8px;animation:fadeUp .5s .14s ease both;}

.task-card{
  display:grid;grid-template-columns:44px 1fr auto;
  gap:0;border-radius:12px;
  border:1px solid var(--b);
  background:var(--s);
  overflow:hidden;transition:all .2s;
}
.task-card:hover{background:rgba(255,255,255,.04);border-color:var(--b2);}
.task-card.done{opacity:.55;}
.task-card.done:hover{opacity:.7;}

/* Priority left accent */
.task-accent{width:44px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:18px;gap:6px;flex-shrink:0;}
.priority-pip{width:6px;height:6px;border-radius:50%;flex-shrink:0;}

/* Status toggle */
.status-btn{
  width:28px;height:28px;border-radius:50%;border:2px solid;
  background:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:all .2s;flex-shrink:0;
}
.status-btn.todo    {border-color:rgba(255,255,255,.2);}
.status-btn.todo:hover{border-color:var(--amber);background:var(--ad);}
.status-btn.progress{border-color:var(--amber);background:var(--ad);}
.status-btn.done    {border-color:var(--green);background:var(--gd);}

/* Task body */
.task-body{padding:15px 14px 15px 0;min-width:0;}
.task-top{display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;}
.task-title{font-family:'Outfit',sans-serif;font-size:13.5px;font-weight:600;color:rgba(255,255,255,.88);line-height:1.35;}
.task-card.done .task-title{text-decoration:line-through;color:var(--muted);}
.task-desc{font-family:'Outfit',sans-serif;font-size:12px;color:var(--muted);line-height:1.55;margin-bottom:8px;}
.task-tags{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.tag{font-family:'DM Mono',monospace;font-size:8.5px;padding:2px 7px;border-radius:4px;border:1px solid;white-space:nowrap;}
.tag-cat-content  {color:rgba(168,85,247,.8);border-color:rgba(168,85,247,.2);background:rgba(168,85,247,.06);}
.tag-cat-metadata {color:rgba(129,140,248,.8);border-color:rgba(129,140,248,.2);background:rgba(129,140,248,.06);}
.tag-cat-technical{color:rgba(45,212,191,.8);border-color:rgba(45,212,191,.2);background:rgba(20,184,166,.06);}
.tag-cat-structure{color:rgba(251,191,36,.8);border-color:rgba(251,191,36,.2);background:rgba(245,158,11,.06);}
.tag-cat-links    {color:rgba(52,211,153,.8);border-color:rgba(52,211,153,.2);background:rgba(52,211,153,.06);}
.tag-effort-easy  {color:rgba(52,211,153,.7);border-color:rgba(52,211,153,.15);background:transparent;}
.tag-effort-medium{color:rgba(251,191,36,.7);border-color:rgba(251,191,36,.15);background:transparent;}
.tag-effort-hard  {color:rgba(248,113,113,.7);border-color:rgba(248,113,113,.15);background:transparent;}

/* Priority badge */
.pri-badge{font-family:'DM Mono',monospace;font-size:8px;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:.3px;font-weight:500;white-space:nowrap;}
.pri-critical{background:var(--rd);color:var(--red);border:1px solid var(--rb);}
.pri-high    {background:var(--ad);color:var(--amber);border:1px solid var(--ab);}
.pri-medium  {background:var(--id);color:var(--indigo);border:1px solid var(--ib);}
.pri-low     {background:rgba(255,255,255,.05);color:var(--muted);border:1px solid var(--b);}

/* Task right- impact */
.task-right{padding:15px 16px 15px 10px;display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;gap:8px;flex-shrink:0;min-width:110px;}
.impact-lbl{font-family:'DM Mono',monospace;font-size:8px;text-transform:uppercase;letter-spacing:.5px;color:var(--faint);}
.impact-val{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;line-height:1;text-align:right;}
.impact-bar-track{width:72px;height:4px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden;}
.impact-bar-fill{height:100%;border-radius:2px;}
.effort-note{font-family:'DM Mono',monospace;font-size:8.5px;color:var(--faint);text-align:right;}

/* Status text */
.status-txt{font-family:'DM Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:.4px;}
.status-txt.todo    {color:rgba(255,255,255,.25);}
.status-txt.progress{color:var(--amber);}
.status-txt.done    {color:var(--green);}

/* Empty state */
.empty{text-align:center;padding:40px 20px;color:var(--muted);font-family:'DM Mono',monospace;font-size:12px;}

/* ══ RESPONSIVE ══ */
@media(max-width:1000px){
  .summary-row{grid-template-columns:repeat(2,1fr);}
  .task-card{grid-template-columns:36px 1fr auto;}
  .task-right{min-width:90px;}
}
@media(max-width:760px){
  :root{--sb-w:0px;}
  .sb{position:fixed;left:0;top:0;width:220px;transform:translateX(-100%);z-index:100;}
  .main{padding:20px 16px 40px;}
  .task-right{display:none;}
  .task-card{grid-template-columns:36px 1fr;}
  .summary-row{grid-template-columns:1fr 1fr;}
}
@media(max-width:480px){
  .summary-row{grid-template-columns:1fr 1fr;}
  .pb-stats{gap:12px;}
  .pb-stat-val{font-size:18px;}
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
  check:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  half:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

/* ─────────────────────────── TASK DATA ─────────────────────────── */
/* All tasks based on real issues found on the Analysis page.
   posGain = estimated position improvement range if completed.
   impactPct = visual bar fill (relative weight) */
const TASKS_INIT = [
  {
    id:1, priority:"critical", category:"Metadata", effort:"Easy", time:"~10 min",
    posGain:{min:5,max:9}, impactPct:95,
    title:"Add your keyword to the meta description",
    desc:"Your meta description doesn't mention 'buy cheap laptops' and is only 78 characters- well below the 120–160 char target. Rewrite it to include the keyword naturally and hit the optimal length.",
    status:"todo",
  },
  {
    id:2, priority:"critical", category:"Metadata", effort:"Easy", time:"~5 min",
    posGain:{min:4,max:7}, impactPct:88,
    title:"Place your keyword in the page title",
    desc:"'Buy Laptops Today | Best Deals' does not contain the target keyword. Rewrite it to something like 'Buy Cheap Laptops- Best Deals & Reviews' and aim for 50–60 characters.",
    status:"todo",
  },
  {
    id:3, priority:"high", category:"Structure", effort:"Easy", time:"~5 min",
    posGain:{min:3,max:6}, impactPct:78,
    title:"Add your keyword to the H1 heading",
    desc:"'Buy Laptops Today' is your only H1 but doesn't include the exact phrase. A small rewrite to 'Buy Cheap Laptops Today' places the keyword in the most prominent on-page signal.",
    status:"todo",
  },
  {
    id:4, priority:"high", category:"Content", effort:"Hard", time:"2–3 hours",
    posGain:{min:4,max:8}, impactPct:82,
    title:"Expand your content to at least 2,000 words",
    desc:"At 1,250 words you are below the competitive threshold for this keyword. The top 10 competitors average 2,900 words. Add depth: buying guides, comparison tables, FAQs, and use-case sections.",
    status:"todo",
  },
  {
    id:5, priority:"high", category:"Technical", effort:"Medium", time:"~1 hour",
    posGain:{min:3,max:5}, impactPct:72,
    title:"Add JSON-LD structured data (Product schema)",
    desc:"No schema markup is detected. Adding Product or Article schema unlocks rich results in Google Search (star ratings, price, availability), which significantly improves click-through rate.",
    status:"todo",
  },
  {
    id:6, priority:"high", category:"Structure", effort:"Easy", time:"~15 min",
    posGain:{min:2,max:4}, impactPct:62,
    title:"Weave your keyword into at least 2 subheadings",
    desc:"0 out of 5 H2 subheadings contain the target keyword. Naturally incorporating the phrase into 2–3 subheadings reinforces topic relevance without keyword stuffing.",
    status:"todo",
  },
  {
    id:7, priority:"medium", category:"Content", effort:"Easy", time:"~15 min",
    posGain:{min:1,max:3}, impactPct:48,
    title:"Add alt text to 4 images that are missing it",
    desc:"4 of your 18 images have no alt attribute. Alt text improves accessibility, passes crawlability checks, and gives you an additional placement opportunity for the target keyword.",
    status:"todo",
  },
  {
    id:8, priority:"medium", category:"Links", effort:"Medium", time:"~30 min",
    posGain:{min:2,max:4}, impactPct:52,
    title:"Build internal links from other pages to this one",
    desc:"Strong pages on your site should link here using anchor text that includes the target keyword. Aim for at least 5 internal links pointing to this page from related articles or category pages.",
    status:"todo",
  },
  {
    id:9, priority:"medium", category:"Metadata", effort:"Easy", time:"~5 min",
    posGain:{min:1,max:2}, impactPct:35,
    title:"Fix the page title length (currently 43 characters)",
    desc:"Your title is 43 chars- Google starts truncating below 50 characters in some viewports. Expanding it to 50–60 chars while including the keyword maximises SERP display space.",
    status:"todo",
  },
  {
    id:10, priority:"medium", category:"Links", effort:"Easy", time:"~20 min",
    posGain:{min:1,max:2}, impactPct:38,
    title:"Add 3–5 relevant external links to authoritative sources",
    desc:"Your page has 12 external links but linking out to high-authority sources (manufacturer sites, review aggregators) signals topical trustworthiness to search engines.",
    status:"todo",
  },
  {
    id:11, priority:"low", category:"Content", effort:"Medium", time:"~45 min",
    posGain:{min:0,max:2}, impactPct:22,
    title:"Improve readability- break up dense text blocks",
    desc:"Readability score is 65/100. Breaking long paragraphs into shorter ones, adding bullet lists, and using subheadings every 300–400 words reduces bounce rate and improves dwell time.",
    status:"todo",
  },
  {
    id:12, priority:"low", category:"Structure", effort:"Easy", time:"~15 min",
    posGain:{min:0,max:1}, impactPct:15,
    title:"Review heading hierarchy for logical flow",
    desc:"You have 12 H3 elements under 5 H2s. Ensure each H3 logically sits under its parent H2 topic. A clean heading tree makes the page easier for crawlers to outline.",
    status:"todo",
  },
];

const STARTING_RANK = 34;
const BEST_RANK = 5;

const PRIORITY_COLORS = {
  critical:"#f87171", high:"#fbbf24", medium:"#818cf8", low:"rgba(255,255,255,.25)",
};

const CAT_CLASSES = {
  Content:"tag-cat-content", Metadata:"tag-cat-metadata",
  Technical:"tag-cat-technical", Structure:"tag-cat-structure", Links:"tag-cat-links",
};

const EFFORT_CLASSES = {
  Easy:"tag-effort-easy", Medium:"tag-effort-medium", Hard:"tag-effort-hard",
};

/* Cycle: todo → progress → done → todo */
function nextStatus(s){ return s==="todo"?"progress":s==="progress"?"done":"todo"; }

export default function RoadmapPage(){
  const [navActive, setNavActive] = useState("ROADMAP");
  const [tasks, setTasks] = useState(TASKS_INIT);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCat, setFilterCat] = useState("all");

  /* Projected rank- decreases as tasks are marked done */
  const projectedRank = useMemo(()=>{
    const totalGain = tasks.reduce((acc,t)=>{
      if(t.status==="done") return acc + (t.posGain.min + t.posGain.max)/2;
      return acc;
    }, 0);
    return Math.max(BEST_RANK, Math.round(STARTING_RANK - totalGain));
  },[tasks]);

  const rankColor = projectedRank<=10?"#34d399":projectedRank<=20?"#2dd4bf":projectedRank<=30?"#fbbf24":"#a5b4fc";

  const doneCount     = tasks.filter(t=>t.status==="done").length;
  const progressCount = tasks.filter(t=>t.status==="progress").length;
  const todoCount     = tasks.filter(t=>t.status==="todo").length;
  const completionPct = Math.round((doneCount/tasks.length)*100);

  /* Total max gain if all tasks done */
  const maxGain = tasks.reduce((a,t)=>a+(t.posGain.min+t.posGain.max)/2,0);

  const toggleStatus = (id) => setTasks(prev=>prev.map(t=>t.id===id?{...t,status:nextStatus(t.status)}:t));

  /* Filtered list */
  const visible = useMemo(()=>tasks.filter(t=>{
    const statusOk = filterStatus==="all"||t.status===filterStatus;
    const catOk    = filterCat==="all"||t.category===filterCat;
    return statusOk && catOk;
  }),[tasks,filterStatus,filterCat]);

  const categories = [...new Set(TASKS_INIT.map(t=>t.category))];

  /* Impact bar color based on priority */
  const impactColor = (pri) => ({
    critical:"linear-gradient(90deg,#ef4444,#f87171)",
    high    :"linear-gradient(90deg,#f59e0b,#fbbf24)",
    medium  :"linear-gradient(90deg,#6366f1,#818cf8)",
    low     :"linear-gradient(90deg,rgba(255,255,255,.15),rgba(255,255,255,.25))",
  }[pri]);

  return(
    <>
      <style dangerouslySetInnerHTML={{__html:css}}/>
      <div className="root">

        {/* ════ SIDEBAR ════ */}
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
              <button key={id} className={`sb-btn${navActive===id?" active":""}`} onClick={()=>setNavActive(id)}>{icon}{lbl}</button>
            ))}
          </nav>
          <div className="sb-sep"/>
          <button className="sb-cta">{I.plus} New Audit</button>
          <div className="sb-foot">
            <button className="sb-btn">{I.help} Help</button>
            <button className="sb-btn">{I.logout} Logout</button>
          </div>
        </aside>

        {/* ════ MAIN ════ */}
        <div className="main">

          {/* Header */}
          <div className="hdr">
            <div className="eyebrow">{I.map}<span className="eyebrow-txt">AI Optimization Roadmap</span></div>
            <h1 className="pg-title">Fix these to rank higher for <em>'buy cheap laptops'</em></h1>
            <div className="pg-meta">
              <div className="meta-chip">{I.search}<span>Page: <b>example.com/laptops</b></span></div>
              <div className="meta-chip"><span>Current rank: <b>#34</b></span></div>
              <div className="meta-chip"><span>{tasks.length} total fixes · click a task to update its status</span></div>
            </div>
          </div>

          {/* ══ PROGRESS BANNER ══ */}
          <div className="progress-banner">
            <div className="pb-top">
              <div className="pb-left">
                <div className="pb-headline">Projected rank after completing all tasks</div>
                <div className="pb-rank-row">
                  <div className="pb-rank-from" style={{fontFamily:"'Syne',sans-serif"}}>#{STARTING_RANK}</div>
                  <div className="pb-arrow">→</div>
                  <div className="pb-rank-to" style={{color:rankColor,fontFamily:"'Syne',sans-serif"}}>#{projectedRank}</div>
                </div>
                <div className="pb-rank-note">
                  {projectedRank===STARTING_RANK
                    ? "Complete tasks to improve your projected rank"
                    : `+${STARTING_RANK-projectedRank} position improvement so far`}
                </div>
              </div>
              <div className="pb-stats">
                <div className="pb-stat">
                  <div className="pb-stat-val" style={{color:"rgba(248,113,113,.85)",fontFamily:"'Syne',sans-serif"}}>{todoCount}</div>
                  <div className="pb-stat-lbl">To Do</div>
                </div>
                <div className="pb-stat">
                  <div className="pb-stat-val" style={{color:"var(--amber)",fontFamily:"'Syne',sans-serif"}}>{progressCount}</div>
                  <div className="pb-stat-lbl">In Progress</div>
                </div>
                <div className="pb-stat">
                  <div className="pb-stat-val" style={{color:"var(--green)",fontFamily:"'Syne',sans-serif"}}>{doneCount}</div>
                  <div className="pb-stat-lbl">Done</div>
                </div>
                <div className="pb-stat">
                  <div className="pb-stat-val" style={{color:"var(--teal)",fontFamily:"'Syne',sans-serif"}}>{completionPct}%</div>
                  <div className="pb-stat-lbl">Complete</div>
                </div>
              </div>
            </div>
            <div className="pb-bar-wrap">
              <div className="pb-bar-hdr">
                <span className="pb-bar-lbl">{doneCount} of {tasks.length} tasks completed</span>
                <span className="pb-bar-pct">{completionPct}%</span>
              </div>
              <div className="pb-track">
                <div className="pb-fill" style={{width:`${completionPct}%`}}/>
              </div>
            </div>
            <div className="disclaimer">
              * Rank estimates are projections based on competitive analysis- actual results depend on Google's algorithm and your competitors' activity.
            </div>
          </div>

          {/* ══ SUMMARY CARDS ══ */}
          <div className="summary-row">
            <div className="sum-card" style={{borderColor:"var(--rb)",background:"var(--rd)"}}>
              <div className="sum-card-lbl">Critical fixes</div>
              <div className="sum-card-val" style={{color:"var(--red)",fontFamily:"'Syne',sans-serif"}}>
                {tasks.filter(t=>t.priority==="critical").length}
              </div>
              <div className="sum-card-sub" style={{color:"rgba(248,113,113,.5)"}}>Highest ranking impact</div>
            </div>
            <div className="sum-card" style={{borderColor:"var(--ab)",background:"var(--ad)"}}>
              <div className="sum-card-lbl">High priority</div>
              <div className="sum-card-val" style={{color:"var(--amber)",fontFamily:"'Syne',sans-serif"}}>
                {tasks.filter(t=>t.priority==="high").length}
              </div>
              <div className="sum-card-sub" style={{color:"rgba(251,191,36,.5)"}}>Strong improvement potential</div>
            </div>
            <div className="sum-card" style={{borderColor:"var(--gb)",background:"var(--gd)"}}>
              <div className="sum-card-lbl">Quick wins</div>
              <div className="sum-card-val" style={{color:"var(--green)",fontFamily:"'Syne',sans-serif"}}>
                {tasks.filter(t=>t.effort==="Easy"&&(t.priority==="critical"||t.priority==="high")).length}
              </div>
              <div className="sum-card-sub" style={{color:"rgba(52,211,153,.5)"}}>High impact, easy effort</div>
            </div>
            <div className="sum-card" style={{borderColor:"var(--tb)",background:"var(--td)"}}>
              <div className="sum-card-lbl">Max rank gain</div>
              <div className="sum-card-val" style={{color:"var(--teal)",fontFamily:"'Syne',sans-serif"}}>+{Math.round(maxGain)}</div>
              <div className="sum-card-sub" style={{color:"rgba(45,212,191,.5)"}}>Positions if all tasks done</div>
            </div>
          </div>

          {/* ══ FILTER BAR ══ */}
          <div className="filter-bar">
            <div className="filter-group">
              {[["all","All"],["todo","To Do"],["progress","In Progress"],["done","Done"]].map(([v,l])=>(
                <button key={v} className={`fbtn status-${v}${filterStatus===v?" active":""}`} onClick={()=>setFilterStatus(v)}>{l}</button>
              ))}
            </div>
            <div className="filter-sep"/>
            <div className="filter-group">
              <button className={`fbtn cat${filterCat==="all"?" active":""}`} onClick={()=>setFilterCat("all")}>All Categories</button>
              {categories.map(c=>(
                <button key={c} className={`fbtn cat${filterCat===c?" active":""}`} onClick={()=>setFilterCat(c)}>{c}</button>
              ))}
            </div>
          </div>

          {/* ══ TASK LIST ══ */}
          <div className="task-list">
            {visible.length===0
              ? <div className="empty">No tasks match your current filters.</div>
              : visible.map((task,idx)=>{
                const isDone = task.status==="done";
                const isProgress = task.status==="progress";
                return(
                  <div key={task.id} className={`task-card${isDone?" done":""}`}
                       style={{animationDelay:`${idx*0.04}s`}}>

                    {/* Left accent + rank + status toggle */}
                    <div className="task-accent">
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:"10px",color:"var(--faint)",fontWeight:500}}>#{task.id}</div>
                      <button
                        className={`status-btn ${task.status}`}
                        onClick={()=>toggleStatus(task.id)}
                        title={`Status: ${task.status}- click to advance`}
                      >
                        {isDone
                          ? <span style={{color:"var(--green)"}}>{I.check}</span>
                          : isProgress
                          ? <span style={{color:"var(--amber)"}}>{I.half}</span>
                          : null}
                      </button>
                      <div className="priority-pip" style={{background:PRIORITY_COLORS[task.priority]}}/>
                    </div>

                    {/* Body */}
                    <div className="task-body">
                      <div className="task-top">
                        <span className={`pri-badge pri-${task.priority}`}>{task.priority}</span>
                        <span className={`status-txt ${task.status}`}>
                          {task.status==="todo"?"To Do":task.status==="progress"?"In Progress":"Done ✓"}
                        </span>
                      </div>
                      <div className="task-title">{task.title}</div>
                      <div className="task-desc">{task.desc}</div>
                      <div className="task-tags">
                        <span className={`tag ${CAT_CLASSES[task.category]}`}>{task.category}</span>
                        <span className={`tag ${EFFORT_CLASSES[task.effort]}`}>{task.effort}</span>
                        <span className="tag" style={{color:"var(--faint)",borderColor:"var(--b)",background:"transparent"}}>{task.time}</span>
                      </div>
                    </div>

                    {/* Right- impact */}
                    <div className="task-right">
                      <div>
                        <div className="impact-lbl">Est. rank gain</div>
                        <div className="impact-val" style={{color:PRIORITY_COLORS[task.priority],fontFamily:"'Syne',sans-serif"}}>
                          {task.posGain.min===0&&task.posGain.max===0
                            ? "—"
                            : task.posGain.min===task.posGain.max
                            ? `+${task.posGain.max}`
                            : `+${task.posGain.min}–${task.posGain.max}`}
                        </div>
                        <div className="impact-lbl" style={{marginTop:"1px"}}>positions</div>
                      </div>
                      <div>
                        <div className="impact-bar-track">
                          <div className="impact-bar-fill" style={{width:`${isDone?100:task.impactPct}%`,background:isDone?"linear-gradient(90deg,#10b981,#34d399)":impactColor(task.priority)}}/>
                        </div>
                        <div className="effort-note" style={{marginTop:"4px"}}>{task.effort} effort</div>
                      </div>
                    </div>

                  </div>
                );
              })
            }
          </div>

        </div>
      </div>
    </>
  );
}
