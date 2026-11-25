# Deliverable 3 — Game Knowledge Base

> 18 款案例 ｜ 資料檔：`data/games.json` ｜ 獎項檔：`data/awards.json` ｜ 擷取日：2026-11-25
> 所有缺失值一律 `N/A`，結構化欄位中為 `null`，不以 0 或估算值替代。

---

## 1. Schema 定義

| 欄位 | 型別 | 單位／口徑 | 必填 | 缺失處理 |
|---|---|---|---|---|
| `id` | string | slug | ✔ | — |
| `name` / `zh` | string | 英文原名／繁中名 | ✔ | — |
| `year` | int | 上市年 | ✔ | — |
| `genre` | string | 主類型（單一） | ✔ | — |
| `subgenres` | string[] | 子類型標籤 | ✔ | — |
| `platforms` | string[] | PC／Console／Mobile／PS5／Xbox Series／VR | ✔ | — |
| `businessModel` | string | F2P、買斷、訂閱、Battle Pass 等 | ✔ | — |
| `developer` / `publisher` | string | 開發／發行 | ✔ | — |
| `awardIndex` | int | 0–110，教學模型 | ✔ | 0 代表本期無大獎訊號 |
| `awardBreakdown` | object[] | event／category／result／points | ✔ | 空陣列＝無紀錄 |
| `salesCopies` | number? | 百萬 copies | ✔ | `null` |
| `registeredPlayers` | number? | 百萬註冊帳號 | ✔ | `null` |
| `dau` | number? | 百萬 DAU | ✔ | `null` |
| `ccu` | int? | Steam PC 同時在線 | ✔ | `null` |
| `revenueB` / `bookingsB` / `netLossB` | number? | 十億美元 | ✔ | `null` |
| `marketTier` | int | 0–5 ordinal 證據等級 | ✔ | 0＝無可比數據 |
| `marketMetric` / `marketValue` / `marketUnit` / `marketAsOf` | string／number／string／string | 口徑說明、數值、單位、截止日 | ✔ | `N/A` |
| `marketNote` | string | 為什麼是這個口徑 | ✔ | — |
| `longevityYears` | int | 上市至 2025-12-31 的年數 | ✔ | 0 |
| `liveService` | bool | 是否長期營運 | ✔ | — |
| `postLaunchSupport` | enum | strong／moderate／none | ✔ | — |
| `evidenceGrade` | enum | A／B／C／D | ✔ | — |
| `sources` | string[] | 來源 ID | ✔ | 至少一個 |
| `summary` / `caveat` | string | 摘要／限制 | ✔ | — |
| `tags` | string[] | 搜尋標籤 | ✔ | — |

## 2. 18 款案例總表

