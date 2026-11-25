# Global Game Success Analysis Wiki

**年度最佳 ≠ 市場第一？全球遊戲獎項、玩家表現與市場成功分析**

一份以 LLM Wiki 為知識庫、再投影成互動教學簡報的專案。研究期間 **2021–2025**，資料擷取日 **2026-11-25**。全部內容以繁體中文撰寫，專業名詞保留英文。

---

## 1. 這是什麼

不是遊戲排行榜，而是一套「怎麼判斷遊戲成功」的教材：

- 把「成功」拆成 **Critical／Player／Commercial／Long-term** 四個維度。
- 用 **Award Index（0–110）** 量化 2021–2025 的 TGA／BAFTA／Golden Joystick／DICE／GDC 訊號。
- 用 **Audience Evidence Tier（0–5）** 描述可公開核對的玩家量體，並明示它是 ordinal rubric，不是全球市場規模。
- 18 款案例、22 個來源、72 節點知識圖譜、可調權重的教學模擬器、8 題測驗。

## 2. 如何開啟

**直接開檔**：雙擊 `index.html`，或拖進瀏覽器。單一檔案、資料內嵌、不需要伺服器、不需要網路。

**用本機伺服器**（選用）：

```bash
py -m http.server 8765 --bind 127.0.0.1
# 開 http://127.0.0.1:8765/index.html
```

**重新建置**（修改 `src/` 或 `data/` 之後）：

```bash
py tools/build.py
```

> Windows 上若 `python` 無反應，請用 `py`。build 失敗會以 exit code 1 中止，不會產生半成品。

## 3. 網站功能

| 功能 | 位置 | 說明 |
|---|---|---|
| 12 章導覽 | 左側 sidebar | 桌機固定、手機抽屜、skip link |
| 全域搜尋 | 右上搜尋框 | 遊戲／來源／獎項；`Ctrl/⌘ + K` 聚焦、↑↓ 移動、Esc 關閉 |
| 案例資料庫 | 05 章 | 搜尋、類型／平台篩選、5 種排序、只看有獎／服務型 |
| 比較器 | 05 章 | 最多 3 款、20 列欄位、可從詳情 modal 加入 |
| 圖表 | 03／04／06／08 章 | Award、Tier、散點、類型平均、模擬前五；純 SVG，無外部函式庫 |
| Knowledge Graph | 07 章 | 72 節點／145 邊、拖曳、鍵盤選取、類型篩選、節點詳情 |
| 成功權重模擬器 | 08 章 | 四軸滑桿＋4 組 preset、缺值重新分配、敏感度表 |
| 測驗 | 11 章 | 8 題、即時批改、每題解釋、重設 |
| 來源追溯 | 全站 | 每個 `Sxx` chip 可跳到來源卡並展開 |
| 列印／PDF | 右上按鈕 | 白底、隱藏導覽與按鈕 |

## 4. 檔案地圖

```
index.html                 # 最終成果：單一 HTML（由 build 產生）
README.md
data/
  games.json               # 18 款案例、31 欄位
  sources.json             # 22 個來源卡
  awards.json              # TGA 2021–2025
  edges.json               # 133 條資料邊（build 產生）
src/
  head.html                # <head>
  styles-01-base.css       # 變數、版面、字體
  styles-02-components.css # 卡片、表格、圖表、modal
  styles-03-responsive.css # 斷點、列印、reduced motion
  body-01-shell.html       # sidebar、topbar、ch1–ch4
  body-02-chapters.html    # ch5–ch8
  body-03-chapters.html    # ch9–ch12、footer、modal
  app-01-core.js           # 資料常數、Tier、四維分數、工具
  app-02-render.js         # 來源卡、TGA 時間軸、Award／Tier 圖、市場表
  app-03-games.js          # 遊戲卡、篩選、比較器、modal、散點圖
  app-04-graph.js          # 圖譜建圖、力導向、拖曳、篩選
  app-05-sim-quiz.js       # 模擬器、敏感度、測驗
  app-06-init.js           # 搜尋、導覽、事件綁定、初始化
tools/
  build.py                 # 驗證 → 產生 edges → 合併成 index.html
wiki/
  index.html               # Wiki 目錄頁（GitHub Pages 入口）
  00-research-blueprint.md # D1 研究計畫
  01-ingest-report.md      # D2 來源整理
  02-knowledge-base.md     # D3 遊戲知識庫
  03-data-analysis.md      # D4 資料分析
  04-knowledge-graph.md    # D5 圖譜設計
  05-html-spec.md          # D6 HTML 規劃
  06-loop-graph.md         # Loop／Graph 與執行紀錄
  07-reflection.md         # 反思
```

## 5. 核心公式

**Award Index（教學模型，上限 110）**

```
TGA GOTY 勝 40／入圍 15
+ TGA 其他獎 勝 6（上限 24）
+ BAFTA Best Game 勝 20／入圍 6
+ Golden Joystick Ultimate GOTY 勝 10
+ DICE GOTY 勝 8
+ GDC GOTY 勝 8
```

