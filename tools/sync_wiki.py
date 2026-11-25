#!/usr/bin/env python3
"""把 wiki/*.md 同步成 GitHub Wiki 頁面（HW1110.wiki.git）。

GitHub Wiki 不是 repo 裡的資料夾，而是一個獨立的 git repo（<repo>.wiki.git）。
本工具讓 wiki/*.md 保持唯一真實來源，再投影到兩個出口：

    wiki/*.md ──┬─▶ wiki/index.html（GitHub Pages 目錄頁，手寫）
                └─▶ <repo>.wiki.git 的 Home／_Sidebar／_Footer ＋ 8 篇頁面

用法：
    py tools/sync_wiki.py            # 只產生到 .wiki-build/，不連網
    py tools/sync_wiki.py --push     # 再 clone wiki repo、commit、push

前置條件（--push）：GitHub 上該 repo 的 Wiki 必須已經有「第一頁」，
否則 <repo>.wiki.git 不存在，clone 會得到 "Repository not found"。
第一頁只能在網頁上按 "Create the first page" 建立。
"""

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WIKI_SRC = ROOT / "wiki"
OUT = ROOT / ".wiki-build"

REPO = "s12490047/HW1110"
OWNER, NAME = REPO.split("/")
SITE = f"https://{OWNER.lower()}.github.io/{NAME}"
BLOB = f"https://github.com/{REPO}/blob/main"
WIKI_WEB = f"https://github.com/{REPO}/wiki"

# (來源檔, wiki 頁面名稱, 側欄標籤, 一句話說明)
PAGES = [
    ("00-research-blueprint.md", "D1 Research Blueprint", "D1 研究計畫",
     "研究緣起、核心問題、四個成功維度、取樣與 rubric 的設計理由。"),
    ("01-ingest-report.md", "D2 Ingest Report", "D2 來源 Ingest",
     "22 個來源的 Source ID、URL、發布日、擷取日與限制。"),
    ("02-knowledge-base.md", "D3 Knowledge Base", "D3 遊戲知識庫",
     "31 欄位 schema、18 款案例、缺值一律 N/A 的規則。"),
    ("03-data-analysis.md", "D4 Data Analysis", "D4 資料分析",
     "Award Index 偏態、Tier 錯位、類型平均與缺值結構。"),
    ("04-knowledge-graph.md", "D5 Knowledge Graph", "D5 知識圖譜",
     "72 節點／145 邊的索引圖，六種實體與邊的語意。"),
    ("05-html-spec.md", "D6 HTML Spec", "D6 HTML 規劃",
     "為何先 Wiki 後 HTML、12 章結構、build 流程。"),
    ("06-loop-graph.md", "Loop and Graph", "Loop／Graph 紀錄",
     "九節點循環、重複步驟、檢查點與實際修正紀錄。"),
    ("07-reflection.md", "Reflection", "反思",
     "最常出錯的節點、檢查如何前移、workflow 是否修改。"),
]

DATA_FILES = [
    ("games.json", "18 款案例 × 31 欄位：獎項拆解、Award Index、Tier、銷量／CCU、商業模式。"),
    ("sources.json", "22 張來源卡：Source ID、URL、發布日、擷取日、type、status 與限制。"),
    ("awards.json", "TGA 2021–2025 五屆典禮的獎項名單與入圍。"),
    ("edges.json", "133 條資料邊（build 產生）：遊戲 ↔ 類型、平台、獎項、來源。"),
]


def slug(page: str) -> str:
    """GitHub Wiki 的網址把頁名空白換成連字號。"""
    return page.replace(" ", "-")


def home_page() -> str:
    rows = "\n".join(
        f"| [{label}]({slug(page)}) | `{src}` | {desc} |"
        for src, page, label, desc in PAGES
    )
    data = "\n".join(
        f"- [`data/{n}`]({BLOB}/data/{n}) — {d}" for n, d in DATA_FILES
    )
    return f"""# Global Game Success Analysis Wiki

年度最佳 ≠ 市場第一？全球遊戲獎項、玩家表現與市場成功分析。

研究期間 **2021–2025** ｜ 資料擷取日 **2026-11-25** ｜ 18 款案例 ｜ 22 個來源 ｜ 133 條資料邊

這是知識庫本體：從研究設計、來源 Ingest、案例知識庫、資料分析、知識圖譜，
到 HTML 規格、Loop／Graph 執行紀錄與反思。內容與 `wiki/*.md` 同步。

## 交付物

| 頁面 | 原始檔 | 內容 |
|---|---|---|
{rows}

## 結構化資料

{data}

## 兩個出口

- **教學簡報（GitHub Pages）**：[{SITE}]({SITE}) — 單一 HTML、可離線、12 章互動。
- **Wiki 目錄頁（Pages）**：[{SITE}/wiki/]({SITE}/wiki/) — 卡片式入口。
- **原始碼**：[github.com/{REPO}](https://github.com/{REPO})

## 資料流

```
取得資料 → 來源卡／claim → 正規化 → schema 檢查 → data/*.json → tools/build.py → index.html
```

Wiki 是可驗證的知識層，簡報是它的投影。畫面上不出現資料檔裡沒有的數字；
缺失值在資料層就是 `null`，畫面顯示 N/A。
"""


