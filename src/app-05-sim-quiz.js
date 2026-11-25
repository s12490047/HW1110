/* ============================================================
   5. Simulator and quiz
   ============================================================ */
const SIM_PRESETS = {
  balanced: { award: 35, reach: 25, commercial: 20, longevity: 20 },
  award: { award: 60, reach: 15, commercial: 15, longevity: 10 },
  reach: { award: 15, reach: 55, commercial: 15, longevity: 15 },
  commercial: { award: 15, reach: 15, commercial: 55, longevity: 15 },
  longevity: { award: 15, reach: 15, commercial: 15, longevity: 55 }
};

function dimPill(label, value) {
  return `<span class="dim-pill">${escapeHTML(label)} <b>${value == null ? "N/A" : round(value)}</b></span>`;
}

function syncWeightInputs() {
  const pairs = [["wAward", "vAward", "award"], ["wReach", "vReach", "reach"], ["wCommercial", "vCommercial", "commercial"], ["wLongevity", "vLongevity", "longevity"]];
  pairs.forEach(([inputId, valueId, key]) => {
    const input = document.getElementById(inputId);
    if (input) input.value = state.weights[key];
    setText(valueId, state.weights[key]);
  });
}

function renderSimulator() {
  syncWeightInputs();
  const results = sortedSim(state.weights);
  const sumW = Object.values(state.weights).reduce((a, b) => a + b, 0);
  const coverageCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  results.forEach(r => { coverageCounts[r.coverage] = (coverageCounts[r.coverage] || 0) + 1; });
  setText("simCoverage", `權重合計 ${sumW} · 覆蓋 4 維 ${coverageCounts[4] || 0} 款／3 維 ${coverageCounts[3] || 0} 款／2 維 ${coverageCounts[2] || 0} 款`);
  const table = document.getElementById("simTable");
  if (table) {
    if (sumW === 0) {
      table.innerHTML = `<div class="empty">所有權重都是 0。請至少調整一個維度，否則無法計算。</div>`;
    } else {
      const rows = results.map((r, i) => {
        const g = r.game;
        return `<tr>
          <td class="num">${i + 1}</td>
          <td><button type="button" data-open="${escapeHTML(g.id)}" style="background:none;border:0;color:var(--accent);padding:0;font:inherit;cursor:pointer;text-align:left">${escapeHTML(g.zh)}</button><div class="faint tiny">${escapeHTML(g.name)}</div></td>
          <td class="score-cell"><div class="score-line"><strong>${r.score.toFixed(1)}</strong><div class="meter"><i style="width:${clamp(r.score, 0, 100)}%"></i></div></div><div class="coverage">覆蓋 ${r.coverage}/4${r.coverage < 4 ? " · 缺值已重分配" : ""}</div></td>
          <td>${dimPill("Award", r.dims.award)} ${dimPill("Reach", r.dims.reach)} ${dimPill("Comm.", r.dims.commercial)} ${dimPill("Long", r.dims.longevity)}</td>
          <td class="tiny">${escapeHTML(g.marketMetric)}<div class="faint">${escapeHTML(marketValueText(g))}</div></td>
        </tr>`;
      }).join("");
      table.innerHTML = `<table><caption>依目前權重即時計算；每個遊戲只在自己可用的維度上重新分配。</caption><thead><tr><th class="num">#</th><th>遊戲</th><th>分數／覆蓋</th><th>維度</th><th>市場口徑</th></tr></thead><tbody>${rows}</tbody></table>`;
    }
  }
  const chart = document.getElementById("simChart");
  if (chart) {
    const top = results.slice(0, 5);
    const items = top.map((r, i) => ({
      label: r.game.zh,
      value: round(r.score),
      gameId: r.game.id,
      color: ["#5eead4", "#60a5fa", "#c084fc", "#fbbf24", "#fb7185"][i],
      title: `${r.game.zh}：${r.score.toFixed(1)}／100（覆蓋 ${r.coverage}/4）`
    }));
    chart.innerHTML = `<div class="chart-title"><strong>目前前五名</strong><span>0–100 · 不是預測</span></div>${barChartHTML(items, { max: 100, valueSuffix: "" })}`;
    attachChartRows(chart);
  }
  renderSensitivity();
}