| 遊戲 | 年 | 類型 | 平台 | Award | Tier | 市場口徑值 | 壽命 | 證據 | 來源 |
|---|---|---:|---|---|---:|---:|---|---:|---|---|
| 英雄聯盟 League of Legends | 2009 | MOBA | PC | 6 | 0 | N/A | 16 | D | S04, S21 |
| Dota 2 | 2013 | MOBA | PC | 0 | 4 | 709,916 CCU（2026-11-25） | 12 | A | S11, S12 |
| 絕對武力 2 Counter-Strike 2 | 2023 | FPS | PC | 0 | 4 | 1,191,632 CCU（2026-11-25） | 2 | A | S11, S12 |
| 要塞英雄 Fortnite | 2017 | Battle Royale | PC/Console/Mobile | 0 | 0 | N/A | 8 | D | S21 |
| 絕地求生 PUBG: Battlegrounds | 2017 | Battle Royale | PC/Console | 0 | 4 | 751,352 CCU（2026-11-25） | 8 | A | S11, S12 |
| Apex 英雄 Apex Legends | 2019 | Battle Royale | PC/Console | 0 | 3 | 236,918 CCU（2026-11-25） | 6 | A | S11, S12, S04 |
| Roblox | 2006 | Sandbox / UGC | PC/Console/Mobile/VR | 0 | 5 | 127M DAU（2025，平台層級） | 19 | A | S02 |
| Minecraft | 2011 | Sandbox / Survival | PC/Console/Mobile | 0 | 5 | 300M copies（2023） | 14 | B | S19 |
| Rust | 2018 | Survival | PC/Console | 0 | 2 | 72,087 CCU（2026-11-25） | 7 | A | S11, S12 |
| 魔獸世界 World of Warcraft | 2004 | MMORPG | PC | 0 | 0 | N/A | 21 | D | S21 |
| Final Fantasy XIV | 2013 | MMORPG | PC/Console | 24 | 4 | 24M registered（2021-10） | 12 | B | S20, S04, S05 |
| 原神 Genshin Impact | 2020 | Online RPG | PC/Console/Mobile | 12 | 0 | N/A | 5 | D | S04, S05, S21 |
| 崩壞：星穹鐵道 Honkai: Star Rail | 2023 | Online RPG | PC/Console/Mobile | 6 | 0 | N/A | 2 | D | S06, S21 |
| 艾爾登法環 Elden Ring | 2022 | Action RPG | PC/Console | 90 | 4 | 30M copies（2025-03） | 3 | B | S14, S05, S09, S10, S12 |
| 柏德之門 3 Baldur's Gate 3 | 2023 | RPG | PC/Console | 110 | 4 | 20M copies（2025-12） | 2 | B | S15, S06, S09, S10, S12 |
| Astro Bot | 2024 | Platformer | PS5 | 94 | 2 | 1.5M copies（2024-11） | 1 | B | S18, S07, S09 |
| 光與影：33 號遠征隊 Clair Obscur | 2025 | RPG | PC/PS5/Xbox Series | 74 | 3 | 5M copies（2025-10） | 0 | B | S17, S08, S10 |
| 絕地戰兵 2 Helldivers 2 | 2024 | Third-person Shooter | PC/PS5/Xbox Series | 18 | 3 | 15M copies（2024-11） | 1 | B | S16, S07, S09, S12 |

## 3. 獎項帳本（Award Ledger）

Award Index 只加總「event／category／result」明確可核對的項目。

| 遊戲 | 得獎／入圍明細 | 小計 |
|---|---|---:|
| Baldur's Gate 3 | TGA 2023 GOTY 40＋TGA 2023 其他 5 勝 24＋BAFTA 2024 Best Game 20＋GJ 2023 10＋DICE 2024 8＋GDC 2024 8 | **110** |
| Astro Bot | TGA 2024 GOTY 40＋其他 3 勝 18＋BAFTA 2025 Best Game 20＋DICE 2025 8＋GDC 2025 8 | **94** |
| Elden Ring | TGA 2022 GOTY 40＋其他 3 勝 18＋BAFTA 2023 入圍 6＋GJ 2022 10＋DICE 2023 8＋GDC 2023 8 | **90** |
| Clair Obscur | TGA 2025 GOTY 40＋其他 8 勝 24（上限）＋GJ 2025 10 | **74** |
| Final Fantasy XIV | TGA 2021 Best Ongoing 6＋Best Community Support 6＋TGA 2022 同名兩獎 12 | **24** |
| Helldivers 2 | TGA 2024 Best Ongoing 6＋Best Multiplayer 6＋BAFTA 2025 入圍 6 | **18** |
| Genshin Impact | TGA 2021 Best Mobile 6＋TGA 2022 Players' Voice 6 | **12** |
| 英雄聯盟 | TGA 2021 Best Esports Game 6 | **6** |
| Honkai: Star Rail | TGA 2023 Best Mobile 6 | **6** |
| 其餘 9 款 | 2021–2025 無 TGA／BAFTA／GJ／DICE／GDC 大獎紀錄 | **0** |

**公式**（教學模型，非官方）：

```
Award Index = TGA GOTY(勝 40／入圍 15)
            + TGA 其他獎(勝 6，上限 24)
            + BAFTA Best Game(勝 20／入圍 6)
            + Golden Joystick Ultimate GOTY(勝 10)
            + DICE GOTY(勝 8)
            + GDC GOTY(勝 8)
            上限 110
```

