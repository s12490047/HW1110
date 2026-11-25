/* ============================================================
   4. Knowledge graph
   ============================================================ */
const GRAPH_COLORS = {
  center: "#fbbf24",
  genre: "#5eead4",
  game: "#e8eef6",
  award: "#fbbf24",
  source: "#60a5fa",
  platform: "#c084fc"
};
const GRAPH_RADII = { center: 27, genre: 15, game: 9, award: 8, source: 4.6, platform: 7 };
const GRAPH_TYPE_LABEL = { center: "中心", genre: "類型", game: "遊戲", award: "獎項", source: "來源", platform: "平台" };

const graphState = {
  nodes: [],
  edges: [],
  nodeById: new Map(),
  edgeLayer: null,
  nodeLayer: null,
  svg: null,
  drag: null,
  moved: false
};

function awardNodeId(event) {
  return `award:${event.toLowerCase().replace(/ /g, "").replace(/'/g, "")}`;
}

function buildGraphData() {
  const nodes = new Map();
  const edges = [];
  const addNode = (id, label, type, meta = {}) => {
    if (!nodes.has(id)) nodes.set(id, { id, label, type, meta, x: 600, y: 400, r: GRAPH_RADII[type] || 8 });
    return nodes.get(id);
  };
  addNode("center", "全球遊戲獎項 × 市場成功", "center");
  GAMES.forEach(g => addNode(`game:${g.id}`, g.zh, "game", { gameId: g.id }));
  const awardLabels = new Map();
  GAMES.forEach(g => g.awardBreakdown.forEach(a => awardLabels.set(awardNodeId(a.event), a.event)));
  awardLabels.forEach((label, id) => addNode(id, label, "award", { event: label }));
  EDGES.forEach(e => {
    if (e.type === "genre") addNode(e.target, e.target.replace(/^genre:/, ""), "genre");
    if (e.type === "platform") addNode(e.target, e.target.replace(/^platform:/, ""), "platform");
    if (e.type === "source") addNode(e.target, e.target.replace(/^source:/, ""), "source", { sourceId: e.target.replace(/^source:/, "") });
    if (e.type === "award") addNode(e.target, awardLabels.get(e.target) || e.target.replace(/^award:/, ""), "award");
    edges.push({ ...e });
  });
  const genreNodes = [...nodes.values()].filter(n => n.type === "genre");
  genreNodes.forEach(n => edges.push({ source: "center", target: n.id, type: "hub", label: "index", weight: 1 }));
  return { nodes: [...nodes.values()], edges };
}

function initialGraphLayout() {
  const nodes = graphState.nodes;
  const center = nodes.find(n => n.id === "center");
  if (center) { center.x = 600; center.y = 400; }
  const genres = nodes.filter(n => n.type === "genre");
  const games = nodes.filter(n => n.type === "game");
  const awards = nodes.filter(n => n.type === "award");
  const platforms = nodes.filter(n => n.type === "platform");
  const sources = nodes.filter(n => n.type === "source");
  const genreAngles = new Map();
  genres.forEach((n, i) => {
    const angle = (i / Math.max(1, genres.length)) * Math.PI * 2 - Math.PI / 2;
    genreAngles.set(n.id, angle);
    n.x = 600 + Math.cos(angle) * 150;
    n.y = 400 + Math.sin(angle) * 150;
  });
  const gamesByGenre = new Map();
  games.forEach(n => {
    const edge = graphState.edges.find(e => e.source === n.id && e.type === "genre");
    const key = edge ? edge.target : "unknown";
    if (!gamesByGenre.has(key)) gamesByGenre.set(key, []);
    gamesByGenre.get(key).push(n);
  });
  gamesByGenre.forEach((list, genreId) => {
    const base = genreAngles.get(genreId) ?? 0;
    list.forEach((n, i) => {
      const offset = (i - (list.length - 1) / 2) * 0.16;
      const angle = base + offset;
      const radius = 300 + (i % 2) * 34;
      n.x = 600 + Math.cos(angle) * radius;
      n.y = 400 + Math.sin(angle) * radius;
    });
  });
  const ring = (list, radius, phase = 0) => list.forEach((n, i) => {
    const angle = (i / Math.max(1, list.length)) * Math.PI * 2 + phase;
    n.x = 600 + Math.cos(angle) * radius;
    n.y = 400 + Math.sin(angle) * radius;
  });
  ring(awards, 220, 0.25);
  ring(platforms, 360, 0.6);
  ring(sources, 430, 0.1);
  nodes.forEach(n => {
    n.x = clamp(n.x, 50, 1150);
    n.y = clamp(n.y, 50, 750);
  });
}

