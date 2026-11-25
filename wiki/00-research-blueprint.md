# Deliverable 1 — Research Blueprint

> 專案：**Global Game Success Analysis Wiki**
> 中文：**年度最佳 ≠ 市場第一？全球遊戲獎項、玩家表現與市場成功分析**
> 研究期間：2021-01-01 – 2025-12-31（2026 年資料僅作補充快照）
> 資料擷取日：2026-11-25

---

## 1. 研究緣起

每年 The Game Awards（TGA）公布 Game of the Year（GOTY）之後，媒體常把「年度最佳」與「市場最成功」混為一談。但這兩個判斷建立在不同的證據上：

- 獎項是**評審制度**的產物（TGA 的 GOTY 由評審 90% ＋公眾 10% 決定）。
- 市場成功是**玩家行為與付費**的產物，且口徑至少有 CCU、DAU、MAU、銷量、bookings、revenue 六種，彼此不可替換。

因此本研究的核心問題不是「誰最成功」，而是：

> **當我們說一款遊戲「成功」時，我們到底在量什麼？獎項訊號與市場訊號在什麼情況下一致、在什麼情況下分離？**

## 2. 研究目的

1. 理解全球遊戲產業與年度遊戲獎項的評選制度。
2. 建立遊戲成功的多維度評估架構（評價／玩家／商業／長期）。
3. 分析不同類型、平台與地區的玩家表現差異。
4. 比較年度獎項與實際市場表現之間的關係。
5. 探討玩家喜愛與商業成功的可能因素（不作因果宣稱）。
6. 以 Knowledge Graph 建立遊戲、獎項、平台、來源之間的索引關係。
7. 將研究成果轉化為可離線瀏覽的互動教學 HTML。

## 3. 研究問題

| 編號 | 研究問題 | 對應分析 |
|---|---|---|
| RQ1 | 2021–2025 的大獎訊號，與可公開核對的市場數據呈現什麼關係？ | 分析 A、2×2 矩陣 |
| RQ2 | 高玩家量體是否代表高商業表現？ | 分析 B |
| RQ3 | 不同遊戲類型的獎項、量體與商業模式有何差異？ | 分析 C |
| RQ4 | 長期營運（更新、賽季、電競、社群）能否被數據捕捉？ | 分析 D |
| RQ5 | 在資料大量缺失的情況下，應該補值還是留白？ | 分析 E、模擬器 |

## 4. 研究範圍

| 項目 | 範圍 |
|---|---|
| 期間 | 2021-01-01 – 2025-12-31；2026 資料標記為補充，不與未完成年度混算 |
| 地理 | 全球（但多數可核對數據偏北美／歐洲／東亞） |
| 平台 | PC、Console、Mobile、Cross-platform |
| 核心對象 | 多人線上、長期營運、具線上社群的遊戲 |
| 對照對象 | 年度最佳單人遊戲與其他代表性得獎作品 |
| 排除 | 純單機遊戲不歸類為線上遊戲，只作獎項與市場的對照 |

## 5. 研究方法

### 5.1 樣本設計（purposive sample）

18 款案例，**不是隨機抽樣**，而是依下列六類刻意選入，確保每個象限都有觀察點：

1. GOTY 得主：Elden Ring、Baldur's Gate 3、Astro Bot、Clair Obscur。
2. GOTY 入圍／分類獎：Helldivers 2、Final Fantasy XIV、Genshin Impact、Honkai: Star Rail。
3. 高玩家量體線上遊戲：League of Legends、Fortnite、Roblox、Minecraft。
4. 商業表現突出：Roblox、Minecraft、PUBG、CS2。
5. 長期營運：WoW、FFXIV、Dota 2、LoL、Rust。
6. 未獲 GOTY 但市場突出：CS2、Dota 2、PUBG、Apex Legends、Roblox。

類型涵蓋 MOBA、FPS、MMORPG、Battle Royale、Survival、Sandbox／UGC、Online RPG、RPG、Action RPG、Platformer、Third-person Shooter。

### 5.2 四維度架構

| 維度 | 主要指標 | 本專案實際可用資料 |
|---|---|---|
| Critical Success | TGA／BAFTA／Golden Joystick／DICE／GDC 得獎與入圍 | Award Index（0–110） |
| Player Success | DAU、MAU、CCU、下載、留存 | Audience Evidence Tier（0–5） |
| Commercial Success | 銷量、revenue、bookings、ARPU／ARPPU | 部分官方里程碑；其餘 N/A |
| Long-term Success | 壽命、更新頻率、電競、社群 | 上市年數＋post-launch support 等級 |

