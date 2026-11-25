/* ============================================================
   3. Game database, comparator, modal, analysis charts
   ============================================================ */
function populateFilters() {
  const genreSelect = document.getElementById("genreFilter");
  const platformSelect = document.getElementById("platformFilter");
  if (genreSelect && genreSelect.options.length === 1) {
    [...new Set(GAMES.map(g => g.genre))].sort((a, b) => a.localeCompare(b, "zh-Hant")).forEach(genre => {
      genreSelect.add(new Option(genre, genre));
    });
  }
  if (platformSelect && platformSelect.options.length === 1) {
    [...new Set(GAMES.flatMap(g => g.platforms))].sort().forEach(platform => {
      platformSelect.add(new Option(platform, platform));
    });
  }
}

function filteredGames() {
  const q = state.gameQuery.trim().toLowerCase();
  let list = GAMES.filter(g => {
    if (q) {
      const hay = [g.zh, g.name, g.genre, g.developer, g.publisher, g.summary, g.caveat, g.tags.join(" ")].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (state.genre !== "all" && g.genre !== state.genre) return false;
    if (state.platform !== "all" && !g.platforms.includes(state.platform)) return false;
    if (state.awardOnly && g.awardIndex <= 0) return false;
    if (state.liveOnly && !g.liveService) return false;
    return true;
  });
  switch (state.sort) {
    case "tier-desc":
      list.sort((a, b) => b.marketTier - a.marketTier || b.awardIndex - a.awardIndex);
      break;
    case "year-desc":
      list.sort((a, b) => b.year - a.year || b.awardIndex - a.awardIndex);
      break;
    case "longevity-desc":
      list.sort((a, b) => b.longevityYears - a.longevityYears || b.awardIndex - a.awardIndex);
      break;
    case "name-asc":
      list.sort((a, b) => a.zh.localeCompare(b.zh, "zh-Hant"));
      break;
    default:
      list.sort((a, b) => b.awardIndex - a.awardIndex || b.marketTier - a.marketTier);
  }
  return list;
}

function gameCardHTML(g) {
  const checked = state.compare.includes(g.id) ? "checked" : "";
  return `<article class="game-card" id="game-card-${escapeHTML(g.id)}" data-id="${escapeHTML(g.id)}">
    <div class="top">
      <div>
        <h3>${escapeHTML(g.zh)}<span>${escapeHTML(g.name)}</span></h3>
        <div class="meta">${g.year} · ${escapeHTML(g.genre)} · ${escapeHTML(g.platforms.join(" / "))}</div>
      </div>
      <span class="tier-badge ${tierClass(g.marketTier)}">${tierShort(g.marketTier)}</span>
    </div>
    <p>${escapeHTML(g.summary)}</p>
    <div class="award-mini"><strong>${g.awardIndex}</strong><div class="meter"><i style="width:${pct(g.awardIndex, 110)}%"></i></div><span>/110</span></div>
    <div class="tag-row">${g.tags.slice(0, 4).map(t => `<span class="chip">${escapeHTML(t)}</span>`).join("")}</div>
    <div class="actions">
      <button class="btn btn-small" type="button" data-open="${escapeHTML(g.id)}">詳情</button>
      <label class="compare"><input type="checkbox" data-compare="${escapeHTML(g.id)}" ${checked}> 比較</label>
    </div>
  </article>`;
}

function renderGameGrid() {
  const el = document.getElementById("gameGrid");
  if (!el) return;
  const list = filteredGames();
  setText("gameCount", `顯示 ${list.length} / ${GAMES.length} 款 · 比較 ${state.compare.length} / 3`);
  if (!list.length) {
    el.innerHTML = `<div class="empty" style="grid-column:1/-1">沒有符合條件的案例。試試重設篩選，或改用「MOBA」「MMORPG」等關鍵字。</div>`;
    return;
  }
  el.innerHTML = list.map(gameCardHTML).join("");
}

function renderGameTable() {
  const el = document.getElementById("gameTable");
  if (!el) return;
  const list = filteredGames();
  const rows = list.map(g => `<tr>
    <td><button type="button" data-open="${escapeHTML(g.id)}" style="background:none;border:0;color:var(--accent);padding:0;font:inherit;cursor:pointer;text-align:left">${escapeHTML(g.zh)}</button><div class="faint tiny">${escapeHTML(g.name)}</div></td>
    <td class="num">${g.year}</td>
    <td>${escapeHTML(g.genre)}</td>
    <td class="num">${g.awardIndex}</td>
    <td><span class="tier-badge ${tierClass(g.marketTier)}">${tierShort(g.marketTier)}</span></td>
    <td class="num">${escapeHTML(marketValueText(g))}</td>
    <td class="num">${g.longevityYears}</td>
    <td>${g.liveService ? "是" : "否"}</td>
    <td>${evidenceChip(g.evidenceGrade)}</td>
    <td>${sourceLinks(g.sources)}</td>
  </tr>`).join("");
  el.innerHTML = `<table><caption>與上方篩選同步；表格適合快速掃描與列印。</caption><thead><tr><th>遊戲</th><th class="num">年</th><th>類型</th><th class="num">Award</th><th>Tier</th><th class="num">市場值</th><th class="num">壽命</th><th>服務型</th><th>證據</th><th>來源</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function compareValue(g, key) {
  switch (key) {
    case "award": return `${g.awardIndex} / 110`;
    case "tier": return `${tierShort(g.marketTier)} · ${TIER_LABELS[g.marketTier]}`;
    case "market": return `${marketValueText(g)}（${g.marketAsOf}）`;
    case "sales": return g.salesCopies != null ? `${fmtOne(g.salesCopies)}M copies` : "N/A";
    case "registered": return g.registeredPlayers != null ? `${fmt(g.registeredPlayers)}M registered` : "N/A";
    case "dau": return g.dau != null ? `${fmt(g.dau)}M DAU` : "N/A";
    case "ccu": return g.ccu != null ? `${fmt(g.ccu)} CCU` : "N/A";
    case "commercial": return g.bookingsB != null ? `bookings ${fmtMoneyB(g.bookingsB)} / revenue ${fmtMoneyB(g.revenueB)}` : (g.revenueB != null ? `revenue ${fmtMoneyB(g.revenueB)}` : "N/A");
    case "longevity": return `${g.longevityYears} 年 · 支援 ${postLaunchLabel(g.postLaunchSupport)}`;
    case "live": return g.liveService ? "是" : "否";
    case "evidence": return EVIDENCE_LABEL[g.evidenceGrade] || g.evidenceGrade;
    case "sources": return g.sources.join("、");
    default: return "";
  }
}

function renderComparator() {
  const el = document.getElementById("comparator");
  const count = document.getElementById("comparatorCount");
  if (!el) return;
  if (count) count.textContent = `${state.compare.length} / 3`;
  const games = state.compare.map(id => GAME_BY_ID.get(id)).filter(Boolean);
  if (!games.length) {
    el.innerHTML = `<div class="compare-empty">尚未選擇。從上方卡片勾選 2–3 款，這裡會並排顯示獎項、市場口徑、商業數據與四個維度。</div>`;
    return;
  }
  const rows = [
    ["原名", g => escapeHTML(g.name)],
    ["年份／類型", g => `${g.year} · ${escapeHTML(g.genre)}`],
    ["平台", g => escapeHTML(g.platforms.join(" / "))],
    ["Award Index", g => compareValue(g, "award")],
    ["Market Tier", g => compareValue(g, "tier")],
    ["市場指標", g => escapeHTML(g.marketMetric)],
    ["市場值", g => compareValue(g, "market")],
    ["銷量", g => compareValue(g, "sales")],
    ["註冊", g => compareValue(g, "registered")],
    ["DAU", g => compareValue(g, "dau")],
    ["CCU", g => compareValue(g, "ccu")],
    ["商業數據", g => compareValue(g, "commercial")],
    ["長線", g => compareValue(g, "longevity")],
    ["服務型", g => compareValue(g, "live")],
    ["證據", g => compareValue(g, "evidence")],
    ["Critical／Award", g => `${round(awardScore(g))} / 100`],
    ["Player Reach", g => reachScore(g) == null ? "N/A" : `${round(reachScore(g))} / 100`],
    ["Commercial", g => commercialScore(g) == null ? "N/A" : `${round(commercialScore(g))} / 100`],
    ["Long-term", g => `${round(longevityScore(g))} / 100`],
    ["來源", g => sourceLinks(g.sources)]
  ];
  el.innerHTML = `<div class="table-wrap"><table class="compare-table">
    <thead><tr><th>欄位</th>${games.map(g => `<th>${escapeHTML(g.zh)}<div class="faint tiny">${escapeHTML(g.name)}</div><button class="btn btn-small" type="button" data-remove="${escapeHTML(g.id)}" style="margin-top:.3rem">移除</button></th>`).join("")}</tr></thead>
    <tbody>${rows.map(([label, fn]) => `<tr><td>${label}</td>${games.map(g => `<td>${fn(g)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div>`;
}

function toggleCompare(id, checked) {
  if (!GAME_BY_ID.has(id)) return;
  if (checked) {
    if (state.compare.includes(id)) return;
    if (state.compare.length >= 3) {
      toast("最多比較 3 款；先移除一款。");
      const box = document.querySelector(`[data-compare="${id}"]`);
      if (box) box.checked = false;
      return;
    }
    state.compare.push(id);
  } else {
    state.compare = state.compare.filter(x => x !== id);
  }
  renderComparator();
  syncCompareCheckboxes();
}

function syncCompareCheckboxes() {
  document.querySelectorAll("[data-compare]").forEach(box => {
    box.checked = state.compare.includes(box.dataset.compare);
  });
  const count = document.getElementById("gameCount");
  if (count) count.textContent = `顯示 ${filteredGames().length} / ${GAMES.length} 款 · 比較 ${state.compare.length} / 3`;
}

function dimensionBlock(label, value, note) {
  const v = value == null ? "N/A" : round(value);
  const w = value == null ? 0 : value;
  return `<div class="dim"><div class="k">${escapeHTML(label)}</div><div class="v">${v}${value == null ? "" : " / 100"}</div><div class="meter"><i style="width:${w}%"></i></div>${note ? `<div class="faint tiny" style="margin-top:.25rem">${escapeHTML(note)}</div>` : ""}</div>`;
}

function openGame(id) {
  const g = GAME_BY_ID.get(id);
  if (!g) return;
  state.lastFocus = document.activeElement;
  const modal = document.getElementById("modal");
  const body = document.getElementById("modalBody");
  if (!modal || !body) return;
  const dims = dimensions(g);
  const awardRows = g.awardBreakdown.length
    ? g.awardBreakdown.map(a => `<tr><td>${escapeHTML(a.event)}</td><td>${escapeHTML(a.category)}</td><td>${a.result === "win" ? "得獎" : "入圍"}</td><td class="num">${a.points}</td></tr>`).join("")
    : `<tr><td colspan="4" class="faint">本期未見 TGA／BAFTA／GJ／DICE／GDC 大獎得獎或入圍紀錄。</td></tr>`;
  const isCompared = state.compare.includes(g.id);
  body.innerHTML = `
    <h3 id="modalTitle">${escapeHTML(g.zh)} <span class="faint" style="font-size:.7em;font-weight:500">${escapeHTML(g.name)}</span></h3>
    <div class="modal-sub">${g.year} · ${escapeHTML(g.genre)} · ${escapeHTML(g.platforms.join(" / "))} · ${escapeHTML(g.developer)}</div>
    <div class="tag-row" style="margin-top:.6rem">
      <span class="chip accent">Award ${g.awardIndex}/110</span>
      <span class="tier-badge ${tierClass(g.marketTier)}">${tierShort(g.marketTier)}</span>
      ${evidenceChip(g.evidenceGrade)}
      <span class="chip">${g.liveService ? "服務型" : "買斷／單機"}</span>
    </div>
    <div class="modal-section"><h4>摘要</h4><p>${escapeHTML(g.summary)}</p></div>
    <div class="modal-section"><h4>四個維度</h4><div class="dim-grid">
      ${dimensionBlock("Critical／Award", dims.award, "Award Index / 110")}
      ${dimensionBlock("Player Reach", dims.reach, dims.reach == null ? "Tier 0：無公開可比數據" : `Tier ${g.marketTier} × 20`)}
      ${dimensionBlock("Commercial", dims.commercial, commercialBasis(g) ? `${commercialBasis(g)} 的對數尺度` : "無銷量／營收數據")}
      ${dimensionBlock("Long-term", dims.longevity, `${g.longevityYears} 年 · 支援 ${postLaunchLabel(g.postLaunchSupport)}`)}
    </div></div>
    <div class="modal-section"><h4>獎項帳本</h4>
      <div class="table-wrap"><table><thead><tr><th>Event</th><th>Category</th><th>結果</th><th class="num">Points</th></tr></thead><tbody>${awardRows}</tbody></table></div>
      <p class="note" style="margin-top:.45rem">${escapeHTML(g.awardNote)}</p>
    </div>
    <div class="modal-section"><h4>市場口徑</h4>
      <p><strong>${escapeHTML(g.marketMetric)}</strong>：${escapeHTML(marketValueText(g))} <span class="faint">（${escapeHTML(g.marketAsOf)}）</span></p>
      <p class="note">${escapeHTML(g.marketNote)}</p>
    </div>
    <div class="modal-section"><h4>Caveat</h4><p>${escapeHTML(g.caveat)}</p></div>
    <div class="modal-section"><h4>來源</h4><div class="tag-row">${sourceLinks(g.sources)}</div></div>
    <div class="modal-section" style="display:flex;gap:.5rem;flex-wrap:wrap">
      <button class="btn ${isCompared ? "" : "btn-primary"}" type="button" data-compare-modal="${escapeHTML(g.id)}">${isCompared ? "移出比較" : "加入比較"}</button>
      <button class="btn" type="button" data-close="1">關閉</button>
    </div>`;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  const close = modal.querySelector(".modal-close");
  if (close) close.focus();
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  document.body.style.overflow = "";
  if (state.lastFocus && typeof state.lastFocus.focus === "function") {
    state.lastFocus.focus({ preventScroll: true });
  }
  state.lastFocus = null;
}

function renderScatterChart() {
  const el = document.getElementById("scatterChart");
  if (!el) return;
  const W = 900, H = 430, padL = 64, padR = 26, padT = 26, padB = 54;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const x = a => padL + (clamp(a, 0, 110) / 110) * plotW;
  const y = t => padT + plotH - (clamp(t, 0, 5) / 5) * plotH;
  const grid = [];
  for (let t = 0; t <= 5; t++) {
    grid.push(`<line class="axis" x1="${padL}" y1="${y(t)}" x2="${W - padR}" y2="${y(t)}" opacity=".65"/>`);
    grid.push(`<text class="axis-label" x="${padL - 10}" y="${y(t) + 4}" text-anchor="end">Tier ${t}</text>`);
  }
  for (let a = 0; a <= 100; a += 20) {
    grid.push(`<line class="axis" x1="${x(a)}" y1="${padT}" x2="${x(a)}" y2="${padT + plotH}" opacity=".4"/>`);
    grid.push(`<text class="axis-label" x="${x(a)}" y="${H - 24}" text-anchor="middle">${a}</text>`);
  }
  grid.push(`<text class="axis-title" x="${padL + plotW / 2}" y="${H - 6}" text-anchor="middle">Award Index</text>`);
  grid.push(`<text class="axis-title" x="16" y="${padT + plotH / 2}" text-anchor="middle" transform="rotate(-90 16 ${padT + plotH / 2})">Market Tier</text>`);
  const colors = ["#6f8297", "#60a5fa", "#5eead4", "#fbbf24", "#fb7185", "#c084fc"];
  const points = GAMES.map(g => {
    const h = hashString(g.id);
    const jx = ((h % 13) - 6) * 1.8;
    const jy = ((Math.floor(h / 13) % 13) - 6) * 1.5;
    const cx = x(g.awardIndex) + jx;
    const cy = y(g.marketTier) + jy;
    const r = 6 + Math.min(6, g.longevityYears / 3.5);
    const fill = colors[g.marketTier];
    return `<g class="chart-row" data-game="${escapeHTML(g.id)}" tabindex="0" role="button" aria-label="${escapeHTML(g.zh)}：Award ${g.awardIndex}，Tier ${g.marketTier}">
      <title>${escapeHTML(g.zh)}：Award ${g.awardIndex}／110，Tier ${g.marketTier}，${g.longevityYears} 年</title>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" fill-opacity=".88" stroke="#0a1119" stroke-width="2"/>
      <text x="${cx + r + 3}" y="${cy + 3}" fill="#c6d2df" font-size="10" paint-order="stroke" stroke="#0a1119" stroke-width="3" stroke-linejoin="round">${escapeHTML(g.zh)}</text>
    </g>`;
  }).join("");
  el.innerHTML = `<div class="chart-title"><strong>獎項與市場證據</strong><span>18 款 · 圓點大小＝長線年數</span></div><svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" aria-hidden="true">${grid.join("")}${points}</svg>`;
  attachChartRows(el);
}

function renderGenreChart() {
  const el = document.getElementById("genreChart");
  if (!el) return;
  const map = new Map();
  GAMES.forEach(g => {
    if (!map.has(g.genre)) map.set(g.genre, { count: 0, award: 0, tier: 0, tierCount: 0 });
    const m = map.get(g.genre);
    m.count++;
    m.award += g.awardIndex;
    if (g.marketTier > 0) { m.tier += g.marketTier; m.tierCount++; }
  });
  const items = [...map.entries()].map(([genre, m]) => ({
    label: genre,
    value: round(m.award / m.count),
    color: "#60a5fa",
    sub: `${m.count} 款 · 平均 Tier ${m.tierCount ? (m.tier / m.tierCount).toFixed(1) : "N/A"}`,
    title: `${genre}：平均 Award ${round(m.award / m.count)}（${m.count} 款）`
  })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "zh-Hant"));
  el.innerHTML = `<svg viewBox="0 0 900 ${18 + items.length * 36 + 8}" width="100%" height="${18 + items.length * 36 + 8}" aria-hidden="true">${items.map((d, i) => {
    const y = 18 + i * 36;
    const w = clamp((d.value / 110) * 640, d.value > 0 ? 3 : 0, 640);
    return `<g class="chart-row"><title>${escapeHTML(d.title)}</title>
      <text x="0" y="${y + 12}" fill="#c6d2df" font-size="11">${escapeHTML(d.label)}</text>
      <rect x="190" y="${y + 2}" width="640" height="14" rx="7" fill="#16222f"></rect>
      <rect class="bar" x="190" y="${y + 2}" width="${w}" height="14" rx="7" fill="#60a5fa"></rect>
      <text x="890" y="${y + 13}" text-anchor="end" fill="#9aacbf" font-size="11">${d.value}</text>
      <text x="196" y="${y + 27}" fill="#6f8297" font-size="9">${escapeHTML(d.sub)}</text>
    </g>`;
  }).join("")}</svg>`;
}

function renderAnalysisCharts() {
  renderScatterChart();
  renderGenreChart();
}

function renderAllGameViews() {
  renderGameGrid();
  renderGameTable();
  renderComparator();
}