function runGraphLayout() {
  const nodes = graphState.nodes;
  const edges = graphState.edges;
  for (let iter = 0; iter < 220; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) { dx = (i - j) * 0.7 + 0.1; dy = (j - i) * 0.5 + 0.1; d2 = dx * dx + dy * dy; }
        const dist = Math.sqrt(d2);
        const force = Math.min(9, 2100 / Math.max(24, d2));
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.x -= fx; a.y -= fy;
        b.x += fx; b.y += fy;
      }
    }
    edges.forEach(e => {
      const a = graphState.nodeById.get(e.source);
      const b = graphState.nodeById.get(e.target);
      if (!a || !b) return;
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const target = e.type === "hub" ? 170 : e.type === "source" ? 120 : 95;
      const force = (dist - target) * 0.018;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.x += fx; a.y += fy;
      b.x -= fx; b.y -= fy;
    });
    nodes.forEach(n => {
      n.x += (600 - n.x) * 0.0015;
      n.y += (400 - n.y) * 0.0015;
      n.x = clamp(n.x, 36, 1164);
      n.y = clamp(n.y, 36, 764);
    });
  }
  const minX = Math.min(...nodes.map(n => n.x - n.r)), maxX = Math.max(...nodes.map(n => n.x + n.r));
  const minY = Math.min(...nodes.map(n => n.y - n.r)), maxY = Math.max(...nodes.map(n => n.y + n.r));
  const scale = Math.min((1200 - 80) / Math.max(1, maxX - minX), (800 - 80) / Math.max(1, maxY - minY), 1.08);
  nodes.forEach(n => {
    n.x = 600 + (n.x - 600) * scale;
    n.y = 400 + (n.y - 400) * scale;
  });
}

function nodeTextOffset(node) {
  if (node.type === "center") return 4;
  return node.r + 12;
}

function renderGraph() {
  const svg = document.getElementById("graphSvg");
  if (!svg) return;
  const data = buildGraphData();
  graphState.nodes = data.nodes;
  graphState.edges = data.edges;
  graphState.nodeById = new Map(data.nodes.map(n => [n.id, n]));
  graphState.svg = svg;
  initialGraphLayout();
  runGraphLayout();

  const edgeLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  const nodeLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  graphState.edgeLayer = edgeLayer;
  graphState.nodeLayer = nodeLayer;
  svg.innerHTML = "";
  svg.appendChild(edgeLayer);
  svg.appendChild(nodeLayer);

  data.edges.forEach(e => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("class", `graph-edge ${e.type}`);
    edgeLayer.appendChild(line);
    e.el = line;
  });

  data.nodes.forEach(node => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", `graph-node ${node.type}`);
    g.setAttribute("data-node", node.id);
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", `${node.label}，${GRAPH_TYPE_LABEL[node.type] || node.type}`);
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("r", node.r);
    circle.setAttribute("fill", GRAPH_COLORS[node.type] || "#9aacbf");
    if (node.type === "center") {
      circle.setAttribute("fill-opacity", ".18");
      circle.setAttribute("stroke", GRAPH_COLORS.center);
      circle.setAttribute("stroke-width", "1.5");
    }
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = `${node.label} · ${GRAPH_TYPE_LABEL[node.type] || node.type}`;
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("y", nodeTextOffset(node));
    text.textContent = node.type === "source" ? node.label : node.label.length > 18 ? node.label.slice(0, 17) + "…" : node.label;
    g.appendChild(title);
    g.appendChild(circle);
    g.appendChild(text);
    nodeLayer.appendChild(g);
    node.el = g;
    g.setAttribute("transform", `translate(${node.x},${node.y})`);

    g.addEventListener("click", ev => {
      if (graphState.moved) { graphState.moved = false; return; }
      ev.stopPropagation();
      selectGraphNode(node.id);
    });
    g.addEventListener("keydown", ev => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        selectGraphNode(node.id);
      }
    });
    g.addEventListener("pointerdown", ev => startGraphDrag(ev, node));
  });

  updateGraphEdges();
  applyGraphFilter();
  const stats = document.getElementById("graphStats");
  if (stats) stats.textContent = `${data.nodes.length} nodes · ${data.edges.length} edges`;
}

function updateGraphEdges() {
  graphState.edges.forEach(e => {
    if (!e.el) return;
    const a = graphState.nodeById.get(e.source);
    const b = graphState.nodeById.get(e.target);
    if (!a || !b) return;
    e.el.setAttribute("x1", a.x);
    e.el.setAttribute("y1", a.y);
    e.el.setAttribute("x2", b.x);
    e.el.setAttribute("y2", b.y);
  });
}

function updateGraphNode(node) {
  if (node.el) node.el.setAttribute("transform", `translate(${node.x},${node.y})`);
}

