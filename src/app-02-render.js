/* ============================================================
   2. Static views: sources, awards, market
   ============================================================ */
function renderBuildMeta() {
  const text = `build ${BUILD_META.built} · ${BUILD_META.games} games · ${BUILD_META.sources} sources · ${BUILD_META.edges} edges`;
  setText("buildMetaSide", text);
  setText("buildMetaFooter", text);
}

function barChartHTML(items, opts = {}) {
  const width = 900;
  const rowH = opts.rowH || 30;
  const labelW = opts.labelW || 185;
  const valueW = opts.valueW || 62;
  const max = opts.max || Math.max(1, ...items.map(d => d.value));
  const height = 18 + items.length * rowH + 8;
  const barW = width - labelW - valueW - 14;
  const rows = items.map((d, i) => {
    const y = 18 + i * rowH;
    const w = clamp((d.value / max) * barW, d.value > 0 ? 3 : 0, barW);
    const color = d.color || "#5eead4";
    const gid = d.gameId ? ` data-game="${escapeHTML(d.gameId)}"` : "";
    const role = d.gameId ? ` tabindex="0" role="button" aria-label="${escapeHTML(d.label)}：${escapeHTML(d.value)}"` : "";
    return `<g class="chart-row"${gid}${role}>
      <title>${escapeHTML(d.title || `${d.label}：${d.value}${opts.valueSuffix || ""}`)}</title>
      <text x="0" y="${y + 12}" fill="#c6d2df" font-size="11">${escapeHTML(d.label)}</text>
      <rect x="${labelW}" y="${y + 2}" width="${barW}" height="14" rx="7" fill="#16222f"></rect>
      <rect class="bar" x="${labelW}" y="${y + 2}" width="${w}" height="14" rx="7" fill="${color}"></rect>
      <text x="${width - 8}" y="${y + 13}" text-anchor="end" fill="#9aacbf" font-size="11">${escapeHTML(d.value)}${escapeHTML(opts.valueSuffix || "")}</text>
      ${d.sub ? `<text x="${labelW + 6}" y="${y + 27}" fill="#6f8297" font-size="9">${escapeHTML(d.sub)}</text>` : ""}
    </g>`;
  }).join("");
  return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" aria-hidden="true">${rows}</svg>`;
}

function attachChartRows(container) {
  container.querySelectorAll(".chart-row[data-game]").forEach(row => {
    const open = () => openGame(row.dataset.game);
    row.addEventListener("click", open);
    row.addEventListener("keydown", ev => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        open();
      }
    });
  });
}

function renderAwardChart() {
  const el = document.getElementById("awardChart");
  if (!el) return;
  const items = [...GAMES].sort((a, b) => b.awardIndex - a.awardIndex || a.zh.localeCompare(b.zh, "zh-Hant")).map(g => ({
    label: g.zh,
    value: g.awardIndex,
    gameId: g.id,
    color: g.awardIndex >= 40 ? "#5eead4" : g.awardIndex > 0 ? "#fbbf24" : "#3b4d61",
    title: `${g.zh}／${g.name}：Award Index ${g.awardIndex}／110`
  }));
  el.innerHTML = barChartHTML(items, { max: 110, valueSuffix: "" });
  attachChartRows(el);
}

function renderTgaTimeline() {
  const el = document.getElementById("tgaTimeline");
  if (!el) return;
  el.innerHTML = AWARDS.map(a => {
    const extras = [
      a.mediaOutlets ? `${a.mediaOutlets} 家媒體` : null,
      a.streamsM ? `${a.streamsM}M streams` : null,
      a.votesM ? `${a.votesM}M votes` : null
    ].filter(Boolean).join(" · ");
    return `<div class="timeline-item">
      <div class="when">${escapeHTML(a.date)} · ${escapeHTML(a.event)}</div>
      <h4>${a.year} GOTY：${escapeHTML(a.goty)}</h4>
      <p>評審 ${round(a.juryWeight * 100)}%＋公眾 ${round(a.publicWeight * 100)}%${extras ? " · " + escapeHTML(extras) : ""}</p>
      <p class="note" style="margin-top:.25rem">${escapeHTML(a.note)}</p>
      <div style="margin-top:.35rem">${sourceChip(a.source)}</div>
    </div>`;
  }).join("");
}

function renderTierChart() {
  const el = document.getElementById("tierChart");
  if (!el) return;
  const counts = [0, 0, 0, 0, 0, 0];
  GAMES.forEach(g => counts[g.marketTier]++);
  const colors = ["#6f8297", "#60a5fa", "#5eead4", "#fbbf24", "#fb7185", "#c084fc"];
  const items = counts.map((count, tier) => ({
    label: tier === 0 ? "Tier 0 · 留白" : `Tier ${tier}`,
    value: count,
    color: colors[tier],
    title: `${TIER_LABELS[tier]}：${count} 款`
  }));
  const max = Math.max(1, ...counts);
  el.innerHTML = `<div class="chart-title"><strong>18 款案例的 Tier 分布</strong><span>點數不是玩家數</span></div>${barChartHTML(items, { max, valueSuffix: " 款", rowH: 34 })}`;
}

