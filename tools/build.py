#!/usr/bin/env python3
"""Build the single-file wiki/slideshow from validated JSON data.

Source parts live in src/ and are concatenated into one offline index.html.
Run from the project root:
    py tools/build.py
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
SRC = ROOT / "src"
OUT = ROOT / "index.html"

REQUIRED_GAME_FIELDS = {
    "id", "name", "zh", "year", "genre", "subgenres", "platforms",
    "businessModel", "developer", "publisher", "awardIndex", "awardBreakdown",
    "awardNote", "salesCopies", "registeredPlayers", "dau", "ccu",
    "revenueB", "bookingsB", "netLossB", "marketTier", "marketMetric",
    "marketValue", "marketUnit", "marketAsOf", "marketNote", "longevityYears",
    "liveService", "postLaunchSupport", "evidenceGrade", "sources", "summary",
    "caveat", "tags",
}


def load_json(path: Path):
    with path.open("r", encoding="utf-8-sig") as fh:
        return json.load(fh)


def fail(message: str) -> None:
    print(f"VALIDATION ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def validate(games, sources, awards):
    if len(games) != 18:
        fail(f"expected 18 games, got {len(games)}")
    ids = [g["id"] for g in games]
    if len(ids) != len(set(ids)):
        fail("duplicate game id")

    source_ids = [s["id"] for s in sources]
    if len(source_ids) != len(set(source_ids)):
        fail("duplicate source id")

    for g in games:
        missing = REQUIRED_GAME_FIELDS - set(g)
        if missing:
            fail(f"{g.get('id')} missing fields: {sorted(missing)}")
        if g["marketTier"] not in range(0, 6):
            fail(f"{g['id']} marketTier out of range")
        if g["awardIndex"] != sum(a["points"] for a in g["awardBreakdown"]):
            fail(f"{g['id']} awardIndex does not match breakdown")
        bad = [s for s in g["sources"] if s not in source_ids]
        if bad:
            fail(f"{g['id']} references unknown sources: {bad}")
        if not g["summary"] or not g["caveat"]:
            fail(f"{g['id']} missing summary/caveat")
        if g["salesCopies"] is not None and g["salesCopies"] < 0:
            fail(f"{g['id']} negative sales")
        if g["ccu"] is not None and g["ccu"] < 0:
            fail(f"{g['id']} negative ccu")

    if len(awards) != 5:
        fail(f"expected 5 TGA ceremonies, got {len(awards)}")
    if [a["year"] for a in awards] != [2021, 2022, 2023, 2024, 2025]:
        fail("TGA ceremonies must cover 2021-2025 in order")


def make_edges(games):
    edges = []
    seen = set()

    def add(source, target, kind, label="", weight=1):
        key = (source, target, kind, label)
        if key in seen:
            return
        seen.add(key)
        edges.append({
            "source": source,
            "target": target,
            "type": kind,
            "label": label,
            "weight": weight,
        })

    for g in games:
        gid = f"game:{g['id']}"
        add(gid, f"genre:{g['genre']}", "genre", g["genre"])
        for p in g["platforms"]:
            add(gid, f"platform:{p}", "platform", p)
        for s in g["sources"]:
            add(gid, f"source:{s}", "source", s)
        for a in g["awardBreakdown"]:
            event = a["event"]
            prefix = event.lower().replace(" ", "").replace("'", "")
            aid = f"award:{prefix}"
            add(gid, aid, "award", a["category"], a["points"])
    return edges


def read_parts(pattern: str) -> str:
    parts = sorted(SRC.glob(pattern))
    if not parts:
        fail(f"no source parts matching {pattern}")
    return "\n".join(p.read_text(encoding="utf-8-sig") for p in parts)


def main() -> None:
    games = load_json(DATA / "games.json")
    sources = load_json(DATA / "sources.json")
    awards = load_json(DATA / "awards.json")
    validate(games, sources, awards)

    edges = make_edges(games)
    (DATA / "edges.json").write_text(
        json.dumps(edges, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    head = (SRC / "head.html").read_text(encoding="utf-8-sig")
    css = read_parts("*.css")
    body = read_parts("body-*.html")
    js = read_parts("app-*.js")

    meta = {
        "built": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "games": len(games),
        "sources": len(sources),
        "awards": len(awards),
        "edges": len(edges),
        "researchPeriod": "2021-2025",
        "supplementSnapshot": "2026-11-25",
    }
    replacements = {
        "__GAMES_JSON__": json.dumps(games, ensure_ascii=False, separators=(",", ":")),
        "__SOURCES_JSON__": json.dumps(sources, ensure_ascii=False, separators=(",", ":")),
        "__AWARDS_JSON__": json.dumps(awards, ensure_ascii=False, separators=(",", ":")),
        "__EDGES_JSON__": json.dumps(edges, ensure_ascii=False, separators=(",", ":")),
        "__BUILD_META_JSON__": json.dumps(meta, ensure_ascii=False, separators=(",", ":")),
    }

    html = head.replace("</head>", f"<style>\n{css}\n</style>\n</head>")
    html += "\n" + body
    html += "\n<script>\n" + js + "\n</script>\n</body>\n</html>\n"

    for token, value in replacements.items():
        count = html.count(token)
        if count != 1:
            fail(f"token {token} appears {count} times; expected exactly 1")
        html = html.replace(token, value)

    OUT.write_text(html, encoding="utf-8")
    print(f"OK: wrote {OUT} ({OUT.stat().st_size:,} bytes)")
    print(f"OK: {len(games)} games, {len(sources)} sources, {len(awards)} ceremonies, {len(edges)} edges")
    print(f"OK: built at {meta['built']}")


if __name__ == "__main__":
    main()
