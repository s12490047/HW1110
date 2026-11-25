/* ============================================================
   6. Wiring and initialization
   ============================================================ */
function hideSearchResults() {
  const box = document.getElementById("searchResults");
  const input = document.getElementById("globalSearch");
  if (box) { box.hidden = true; box.innerHTML = ""; }
  if (input) input.setAttribute("aria-expanded", "false");
}

function globalSearchResults(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out = [];
  GAMES.forEach(g => {
    const hay = [g.zh, g.name, g.genre, g.developer, g.publisher, g.tags.join(" "), g.summary].join(" ").toLowerCase();
    if (hay.includes(q)) out.push({ type: "遊戲", title: `${g.zh} · ${g.name}`, sub: `${g.year} · ${g.genre} · Award ${g.awardIndex} · Tier ${g.marketTier}`, action: () => openGame(g.id) });
  });
  SOURCES.forEach(s => {
    const hay = [s.id, s.title, s.publisher, s.usedFor, s.limitations].join(" ").toLowerCase();
    if (hay.includes(q)) out.push({ type: "來源", title: `${s.id} · ${s.title}`, sub: `${s.publisher} · ${s.published}`, action: () => scrollToSource(s.id) });
  });
  AWARDS.forEach(a => {
    const hay = [a.year, a.goty, a.event, a.note].join(" ").toLowerCase();
    if (hay.includes(q)) out.push({ type: "獎項", title: `TGA ${a.year} · ${a.goty}`, sub: `GOTY · ${a.date}`, action: () => { document.getElementById("ch3").scrollIntoView({ behavior: "smooth" }); toast(`TGA ${a.year} GOTY：${a.goty}`); } });
  });
  return out.slice(0, 12);
}

function renderGlobalSearch(query) {
  const box = document.getElementById("searchResults");
  const input = document.getElementById("globalSearch");
  if (!box || !input) return;
  if (!query.trim()) { hideSearchResults(); return; }
  const results = globalSearchResults(query);
  input.setAttribute("aria-expanded", "true");
  box.hidden = false;
  if (!results.length) {
    box.innerHTML = `<div class="search-empty">找不到「${escapeHTML(query)}」。試試遊戲名稱、類型、來源 ID（S01）或 TGA 年份。</div>`;
    return;
  }
  box.innerHTML = results.map((r, i) => `<button class="search-result" type="button" role="option" data-result="${i}">
    <span class="sr-type">${escapeHTML(r.type)}</span>
    <span class="sr-main"><span class="sr-title">${escapeHTML(r.title)}</span><span class="sr-sub">${escapeHTML(r.sub)}</span></span>
  </button>`).join("");
  box.querySelectorAll(".search-result").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      hideSearchResults();
      results[i].action();
    });
  });
}

function initGlobalSearch() {
  const input = document.getElementById("globalSearch");
  const box = document.getElementById("searchResults");
  if (!input || !box) return;
  const update = debounce(() => renderGlobalSearch(input.value), 90);
  input.addEventListener("input", update);
  input.addEventListener("focus", () => { if (input.value.trim()) renderGlobalSearch(input.value); });
  input.addEventListener("keydown", ev => {
    if (ev.key === "Escape") { hideSearchResults(); input.blur(); }
    if (ev.key === "ArrowDown") {
      const first = box.querySelector(".search-result");
      if (first) { ev.preventDefault(); first.focus(); }
    }
  });
  box.addEventListener("keydown", ev => {
    const buttons = [...box.querySelectorAll(".search-result")];
    const idx = buttons.indexOf(document.activeElement);
    if (ev.key === "ArrowDown" && idx >= 0) { ev.preventDefault(); buttons[Math.min(buttons.length - 1, idx + 1)]?.focus(); }
    if (ev.key === "ArrowUp" && idx >= 0) { ev.preventDefault(); (buttons[idx - 1] || input).focus(); }
    if (ev.key === "Escape") { hideSearchResults(); input.focus(); }
  });
  document.addEventListener("click", ev => {
    if (!ev.target.closest(".search-wrap") && !ev.target.closest("#searchResults")) hideSearchResults();
  });
  document.addEventListener("keydown", ev => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") {
      ev.preventDefault();
      input.focus();
      input.select();
    }
  });
}

function initNav() {
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
  }
  sidebar?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    menuBtn?.setAttribute("aria-expanded", "false");
  }));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
      document.body.classList.remove("nav-open");
      menuBtn?.setAttribute("aria-expanded", "false");
    }
  });
  const links = [...document.querySelectorAll(".chapter-nav a[data-chapter]")];
  const sections = links.map(a => document.getElementById(a.dataset.chapter)).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(a => a.classList.toggle("active", a.dataset.chapter === entry.target.id));
      });
    }, { rootMargin: "-40% 0px -52% 0px", threshold: 0 });
    sections.forEach(s => observer.observe(s));
  }
}

function initGameControls() {
  const search = document.getElementById("gameSearch");
  const genre = document.getElementById("genreFilter");
  const platform = document.getElementById("platformFilter");
  const sort = document.getElementById("sortSelect");
  const awardOnly = document.getElementById("awardOnly");
  const liveOnly = document.getElementById("liveOnly");
  const reset = document.getElementById("resetFilters");
  const refresh = () => { renderGameGrid(); renderGameTable(); };
  const updateSearch = debounce(() => { state.gameQuery = search.value; refresh(); }, 90);
  search?.addEventListener("input", updateSearch);
  genre?.addEventListener("change", () => { state.genre = genre.value; refresh(); });
  platform?.addEventListener("change", () => { state.platform = platform.value; refresh(); });
  sort?.addEventListener("change", () => { state.sort = sort.value; refresh(); });
  awardOnly?.addEventListener("change", () => { state.awardOnly = awardOnly.checked; refresh(); });
  liveOnly?.addEventListener("change", () => { state.liveOnly = liveOnly.checked; refresh(); });
  reset?.addEventListener("click", () => {
    state.gameQuery = ""; state.genre = "all"; state.platform = "all"; state.sort = "award-desc"; state.awardOnly = false; state.liveOnly = false;
    if (search) search.value = "";
    if (genre) genre.value = "all";
    if (platform) platform.value = "all";
    if (sort) sort.value = "award-desc";
    if (awardOnly) awardOnly.checked = false;
    if (liveOnly) liveOnly.checked = false;
    refresh();
  });
}