function renderMarketTable() {
  const el = document.getElementById("marketTable");
  if (!el) return;
  const rows = [...GAMES].sort((a, b) => b.marketTier - a.marketTier || (b.marketValue || 0) - (a.marketValue || 0)).map(g => `
    <tr>
      <td><button type="button" data-open="${escapeHTML(g.id)}" style="background:none;border:0;color:var(--accent);padding:0;font:inherit;cursor:pointer;text-align:left">${escapeHTML(g.zh)}</button><div class="faint tiny">${escapeHTML(g.name)}</div></td>
      <td><span class="tier-badge ${tierClass(g.marketTier)}">${tierShort(g.marketTier)}</span></td>
      <td>${escapeHTML(g.marketMetric)}</td>
      <td class="num">${escapeHTML(marketValueText(g))}</td>
      <td class="nowrap">${escapeHTML(g.marketAsOf)}</td>
      <td>${evidenceChip(g.evidenceGrade)}</td>
      <td class="small">${escapeHTML(g.marketNote)}</td>
    </tr>`).join("");
  el.innerHTML = `<table><caption>市場軸只描述證據等級與口徑，不是全球市場規模。</caption><thead><tr><th>遊戲</th><th>Tier</th><th>指標</th><th class="num">數值</th><th>截止</th><th>證據</th><th>備註</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function sourceMatches(s) {
  const q = state.sourceQuery.trim().toLowerCase();
  if (q) {
    const hay = [s.id, s.title, s.publisher, s.usedFor, s.limitations, s.type, s.period].join(" ").toLowerCase();
    if (!hay.includes(q)) return false;
  }
  const st = state.sourceStatus;
  if (st === "all") return true;
  if (st === "primary") return s.status.startsWith("verified-primary");
  if (st === "secondary") return s.status === "verified-secondary";
  if (st === "context") return ["used-as-context-only", "supplement-only", "methodology-only"].includes(s.status);
  if (st === "blocked") return s.status.startsWith("blocked");
  return true;
}

function renderSources() {
  const el = document.getElementById("sourceList");
  if (!el) return;
  const filtered = SOURCES.filter(sourceMatches);
  setText("sourceCount", `${filtered.length} / ${SOURCES.length}`);
  if (!filtered.length) {
    el.innerHTML = `<div class="empty">沒有符合條件的來源。試試清空搜尋或切換狀態。</div>`;
    return;
  }
  el.innerHTML = filtered.map(s => {
    const st = statusInfo(s.status);
    return `<details class="source-card" id="source-${escapeHTML(s.id)}">
      <summary>
        <span class="sid">${escapeHTML(s.id)}</span>
        <span class="stitle">${escapeHTML(s.title)}</span>
        <span class="status ${st.cls}" style="margin-left:auto">${escapeHTML(st.label)}</span>
      </summary>
      <div class="sbody">
        <p><span class="label">Publisher</span>${escapeHTML(s.publisher)}</p>
        <p><span class="label">URL</span><a href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.url)}</a></p>
        <p><span class="label">Published</span>${escapeHTML(s.published)} <span class="label" style="margin-left:.8rem">Accessed</span>${escapeHTML(s.accessed)}</p>
        <p><span class="label">Type</span>${escapeHTML(s.type)} <span class="label" style="margin-left:.8rem">Period</span>${escapeHTML(s.period)}</p>
        <p><span class="label">Used for</span>${escapeHTML(s.usedFor)}</p>
        <p><span class="label">Limitations</span>${escapeHTML(s.limitations)}</p>
      </div>
    </details>`;
  }).join("");
}

function scrollToSource(id) {
  if (!SOURCE_BY_ID.has(id)) return;
  state.sourceQuery = "";
  state.sourceStatus = "all";
  const search = document.getElementById("sourceSearch");
  const status = document.getElementById("sourceStatus");
  if (search) search.value = "";
  if (status) status.value = "all";
  renderSources();
  const card = document.getElementById("source-" + id);
  if (!card) return;
  card.open = true;
  card.classList.add("highlight");
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  const summary = card.querySelector("summary");
  if (summary) summary.focus({ preventScroll: true });
  setTimeout(() => card.classList.remove("highlight"), 2600);
}

function renderSourceTable() {
  const el = document.getElementById("sourceTable");
  if (!el) return;
  const rows = SOURCES.map(s => {
    const st = statusInfo(s.status);
    return `<tr>
      <td class="mono">${escapeHTML(s.id)}</td>
      <td><a href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.title)}</a><div class="faint tiny">${escapeHTML(s.publisher)}</div></td>
      <td class="nowrap">${escapeHTML(s.published)}</td>
      <td><span class="status ${st.cls}">${escapeHTML(st.label)}</span></td>
      <td class="small">${escapeHTML(s.usedFor)}</td>
      <td class="small">${escapeHTML(s.limitations)}</td>
    </tr>`;
  }).join("");
  el.innerHTML = `<table><caption>22 個來源；所有遊戲卡上的 Sxx 都可回到這張表。</caption><thead><tr><th>ID</th><th>來源</th><th>發布日</th><th>狀態</th><th>用途</th><th>限制</th></tr></thead><tbody>${rows}</tbody></table>`;
}
