# Deliverable 2 — Ingest Report

> 擷取日：2026-11-25 ｜ 來源總數：22 ｜ 可引用主來源：18 ｜ 受限／禁止：2（S21、S22）
> 對應資料：`data/sources.json`

---

## 1. Ingest 流程

每一筆來源都先變成一張「來源卡」，通過欄位檢查後才允許被引用：

```
來源卡（URL／發布日／擷取日／type／period／status／用途／限制）
      ↓ 通過
主張層（claim：數字 + source ID + asOf + 口徑）
      ↓ 通過
正規化（單位、年度、平台、去重）
      ↓ 通過
寫入 data/*.json → build 驗證 → 才進 HTML
```

**狀態定義**

| status | 意義 | 可否進主表 |
|---|---|---|
| `verified-primary` | 官方 API／申報／官方頁面 | 可 |
| `verified-primary-landing` | 官方獎項總覽頁 | 可（僅機制與名單） |
| `verified-secondary` | Wikipedia 等可靠轉述 | 可，標註轉述 |
| `used-as-context-only` | 背景脈絡（如 2026 預測） | 不可作個案數據 |
| `supplement-only` | 補充快照（如 2026 Steam CCU） | 可，標記期間 |
| `methodology-only` | 只引用方法論 | 不可取數 |
| `blocked-403` | 站方回 403 | 不可 |
| `blocked-and-disallowed` | 站方明示禁止爬取 | 不可 |

## 2. 來源卡總表

| ID | 來源 | 發布者 | 發布日 | 期間 | 狀態 | 主要用途 |
|---|---|---|---|---|---|---|
| S01 | Newzoo Global Games Market Report 2026 | Newzoo | 2026-08-13 | 2026F | 背景 | 全球市場規模、平台與區域結構 |
| S02 | Roblox 2025 Form 10-K | Roblox／SEC | 2026-02 | 2025 全年 | 官方 | 平台 DAU、bookings、revenue、net loss |
| S03 | Flawless victory!（PMC10197035） | Electronic Markets | 2023-05-19 | 2010–2015 歐洲 | 官方（學術） | 獎項／評論與銷售的理論基礎 |
| S04 | TGA 2021 winners & nominees | TGA／Wikipedia 轉述 | 2021-12-09 | 2021 | 二手核對 | GOTY、分類獎得主 |
| S05 | TGA 2022 winners & nominees | TGA／Wikipedia 轉述 | 2022-12-08 | 2022 | 二手核對 | GOTY、分類獎得主 |
| S06 | TGA 2023 winners & nominees | TGA／Wikipedia 轉述 | 2023-12-07 | 2023 | 二手核對 | GOTY、分類獎得主 |
| S07 | TGA 2024 winners & nominees | TGA／Wikipedia 轉述 | 2024-12-12 | 2024 | 二手核對 | GOTY、分類獎得主 |
| S08 | TGA 2025 winners & nominees | TGA／Wikipedia 轉述 | 2025-12-11 | 2025 | 二手核對 | GOTY、分類獎得主 |
| S09 | BAFTA Games Awards winners | BAFTA | 2025-04 | 2021–2025 | 官方（總覽頁） | Best Game 得獎／入圍 |
| S10 | Golden Joystick Awards | GamesRadar+ | 2025-11 | 2021–2025 | 二手核對 | Ultimate GOTY（公眾投票） |
| S11 | Steam Most Played（official charts） | Valve | 2026-11-25 | 2026-11-25 | 補充 | PC 同時在線排行 |
| S12 | Steam Web API GetNumberOfCurrentPlayers | Valve | 2026-11-25 | 2026-11-25 | 補充 | 單一 App 即時 CCU |
| S13 | SteamDB FAQ | SteamDB | N/A | N/A | 方法論 | CCU／peak 的口徑說明 |
| S14 | Elden Ring sales & awards | Wikipedia／FromSoftware 等 | 2025-04-29 | 2022–2025 | 二手核對 | 30M copies、獎項 |
| S15 | Baldur's Gate 3 sales & awards | Wikipedia／Larian 等 | 2025-12-31 | 2023–2025 | 二手核對 | 20M copies、獎項 |
| S16 | Helldivers 2 sales & awards | Wikipedia／Arrowhead、Sony | 2025-10-23 | 2024–2025 | 二手核對 | 15M copies、獎項 |
| S17 | Clair Obscur sales & awards | Wikipedia／Sandfall、Kepler | 2025-10 | 2025 | 二手核對 | 5M copies、獎項 |
| S18 | Astro Bot sales & awards | Wikipedia／Team Asobi、Sony | 2024-11-08 | 2024–2025 | 二手核對 | 1.5M copies、獎項 |
| S19 | Minecraft sales | Wikipedia／Mojang、Microsoft | 2023-10 | 2023 | 二手核對 | 300M copies |
| S20 | FFXIV registered players | Wikipedia／Square Enix | 2021-10 | 2021 | 二手核對 | 24M registered |
| S21 | TGA FAQ（嘗試） | The Game Awards | N/A | N/A | 403 受限 | 評選機制（改由轉述補） |
| S22 | SteamDB charts（嘗試） | SteamDB | N/A | N/A | 禁止爬取 | 不取數 |