**Audience Evidence Tier（ordinal，不是市場規模）**

| Tier | 規則（任一） |
|---|---|
| 5 | ≥100M active／registered 或 ≥300M copies |
| 4 | 20–99.9M 或 ≥500k Steam CCU |
| 3 | 5–19.9M 或 200–499k CCU |
| 2 | 1–4.9M 或 50–199k CCU |
| 1 | <1M 或 <50k CCU |
| 0 | 無公開可比較數據（留白，不是 0 玩家） |

**成功模擬器**

```
Score = Σ(w_d × s_d) / Σ w_d   （只對 available 的維度求和）
Critical = Award Index ÷ 110 × 100
Reach    = Tier × 20
Commercial = log10(copies) ÷ log10(300) × 100（或 bookings／revenue 的對數）
Long-term  = min(70, 年數 ÷ 20 × 70) + 支援（30／15／0）
預設權重：35／25／20／20
```

## 6. 資料來源

主要來源（完整 22 筆見網站 12 章與 `wiki/01-ingest-report.md`）：

- Newzoo Global Games Market Report 2026（僅背景，2026F）
- Roblox Corporation 2025 Form 10-K（SEC）
- Flawless victory!（PMC10197035，351 款歐洲樣本）
- The Game Awards 2021–2025
- BAFTA Games Awards、Golden Joystick Awards
- Steam 官方 Most Played 與 GetNumberOfCurrentPlayers API
- SteamDB FAQ（僅方法論；charts 禁止爬取）
- Elden Ring、BG3、Helldivers 2、Clair Obscur、Astro Bot、Minecraft、FFXIV 的 Wikipedia 交叉核對

**受阻來源**：TGA 官方 FAQ（S21）回 403、SteamDB charts（S22）禁止爬取，兩者皆只作為方法論／轉述標註，未取任何數值。

## 7. 研究限制

1. 18 款為目的取樣，不能推論全體遊戲。
2. 公開數據偏大型作品與西方／PC 市場；Genshin、HSR、Fortnite、LoL、WoW 皆為 Tier 0。
3. 缺值具系統性：11 款無 Commercial 分數，不是隨機缺失。
4. Award Index 與 Tier 都是自建 rubric，不是官方指標。
5. 2026 資料僅補充，不與 2021–2025 混算。
6. 無留存率、ARPU、更新頻率，無法做縱向或因果分析。
7. 相關不等於因果；樣本不足時不計算相關係數。

## 8. 建置與 QA 結果（2026-11-25）

```
OK: wrote index.html (212,617 bytes)
OK: 18 games, 22 sources, 5 ceremonies, 133 edges
```

| 檢查 | 結果 |
|---|---|
| Console | 0 error、0 failed request |
| 章節／遊戲／來源 | 12／18／22 |
| 圖表列數 | Award 18、Tier 6、Scatter 18、Genre 12、Sim 5 |
| 圖譜 | 72 nodes／145 edges |
| 搜尋 `Elden` | 6 筆 |
| 篩選 MMORPG | 2 款 |
| 比較器 | 3/3、4 欄、20 列、焦點保留 |
| 模擬器（市場優先） | Roblox 82.0、Minecraft 81.8、BG3 72.4 |
| 測驗 | 1 題作答 → 1/8，8 題解釋顯示 |
| 375×812 | `scrollWidth` 360 ≤ 375 |

本輪修正：3 處簡體字、比較器焦點丢失、375px 横向溢出。詳細紀錄見 `wiki/06-loop-graph.md`。

**未執行**：跨瀏覽器（僅 Chromium）、實機觸控、螢幕閱讀器實測、列印成品目視檢查。

## 9. 交付物對照

| 交付物 | 檔案 |
|---|---|
| D1 Research Blueprint | `wiki/00-research-blueprint.md` |
| D2 Ingest Report | `wiki/01-ingest-report.md` |
| D3 Game Knowledge Base | `wiki/02-knowledge-base.md`、`data/games.json` |
| D4 Data Analysis | `wiki/03-data-analysis.md` |
| D5 Knowledge Graph | `wiki/04-knowledge-graph.md` |
| D6 Interactive HTML | `index.html`、`wiki/05-html-spec.md` |
| D7 README | 本文件 |
| Loop／Graph 與反思 | `wiki/06-loop-graph.md`、`wiki/07-reflection.md` |

## 10. 授權與素材

- 程式碼與文字：本專案自行撰寫。
- 不使用外部圖片、外部字型、外部 JS/CSS，因此無圖片授權與失效 fallback 問題。
- 引用之數據與獎項名單，著作權屬原發布者；網站與文件中均保留原始 URL 與擷取日。
- 遊戲名稱與商標屬各發行商所有，本專案僅作研究與教學引用。