function svgPoint(evt) {
  const svg = graphState.svg;
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function startGraphDrag(evt, node) {
  if (evt.button !== 0) return;
  evt.preventDefault();
  const p = svgPoint(evt);
  graphState.drag = { node, dx: node.x - p.x, dy: node.y - p.y };
  graphState.moved = false;
  node.el.setPointerCapture?.(evt.pointerId);
  const move = e => {
    if (!graphState.drag) return;
    const q = svgPoint(e);
    const n = graphState.drag.node;
    n.x = clamp(q.x + graphState.drag.dx, 24, 1176);
    n.y = clamp(q.y + graphState.drag.dy, 24, 776);
    graphState.moved = true;
    updateGraphNode(n);
    updateGraphEdges();
  };
  const up = () => {
    graphState.drag = null;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    setTimeout(() => { graphState.moved = false; }, 0);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}

function graphNeighbors(node) {
  const ids = new Set();
  graphState.edges.forEach(e => {
    if (e.source === node.id) ids.add(e.target);
    if (e.target === node.id) ids.add(e.source);
  });
  return [...ids].map(id => graphState.nodeById.get(id)).filter(Boolean);
}

function selectGraphNode(id) {
  const node = graphState.nodeById.get(id);
  if (!node) return;
  state.graphSelected = id;
  graphState.nodes.forEach(n => n.el?.classList.toggle("selected", n.id === id));
  const detail = document.getElementById("graphDetail");
  if (!detail) return;
  const neighbors = graphNeighbors(node);
  const typeLabel = GRAPH_TYPE_LABEL[node.type] || node.type;
  let body = `<h4>${escapeHTML(node.label)}</h4><p><span class="chip">${escapeHTML(typeLabel)}</span> <span class="chip">${neighbors.length} 條連線</span></p>`;
  if (node.type === "game") {
    const g = GAME_BY_ID.get(node.meta.gameId);
    body += `<p>${escapeHTML(g.summary)}</p><p class="note">Award ${g.awardIndex}/110 · Tier ${g.marketTier} · ${g.year}</p><button class="btn btn-small" type="button" data-open="${escapeHTML(g.id)}">開啟完整詳情</button>`;
  } else if (node.type === "source") {
    const s = SOURCE_BY_ID.get(node.meta.sourceId);
    const st = statusInfo(s.status);
    body += `<p>${escapeHTML(s.title)}</p><p class="note">${escapeHTML(s.publisher)} · ${escapeHTML(s.published)} · <span class="status ${st.cls}">${escapeHTML(st.label)}</span></p><p class="note">${escapeHTML(s.usedFor)}</p><a class="btn btn-small" href="${escapeHTML(s.url)}" target="_blank" rel="noopener noreferrer">開啟來源</a>`;
  } else if (node.type === "genre" || node.type === "platform" || node.type === "award") {
    const games = neighbors.map(n => n.type === "game" ? GAME_BY_ID.get(n.meta.gameId) : null).filter(Boolean);
    body += `<p class="note">連到的遊戲：</p><div class="conn">${games.map(g => `<button type="button" data-open="${escapeHTML(g.id)}">${escapeHTML(g.zh)}</button>`).join("") || `<span class="faint">無</span>`}</div>`;
  } else {
    body += `<p class="note">中心節點是視覺錨點；真正的資料實體是遊戲、類型、獎項、來源與平台。</p>`;
  }
  body += `<p class="note" style="margin-top:.7rem">相鄰節點</p><div class="conn">${neighbors.slice(0, 18).map(n => `<button type="button" data-graph-node="${escapeHTML(n.id)}">${escapeHTML(n.label)}</button>`).join("") || `<span class="faint">無</span>`}</div>`;
  detail.innerHTML = body;
}

function applyGraphFilter() {
  const type = state.graphType;
  const q = state.graphQuery.trim().toLowerCase();
  const visible = new Set();
  graphState.nodes.forEach(n => {
    const typeOk = type === "all" ? true : n.type === type;
    const searchOk = !q || `${n.label} ${n.id}`.toLowerCase().includes(q);
    const show = typeOk && searchOk;
    n.el?.classList.toggle("hidden", !show);
    n.el?.classList.toggle("match", !!q && searchOk);
    n.el?.classList.toggle("dim", !!q && !searchOk);
    if (show) visible.add(n.id);
  });
  let edgeCount = 0;
  graphState.edges.forEach(e => {
    const show = visible.has(e.source) && visible.has(e.target);
    e.el?.classList.toggle("hidden", !show);
    if (show) edgeCount++;
  });
  const stats = document.getElementById("graphStats");
  if (stats) stats.textContent = `${visible.size} nodes · ${edgeCount} edges`;
}