## 3. 核心摘錄與研究價值

### S01 Newzoo（背景限定）

- 2026 預測市場規模 **$213.9B（+6.1%）**、全球玩家 **3.70B（+4.4%）**。
- 平台結構：Mobile **$121.1B／57%**、Console **$46.9B／22%**、PC **$45.9B／21%**。
- 區域結構：APAC **$100.7B／47%**、NA **$56.9B／27%**、Europe **$38.5B／18%**、LatAm **$9.3B／4%**、MEA **$8.5B／4%**。

**研究價值**：提供「全球市場很大、Mobile 佔一半以上」的尺度感。
**限制**：全部是 2026 預測，不可與 2021–2025 的實際獎項或個別遊戲數據混算，更不能推單一遊戲營收。

### S02 Roblox 2025 10-K

- 2025 平均 DAU **127M**。
- Revenue **$4,890,551K**、Bookings **$6,788,430K**、Net loss **$1,071,618K**。

**研究價值**：少數能同時看到 DAU、bookings、revenue 與虧損的官方口徑，是「營收 ≠ 獲利」的最佳教材。
**限制**：平台層級，不是單一遊戲；bookings 與 revenue 不可互換；DAU 不是 MAU。

### S03 學術論文（PMC10197035）

- 以 **351 款遊戲、歐洲市場**資料，檢驗 search qualities（品牌知名度、評論、獎項）與 experience qualities 對遊戲成功的預測力。
- 依變數偏向銷售表現。

**研究價值**：支持「獎項／評論與銷售有統計關聯，但不是唯一解釋」的研究假設。
**限制**：樣本為 2010–2015 歐洲買斷制市場，不可直接推論全球 F2P 線上遊戲或 2021–2025。

### S04–S08 TGA 2021–2025

| 年度 | GOTY | 典禮數據 | 備註 |
|---|---|---|---|
| 2021 | It Takes Two | 103 家媒體、85M streams、23.2M votes | FFXIV 拿下 Best Ongoing＋Best Community Support |
| 2022 | Elden Ring | 117 家媒體、103M streams、55M votes | FFXIV 連兩年雙獎；Genshin 拿 Players' Voice |
| 2023 | Baldur's Gate 3 | N/A | BG3 6 勝；HSR 拿 Best Mobile |
| 2024 | Astro Bot | N/A | Astro Bot 4 勝；Helldivers 2 拿 Best Ongoing＋Best Multiplayer |
| 2025 | Clair Obscur: Expedition 33 | 154 家媒體、171M streams、123M votes | Clair Obscur 9 勝；No Man's Sky 拿 Best Ongoing |

