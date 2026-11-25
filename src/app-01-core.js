/* ============================================================
   1. Data and core helpers
   ============================================================ */
const GAMES = __GAMES_JSON__;
const SOURCES = __SOURCES_JSON__;
const AWARDS = __AWARDS_JSON__;
const EDGES = __EDGES_JSON__;
const BUILD_META = __BUILD_META_JSON__;

const GAME_BY_ID = new Map(GAMES.map(g => [g.id, g]));
const SOURCE_BY_ID = new Map(SOURCES.map(s => [s.id, s]));

const TIER_LABELS = {
  0: "Tier 0 · 無公開可比數據",
  1: "Tier 1 · <1M / <50k CCU",
  2: "Tier 2 · 1–4.9M / 50–199k CCU",
  3: "Tier 3 · 5–19.9M / 200–499k CCU",
  4: "Tier 4 · 20–99.9M / ≥500k CCU",
  5: "Tier 5 · ≥100M active / ≥300M copies"
};

const STATUS_MAP = {
  "verified-primary": { label: "官方／主要", cls: "primary" },
  "verified-primary-landing": { label: "官方／主要", cls: "primary" },
  "verified-secondary": { label: "二手核對", cls: "secondary" },
  "used-as-context-only": { label: "背景", cls: "context" },
  "supplement-only": { label: "補充", cls: "supplement" },
  "methodology-only": { label: "方法論", cls: "method" },
  "blocked-403": { label: "403 受限", cls: "blocked" },
  "blocked-and-disallowed": { label: "禁止爬取", cls: "blocked" }
};

const EVIDENCE_LABEL = { A: "A · 官方", B: "B · 二手核對", C: "C · 第三方估算", D: "D · 無可比數據" };
const DEFAULT_WEIGHTS = { award: 35, reach: 25, commercial: 20, longevity: 20 };

const state = {
  compare: [],
  gameQuery: "",
  genre: "all",
  platform: "all",
  sort: "award-desc",
  awardOnly: false,
  liveOnly: false,
  sourceQuery: "",
  sourceStatus: "all",
  graphType: "all",
  graphQuery: "",
  graphSelected: null,
  weights: { ...DEFAULT_WEIGHTS },
  lastFocus: null
};

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function round(n) { return Math.round(n); }
function pct(n, max = 110) { return clamp((n / max) * 100, 0, 100); }
function fmt(n) { return new Intl.NumberFormat("zh-Hant").format(n); }
function fmtOne(n) { return new Intl.NumberFormat("zh-Hant", { maximumFractionDigits: 1 }).format(n); }
function fmtMoneyB(n) { return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(n)}B`; }
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}
function tierClass(t) { return `tier-${t}`; }
function tierShort(t) { return t === 0 ? "Tier 0" : `Tier ${t}`; }
function sourceChip(id) {
  return `<a class="source-chip" href="#source-${escapeHTML(id)}" data-source="${escapeHTML(id)}" title="跳到來源 ${escapeHTML(id)}">${escapeHTML(id)}</a>`;
}
function sourceLinks(ids) { return (ids || []).map(sourceChip).join(" "); }
function statusInfo(status) {
  return STATUS_MAP[status] || { label: status || "N/A", cls: "method" };
}
function evidenceChip(grade) {
  const cls = grade === "A" ? "accent" : grade === "B" ? "blue" : grade === "C" ? "amber" : "pink";
  return `<span class="chip ${cls}">${escapeHTML(EVIDENCE_LABEL[grade] || grade)}</span>`;
}
function postLaunchLabel(v) {
  return v === "strong" ? "強" : v === "moderate" ? "中" : v === "none" ? "無" : "N/A";
}
function marketValueText(g) {
  if (g.marketValue == null) return "N/A";
  if (g.marketUnit === "CCU") return `${fmt(g.marketValue)} CCU`;
  if (g.marketUnit === "M DAU") return `${fmt(g.marketValue)}M DAU`;
  if (g.marketUnit === "M copies") return `${fmtOne(g.marketValue)}M copies`;
  if (g.marketUnit === "M registered") return `${fmt(g.marketValue)}M registered`;
  return `${fmt(g.marketValue)} ${g.marketUnit || ""}`.trim();
}
function commercialBasis(g) {
  if (g.salesCopies != null) return "累計銷量";
  if (g.bookingsB != null) return "平台 bookings";
  if (g.revenueB != null) return "平台 revenue";
  return null;
}
function awardScore(g) { return clamp((g.awardIndex / 110) * 100, 0, 100); }
function reachScore(g) { return g.marketTier > 0 ? g.marketTier * 20 : null; }
function commercialScore(g) {
  if (g.salesCopies != null) return clamp((Math.log10(g.salesCopies) / Math.log10(300)) * 100, 0, 100);
  if (g.bookingsB != null) return clamp((Math.log10(g.bookingsB) / Math.log10(10)) * 100, 0, 100);
  if (g.revenueB != null) return clamp((Math.log10(g.revenueB) / Math.log10(10)) * 100, 0, 100);
  return null;
}
function longevityScore(g) {
  const base = Math.min(1, Math.max(0, g.longevityYears) / 20) * 70;
  const support = g.postLaunchSupport === "strong" ? 30 : g.postLaunchSupport === "moderate" ? 15 : 0;
  return clamp(base + support, 0, 100);
}
function dimensions(g) {
  return {
    award: awardScore(g),
    reach: reachScore(g),
    commercial: commercialScore(g),
    longevity: longevityScore(g)
  };
}
function weightedScore(g, weights = state.weights) {
  const dims = dimensions(g);
  const keys = ["award", "reach", "commercial", "longevity"];
  let total = 0, wsum = 0;
  const used = [];
  const effective = {};
  for (const key of keys) {
    const w = Number(weights[key]) || 0;
    if (w > 0 && dims[key] != null) {
      total += w * dims[key];
      wsum += w;
      used.push(key);
      effective[key] = w;
    }
  }
  return {
    game: g,
    dims,
    score: wsum > 0 ? total / wsum : 0,
    coverage: used.length,
    used,
    effective,
    wsum
  };
}
function sortedSim(weights = state.weights) {
  return GAMES.map(g => weightedScore(g, weights)).sort((a, b) => b.score - a.score || a.game.zh.localeCompare(b.game.zh, "zh-Hant"));
}
function debounce(fn, wait = 120) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
function toast(message) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => el.classList.remove("show"), 2600);
}
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function make(tag, attrs = {}, html = "") {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  if (html) el.innerHTML = html;
  return el;
}