function renderSensitivity() {
  const el = document.getElementById("sensitivity");
  if (!el) return;
  const presets = [
    ["平衡 35/25/20/20", SIM_PRESETS.balanced],
    ["獎項優先 60/15/15/10", SIM_PRESETS.award],
    ["市場優先 15/55/15/15", SIM_PRESETS.reach],
    ["商業優先 15/15/55/15", SIM_PRESETS.commercial],
    ["長線優先 15/15/15/55", SIM_PRESETS.longevity]
  ];
  const rows = presets.map(([label, weights]) => {
    const top = sortedSim(weights).slice(0, 5);
    return `<tr><td>${escapeHTML(label)}</td>${top.map(r => `<td>${escapeHTML(r.game.zh)} <span class="faint tiny">${r.score.toFixed(1)}</span></td>`).join("")}</tr>`;
  }).join("");
  el.innerHTML = `<table><caption>四組預設權重下的前五名；同一款遊戲在不同權重下的排名變化，就是敏感度。</caption><thead><tr><th>權重預設</th><th>#1</th><th>#2</th><th>#3</th><th>#4</th><th>#5</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function applyPreset(name) {
  const preset = SIM_PRESETS[name];
  if (!preset) return;
  state.weights = { ...preset };
  renderSimulator();
  toast(`已套用預設：${name}`);
}

/* ------------------------------------------------------------ quiz */
const QUIZ = [
  {
    q: "TGA 2025 的 Game of the Year 是哪一款？",
    options: ["Astro Bot", "Clair Obscur: Expedition 33", "Baldur's Gate 3", "Elden Ring"],
    answer: 1,
    explain: "TGA 2025 GOTY 是 Clair Obscur: Expedition 33；同屆它共拿下 9 個獎項。"
  },
  {
    q: "Steam 同時在線人數（CCU）可以直接當成什麼？",
    options: ["全球 DAU", "全球 MAU", "PC 平台當下同時在線", "累計銷量"],
    answer: 2,
    explain: "CCU 只描述 Steam PC 平台當下的同時在線，不是 DAU／MAU，也不是銷量。"
  },
  {
    q: "Roblox 2025 的 bookings 與 revenue，哪一個較大？",
    options: ["revenue $4.89B", "bookings $6.79B", "兩者相等", "資料未公開"],
    answer: 1,
    explain: "2025 bookings 約 $6.79B，revenue 約 $4.89B；bookings 與 revenue 是不同會計概念，不可互換。"
  },
  {
    q: "FFXIV 的 24M registered players 代表什麼？",
    options: ["24M 同時在線", "24M 活躍訂閱", "24M 註冊帳號，不等於活躍玩家", "24M 銷量"],
    answer: 2,
    explain: "registered accounts ≠ active subscribers，也不等於 MAU／DAU。"
  },
  {
    q: "本 Wiki 的 Award Index 上限 110，哪款案例達到上限？",
    options: ["Elden Ring", "Baldur's Gate 3", "Astro Bot", "Clair Obscur"],
    answer: 1,
    explain: "BG3 為 110／110；Elden Ring 90、Astro Bot 94、Clair Obscur 74。上限是加權設計，不是客觀滿分。"
  },
  {
    q: "哪一款遊戲的市場軸是 Tier 0，但影響力極大？",
    options: ["Minecraft", "League of Legends", "Roblox", "Elden Ring"],
    answer: 1,
    explain: "LoL 的 Tier 0 代表沒有公開可比較的全球 MAU／DAU，不是玩家少。Minecraft、Roblox 為 Tier 5，Elden Ring 為 Tier 4。"
  },
  {
    q: "模擬器遇到 Commercial 缺值時，正確做法是？",
    options: ["補 0 分", "用市場 Tier 代替", "在可用維度上重新分配權重", "把該遊戲排除"],
    answer: 2,
    explain: "缺值不補 0，也不拿別的維度硬代；模型只在 available 的維度上重新分配權重，並顯示覆蓋率。"
  },
  {
    q: "以下哪一個是年度邊界錯誤？",
    options: ["把 2025 遊戲的 2026 BAFTA 計入 2021–2025 Award Index", "把 CCU 當 DAU", "把 bookings 當 revenue", "把註冊數當活躍玩家"],
    answer: 0,
    explain: "2025 遊戲的 2026 BAFTA／DICE／GDC 超出研究截止，不能計入 2021–2025 的 Award Index；其他三項則是口徑混用。"
  }
];

function renderQuiz() {
  const form = document.getElementById("quiz");
  if (!form) return;
  form.innerHTML = QUIZ.map((item, qi) => `<fieldset class="question" data-q="${qi}">
    <legend>${qi + 1}. ${escapeHTML(item.q)}</legend>
    <div class="options">${item.options.map((opt, oi) => `<label class="opt" data-opt="${oi}">
      <input type="radio" name="q${qi}" value="${oi}">
      <span>${escapeHTML(opt)}</span>
    </label>`).join("")}</div>
    <div class="quiz-explain" id="explain-${qi}">${escapeHTML(item.explain)}</div>
  </fieldset>`).join("");
}

function checkQuiz() {
  let score = 0;
  QUIZ.forEach((item, qi) => {
    const field = document.querySelector(`[data-q="${qi}"]`);
    if (!field) return;
    const chosen = field.querySelector(`input[name="q${qi}"]:checked`);
    const labels = field.querySelectorAll(".opt");
    labels.forEach(label => {
      const oi = Number(label.dataset.opt);
      label.classList.toggle("correct", oi === item.answer);
      label.classList.toggle("wrong", !!chosen && Number(chosen.value) === oi && oi !== item.answer);
    });
    const explain = document.getElementById(`explain-${qi}`);
    if (explain) explain.classList.add("show");
    if (chosen && Number(chosen.value) === item.answer) score++;
  });
  const result = document.getElementById("quizResult");
  if (result) result.textContent = `得分 ${score} / ${QUIZ.length}${score === QUIZ.length ? " · 口徑大師" : score >= 6 ? " · 很穩" : " · 再看一次來源卡"}`;
  toast(`測驗完成：${score} / ${QUIZ.length}`);
}

function resetQuiz() {
  const form = document.getElementById("quiz");
  if (form) form.reset();
  document.querySelectorAll(".question .opt").forEach(label => label.classList.remove("correct", "wrong"));
  document.querySelectorAll(".quiz-explain").forEach(el => el.classList.remove("show"));
  const result = document.getElementById("quizResult");
  if (result) result.textContent = "";
}