**機制**：GOTY 評審 **90%** ＋公眾 **10%**；Players' Voice 為 100% 公眾投票。
**資格**：2025 年為 11-21 前發行；DLC／重製可入圍。
**限制**：官方 FAQ（S21）回 403，機制與名單以 Wikipedia 轉述＋官方 URL 標註。

### S09 BAFTA／S10 Golden Joystick

- BAFTA Best Game 偏同業評審，2021–2025 名單用於 Award Index 的 20／6 分權重。
- Golden Joystick Ultimate GOTY 偏公眾投票，權重 10 分。

**研究價值**：讓 Award Index 不是「TGA 的一言堂」，而是多機制訊號的加權。
**限制**：不同典禮的年度歸屬不同（例如 BAFTA 2025 表揚 2024 年遊戲），已用 event 年份記錄。

### S11／S12 Steam 官方（補充快照）

2026-11-25 取得：CS2 **1,191,632**、PUBG **751,352**、Dota 2 **709,916**、Apex **236,918**、Rust **72,087**、BG3 **30,580**、Helldivers 2 **26,721**、Elden Ring **25,283**。

**研究價值**：唯一可即時重現的 PC 同時在線口徑。
**限制**：不是歷史峰值、不是 DAU／MAU、不是全球玩家數，且與 2021–2025 不同期，只作補充。

### S13 SteamDB FAQ／S22 SteamDB charts

- 只引用 FAQ 對 CCU、peak、player count 的方法論說明。
- charts 頁面明示禁止爬取且回 403，**未取任何數值**。

### S14–S20 遊戲層級交叉核對

| 遊戲 | 可引用里程碑 | asOf | 注意 |
|---|---|---|---|
| Elden Ring | 30M copies | 2025-03 | 官方里程碑轉述 |
| Baldur's Gate 3 | 20M copies | 2025-12 | 另有 15M＠2024，取較新且標註 |
| Helldivers 2 | 15M copies | 2024-11 | 2026 的 20M 說法不納入 |
| Clair Obscur | 5M copies | 2025-10 | 2026 的 8M 說法不納入 |
| Astro Bot | 1.5M copies | 2024-11 | 2026 的 4.3M 說法不納入 |
| Minecraft | 300M copies | 2023 | 2026 的 400M 說法不納入 |
| FFXIV | 24M registered | 2021-10 | registered ≠ 活躍訂閱 |

## 4. 來源之間的差異與矛盾（不強行擇一）

1. **FFXIV 24M**：是註冊帳號，不是同時在線或訂閱數；與 Steam CCU 不可比。
2. **BG3 15M vs 20M**：不同時間點的官方里程碑；主表採 20M＠2025-12，並在 caveat 說明。
3. **Minecraft 300M vs 400M**：後者為 2026 說法，超出研究期間，不納入。
4. **TGA 典禮媒體數**：2023、2024 缺公開數字，標 N/A，不以推估補齊。
5. **Roblox revenue 與 bookings**：兩者差約 $1.9B，正是「不可混用」的實例。

## 5. 受阻與替代路徑

| 來源 | 問題 | 處理 |
|---|---|---|
| S21 TGA FAQ | HTTP 403 | 停止抓取；改用 Wikipedia 轉述＋官方 URL，並在來源卡標 `blocked-403` |
| S22 SteamDB charts | 明示禁止爬取、403 | 停止請求；只引用 FAQ 方法論；CCU 改 Steam 官方 API |
| S01 Newzoo 詳細頁 | 部分內容需登入 | 只用公開摘要數字，標記為背景 |

## 6. Ingest 結論

- 22 個來源中，真正能支撐「數字」的主來源是 S02、S11、S12、S14–S20；其餘支撐機制、名單或背景。
- 三個最大缺口：**亞洲／行動平台玩家數**、**單一遊戲 revenue／ARPU**、**留存率**。這三項全部標 N/A，不用估算補洞。
- 缺口本身就是研究發現：公開數據的形狀，決定我們能看到哪一種成功。