## 4. 逐款筆記（摘要＋限制）

### 4.1 MOBA

- **英雄聯盟**：TGA 2021 Best Esports；Riot 未公開可核對的全球 MAU／DAU，Tier 0。**Tier 0 不是玩家少，是沒有可比口徑。**
- **Dota 2**：Award Index 0，但 Steam CCU 709,916（2026 補充），Tier 4；TI 與工作坊生態是長線資產。

### 4.2 FPS／Battle Royale

- **CS2**：CCU 1,191,632，Tier 4。依 Tier 規則，≥500k CCU 的類別上限就是 4，**不能因此說它等於 20M 銷量**。
- **PUBG**：CCU 751,352，Tier 4；PC 免費化後的長尾仍在。
- **Apex Legends**：CCU 236,918，Tier 3；曾是 TGA 2021 入圍名單的一部分，但本期無大獎。
- **Fortnite**：Epic 未公開可核對的全球 MAU／DAU，Tier 0；文化影響力與可量化市場數據之間有明顯落差。

### 4.3 Sandbox／UGC／Survival

- **Roblox**：2025 平均 DAU 127M（平台層級）、revenue $4.89B、bookings $6.79B、net loss $1.07B。**是平台，不是單一遊戲。**
- **Minecraft**：300M copies（2023），Tier 5；銷量不是玩家數，也不是營收。
- **Rust**：CCU 72,087，Tier 2；以定期 wipe 與社群伺服器維持循環。

### 4.4 MMORPG

- **魔獸世界**：21 年壽命、Award Index 0（本期無大獎），Tier 0；訂閱數與活躍玩家未公開。
- **FFXIV**：24M registered（2021-10）＋Award Index 24，是「服務型遊戲也能被獎項持續看見」的代表；但 registered ≠ 活躍訂閱。

### 4.5 Online RPG（亞洲行動／跨平台）

- **原神**：TGA 2021 Best Mobile＋2022 Players' Voice；miHoYo 未公開 MAU，Tier 0。
- **崩壞：星穹鐵道**：TGA 2023 Best Mobile；同樣無公開 MAU，Tier 0。

### 4.6 單機／買斷對照組

- **Elden Ring**：90／30M copies／Tier 4，是「獎項與銷量同向」的樣本。
- **Baldur's Gate 3**：110／20M copies／Tier 4，Award Index 上限案例。
- **Astro Bot**：94／1.5M copies／Tier 2，是「高獎項、低量體」的關鍵反例。
- **Clair Obscur**：74／5M copies／Tier 3，2025 年 9 勝，但 2026 BAFTA／DICE／GDC 不計入。
- **Helldivers 2**：18／15M copies／Tier 3，服務型遊戲的分類獎代表。

## 5. 缺失值統計

| 情況 | 數量 | 說明 |
|---|---:|---|
| 缺 Commercial 分數（無銷量／營收） | 11 | 多為 F2P 服務型；營收不公開 |
| Market Tier 0（無可比數據） | 5 | LoL、Fortnite、WoW、Genshin、HSR |
| 四維完整（覆蓋 4/4） | 7 | 全部是有公開銷量或平台財報的作品 |
| 覆蓋 3/4 | 6 | 如 FFXIV（有 registered、Tier、Award、Longevity） |
| 覆蓋 2/4 | 5 | 如 LoL、Fortnite、WoW（僅 Award／Longevity） |
| 留存率（Retention） | 0 | 全部 N/A，無公開可比較口徑 |

## 6. 資料檢查規則（build 會強制）

1. 必須剛好 18 款、id 唯一。
2. 五屆 TGA（2021–2025）齊備且順序正確。
3. 每款 31 個必填欄位齊全。
4. `awardIndex == sum(awardBreakdown.points)`。
5. `marketTier` 介於 0–5。
6. `sources` 只能引用存在的來源 ID。
7. `salesCopies`、`ccu` 不得為負。
8. `summary`、`caveat` 不得為空。