function initSourceControls() {
  const search = document.getElementById("sourceSearch");
  const status = document.getElementById("sourceStatus");
  const reset = document.getElementById("sourceReset");
  const update = debounce(() => { state.sourceQuery = search.value; renderSources(); }, 90);
  search?.addEventListener("input", update);
  status?.addEventListener("change", () => { state.sourceStatus = status.value; renderSources(); });
  reset?.addEventListener("click", () => {
    state.sourceQuery = ""; state.sourceStatus = "all";
    if (search) search.value = "";
    if (status) status.value = "all";
    renderSources();
  });
}

function initGraphControls() {
  const type = document.getElementById("graphType");
  const search = document.getElementById("graphSearch");
  const reset = document.getElementById("graphReset");
  type?.addEventListener("change", () => { state.graphType = type.value; applyGraphFilter(); });
  const update = debounce(() => { state.graphQuery = search.value; applyGraphFilter(); }, 90);
  search?.addEventListener("input", update);
  reset?.addEventListener("click", () => {
    state.graphType = "all"; state.graphQuery = "";
    if (type) type.value = "all";
    if (search) search.value = "";
    applyGraphFilter();
    selectGraphNode("center");
  });
}

function initSimControls() {
  const map = [["wAward", "award"], ["wReach", "reach"], ["wCommercial", "commercial"], ["wLongevity", "longevity"]];
  map.forEach(([id, key]) => {
    const input = document.getElementById(id);
    input?.addEventListener("input", () => {
      state.weights[key] = Number(input.value);
      renderSimulator();
    });
  });
  document.querySelectorAll("[data-preset]").forEach(btn => {
    btn.addEventListener("click", () => applyPreset(btn.dataset.preset));
  });
}

function initQuizControls() {
  document.getElementById("quizSubmit")?.addEventListener("click", checkQuiz);
  document.getElementById("quizReset")?.addEventListener("click", resetQuiz);
}

function initModalControls() {
  const modal = document.getElementById("modal");
  if (!modal) return;
  modal.addEventListener("click", ev => {
    if (ev.target.closest("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", ev => {
    if (ev.key === "Escape") {
      if (!modal.hidden) closeModal();
      else if (document.body.classList.contains("nav-open")) {
        document.body.classList.remove("nav-open");
        document.getElementById("menuBtn")?.setAttribute("aria-expanded", "false");
      }
    }
    if (ev.key === "Tab" && !modal.hidden) {
      const focusables = [...modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled && el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    }
  });
}

function initDelegatedActions() {
  document.addEventListener("click", ev => {
    const open = ev.target.closest("[data-open]");
    if (open) { ev.preventDefault(); openGame(open.dataset.open); return; }
    const source = ev.target.closest("[data-source]");
    if (source) { ev.preventDefault(); scrollToSource(source.dataset.source); return; }
    const close = ev.target.closest("[data-close]");
    if (close) { ev.preventDefault(); closeModal(); return; }
    const remove = ev.target.closest("[data-remove]");
    if (remove) { ev.preventDefault(); toggleCompare(remove.dataset.remove, false); return; }
    const compareModal = ev.target.closest("[data-compare-modal]");
    if (compareModal) {
      ev.preventDefault();
      const id = compareModal.dataset.compareModal;
      const willAdd = !state.compare.includes(id);
      toggleCompare(id, willAdd);
      closeModal();
      document.getElementById("comparatorSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
      toast(willAdd ? "已加入比較" : "已移出比較");
      return;
    }
    const graphNode = ev.target.closest("[data-graph-node]");
    if (graphNode) { ev.preventDefault(); selectGraphNode(graphNode.dataset.graphNode); }
  });
  document.addEventListener("change", ev => {
    if (ev.target.matches("[data-compare]")) toggleCompare(ev.target.dataset.compare, ev.target.checked);
  });
}

function initPrint() {
  document.getElementById("printBtn")?.addEventListener("click", () => window.print());
}

function initScrollProgress() {
  const bar = document.createElement("div");
  bar.setAttribute("aria-hidden", "true");
  bar.style.cssText = "position:fixed;left:0;top:0;height:2px;width:0;z-index:100;background:linear-gradient(90deg,#5eead4,#60a5fa);transition:width .08s linear;pointer-events:none";
  document.body.appendChild(bar);
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    bar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

function init() {
  renderBuildMeta();
  populateFilters();
  renderSources();
  renderTgaTimeline();
  renderAwardChart();
  renderTierChart();
  renderMarketTable();
  renderAllGameViews();
  renderAnalysisCharts();
  renderGraph();
  renderSimulator();
  renderQuiz();
  renderSourceTable();
  initGlobalSearch();
  initNav();
  initGameControls();
  initSourceControls();
  initGraphControls();
  initSimControls();
  initQuizControls();
  initModalControls();
  initDelegatedActions();
  initPrint();
  initScrollProgress();
  if (window.innerWidth > 980) {
    const first = document.querySelector('.chapter-nav a[data-chapter="ch1"]');
    if (first) first.classList.add("active");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