### 5.3 口徑規則（硬邊界）

1. CCU ≠ DAU ≠ MAU。
2. Revenue ≠ Bookings ≠ 獲利。
3. 下載／註冊 ≠ 活躍玩家。
4. Steam PC 數據 ≠ 全球跨平台玩家數。
5. 平台層級數據（Roblox）≠ 單一遊戲數據。
6. 不同統計期間的數字不直接比較。
7. 缺失一律 N/A，不以估算補洞。
8. 相關不等於因果；樣本不足以計算有意義的相關係數時就不算。

### 5.4 證據分級

| 等級 | 定義 | 例子 | 使用方式 |
|---|---|---|---|
| A | 官方 API、SEC 申報、官方平台快照 | Steam CCU API、Roblox 10-K | 可直接引用，仍須註明口徑 |
| B | 官方公告的可靠轉述、發行商里程碑 | 30M copies、24M registered | 可用，標註二手轉述 |
| C | 可信第三方估算 | 部分 2026 銷量／營收估算 | 不進主表，只作背景 |
| D | 無公開可比較數據 | LoL、Fortnite、WoW 的全球 DAU | 標 N/A |

### 5.5 分析與建模規則

- Award Index 與成功模擬器都是**研究者設定的教學模型**，不是官方評分。
- 複合分數必須公開公式、權重與敏感度。
- 缺值維度不補 0，而是在可用維度上重新分配權重，並顯示覆蓋率。

## 6. 資料來源規劃

### 基礎五源

| 編號 | 來源 | 用途 |
|---|---|---|
| S01 | Newzoo Global Games Market Report 2026 | 全球市場規模、平台與區域結構（背景） |
| S02 | Roblox 2025 Form 10-K（SEC） | 平台 DAU、bookings、revenue、net loss |
| S03 | PMC10197035 學術論文 | 獎項／評論／品牌與銷售關聯的理論依據 |
| S13／S22 | SteamDB FAQ／charts | 方法論參考（禁止爬取，不取數） |
| S11／S12 | Steam 官方 charts 與 CCU API | PC 同時在線快照 |

### 延伸來源

- TGA 2021–2025（S04–S08）、BAFTA（S09）、Golden Joystick（S10）。
- Elden Ring、BG3、Helldivers 2、Clair Obscur、Astro Bot、Minecraft、FFXIV 的 Wikipedia 交叉核對（S14–S20）。
- TGA 官方 FAQ（S21）與 SteamDB charts（S22）皆因 403／禁止爬取而標記為 blocked，不作數據來源。

### 優先順序

Level 1 官方／監管 → Level 2 學術 → Level 3 可信第三方統計 → Level 4 專業媒體。

## 7. 交付物對照

| 交付物 | 內容 | 檔案 |
|---|---|---|
| D1 Research Blueprint | 本文件 | `wiki/00-research-blueprint.md` |
| D2 Ingest Report | 22 個來源卡與摘錄 | `wiki/01-ingest-report.md` |
| D3 Game Knowledge Base | 18 款案例、schema、獎項帳本 | `wiki/02-knowledge-base.md`、`data/games.json` |
| D4 Data Analysis | 四類分析、模擬器、敏感度 | `wiki/03-data-analysis.md` |
| D5 Knowledge Graph | 節點與關係定義 | `wiki/04-knowledge-graph.md` |
| D6 Interactive HTML | 12 章教學簡報 | `index.html`、`wiki/05-html-spec.md` |
| D7 README | 專案說明與 QA | `README.md` |
| Loop／Graph 與反思 | 工作流設計與執行紀錄 | `wiki/06-loop-graph.md`、`wiki/07-reflection.md` |

## 8. 已知限制

1. **選擇偏差**：18 款是目的取樣，不能推論全體遊戲。
2. **量體偏誤**：可公開數據的遊戲多為大型作品，小型作品幾乎沒有可比較口徑。
3. **平台偏誤**：Steam CCU 只覆蓋 PC；主機與行動玩家數多半不公開。
4. **時間偏誤**：2025 年遊戲的 2026 獎項與後續銷量被排除，Award Index 對新作不利。
5. **權重任意性**：Award Index 與模擬器權重是教學選擇，換一組權重排名就變。
6. **二手轉述**：部分獎項與銷量依賴 Wikipedia 與官方公告轉述，已逐筆標記。