def sidebar() -> str:
    links = "\n".join(f"- [{label}]({slug(page)})" for _, page, label, _ in PAGES)
    return f"""### [Global Game Success Analysis Wiki](Home)

**交付物**

{links}

**資源**

- [結構化資料]({BLOB}/data)
- [教學簡報]({SITE})
- [Wiki 目錄頁]({SITE}/wiki/)
"""


def footer() -> str:
    return (
        f"Global Game Success Analysis Wiki ｜ 研究期間 2021–2025 ｜ 資料擷取日 2026-11-25 ｜ "
        f"[教學簡報]({SITE}) ｜ [程式碼](https://github.com/{REPO})"
    )


def build() -> list[Path]:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    written: list[Path] = []
    for src, page, _label, _desc in PAGES:
        source = WIKI_SRC / src
        if not source.is_file():
            sys.exit(f"FAIL: 找不到 {source.relative_to(ROOT)}")
        text = source.read_text(encoding="utf-8")
        if not text.strip():
            sys.exit(f"FAIL: {src} 是空的")
        target = OUT / f"{page}.md"
        target.write_text(text, encoding="utf-8", newline="\n")
        written.append(target)

    (OUT / "Home.md").write_text(home_page(), encoding="utf-8", newline="\n")
    (OUT / "_Sidebar.md").write_text(sidebar(), encoding="utf-8", newline="\n")
    (OUT / "_Footer.md").write_text(footer(), encoding="utf-8", newline="\n")
    written += [OUT / "Home.md", OUT / "_Sidebar.md", OUT / "_Footer.md"]
    return written


def git(args: list[str], cwd: Path | None = None, check: bool = True):
    return subprocess.run(["git", *args], cwd=cwd, text=True,
                          capture_output=True, check=check)


def push() -> int:
    url = f"https://github.com/{REPO}.wiki.git"
    with tempfile.TemporaryDirectory(prefix="wiki-sync-") as tmp:
        clone = git(["clone", "--depth", "1", url, tmp], check=False)
        if clone.returncode != 0:
            print(clone.stderr.strip(), file=sys.stderr)
            print(
                f"\nFAIL: 無法 clone {url}\n"
                "      該 repo 的 Wiki 還沒有任何頁面。請先在網頁按 "
                f"'Create the first page' 並儲存一次：{WIKI_WEB}",
                file=sys.stderr,
            )
            return 1

        dest = Path(tmp)
        for f in OUT.glob("*.md"):
            shutil.copy2(f, dest / f.name)

        git(["add", "-A"], cwd=dest)
        if git(["status", "--porcelain"], cwd=dest).stdout.strip():
            msg = "Sync wiki pages from wiki/*.md"
            git(["-c", "user.name=wiki-sync", "-c", "user.email=wiki-sync@users.noreply.github.com",
                 "commit", "-m", msg], cwd=dest)
            result = git(["push", "origin", "HEAD"], cwd=dest, check=False)
            if result.returncode != 0:
                print(result.stderr.strip(), file=sys.stderr)
                print("FAIL: push 失敗（權限或認證）。", file=sys.stderr)
                return 1
            print(f"OK: pushed {len(list(OUT.glob('*.md')))} pages to {url}")
        else:
            print("OK: wiki 已是最新，沒有變更需要推送。")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="同步 wiki/*.md 到 GitHub Wiki")
    ap.add_argument("--push", action="store_true", help="clone、commit 並 push 到 wiki repo")
    args = ap.parse_args()

    written = build()
    print(f"OK: wrote {len(written)} files to {OUT.relative_to(ROOT)}")
    for f in written:
        print(f"  - {f.name} ({f.stat().st_size:,} bytes)")

    if not args.push:
        print("\n提示：加上 --push 才會推上 GitHub Wiki。")
        return 0
    return push()


if __name__ == "__main__":
    raise SystemExit(main())
