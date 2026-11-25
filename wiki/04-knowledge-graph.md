# Deliverable 5 — Knowledge Graph

> 節點 72 ｜ 邊 145（資料邊 133 ＋ 中心索引邊 12）｜ 來源：`data/edges.json`、`tools/build.py`
> 這是一張**索引圖**（誰連到誰），不是因果圖。

---

## 1. 節點類型（Entities）

| 類型 | 數量 | ID 形式 | 說明 |
|---|---:|---|---|
| center | 1 | `center` | 視覺錨點，不是資料實體 |
| game | 18 | `game:bg3` | 每款案例 |
| genre | 12 | `genre:RPG` | 主類型 |
| platform | 6 | `platform:PC` | PC／Console／Mobile／PS5／Xbox Series／VR |
| award | 17 | `award:tga2023` | 依 breakdown 的 event 去重 |
| source | 18 | `source:S15` | 只收被遊戲引用過的來源（22 個來源中 18 個被引用） |

節點總數：1 + 18 + 12 + 6 + 17 + 18 = **72**。

## 2. 關係類型（Relationships）

| 關係 | 方向 | 起點 → 終點 | 邊數 |
|---|---|---|---:|
| `genre` | Game → Genre | 遊戲屬於某類型 | 18 |
| `platform` | Game → Platform | 遊戲發行於某平台 | 39 |
| `award` | Game → Award | 遊戲在某屆典禮得獎／入圍 | 31 |
| `source` | Game → Source | 遊戲數據可追溯的來源 | 45 |
| `hub` | Center → Genre | 只為視覺導覽而加的索引邊 | 12 |

合計 133 條資料邊；加上 12 條 hub 邊，畫面上是 145 條。

**方向性**：所有邊都是「遊戲 → 屬性」的單向邊，代表「這款遊戲有這個屬性」。反向查詢（例如「哪些遊戲屬於 RPG」）由前端在鄰居查詢時反轉，不另外存反向邊，避免資料重複。

## 3. 圖是怎麼生成的

`tools/build.py` 的 `make_edges()`：

```
for 每款 game:
    game → genre:<主類型>
    for platform in platforms:  game → platform:<platform>
    for source in sources:      game → source:<sourceID>
    for award in awardBreakdown:
        game → award:<event 正規化>   權重 = 該獎項分數
```

正規化規則：event 轉小寫、去空白、去 `'`，例如 `TGA 2023` → `award:tga2023`、`Golden Joystick 2025` → `award:goldenjoystick2025`。

**為什麼用 event 當節點，而不是 category？**
因為 category 有 20 多種且高度重複（Best RPG 會出現在多屆），用 event 可以讓「同一年度的典禮」成為可比較的樞紐，也讓 Award Index 的來源可追溯。代價是類別細節要看節點詳情或遊戲 modal。

## 4. 可探索的路徑範例

**路徑 1：獎項如何連到市場**
`BG3 → award:tga2023（40 分）→ 同一節點也連到其他得主／入圍者`
缺點：目前 award 節點只連遊戲，不連「獎項 → 類別」。這是刻意的簡化。

**路徑 2：類型聚類**
`game:eldenring → genre:Action RPG`，`game:bg3 → genre:RPG`，`game:clair → genre:RPG`
→ 可以看出 RPG 是本期 Award Index 最集中的類型。

**路徑 3：來源追溯**
`game:roblox → source:S02` → 節點詳情顯示 SEC 10-K、發布日、限制。
→ 每個數字都能回到來源卡，這是整個 Wiki 的品質底線。

**路徑 4：平台分布**
`platform:Mobile` 連到 Roblox、Minecraft、Fortnite、Genshin、HSR。
→ 可以看到「行動平台的作品有 3 款是 Tier 0」，直接暴露數據缺口。

## 5. 在 HTML 中如何操作

| 操作 | 行為 |
|---|---|
| 點節點 | 右側面板顯示類型、連線數、相鄰節點；遊戲節點可開完整詳情 |
| Tab 鍵 | 在節點間移動（每個節點都是 `role="button"`、`tabindex="0"`） |
| Enter／Space | 選取節點 |
| 拖曳 | 以 pointer 事件移動節點，邊即時重繪 |
| 類型下拉 | 只顯示 game／genre／award／source／platform |
| 搜尋 | 符合的節點加 `match`、其餘 `dim`，邊只在兩端都可見時顯示 |
| 重設 | 回到全圖並選取中心節點 |

## 6. 圖譜的限制

1. **不是完整遊戲市場圖**：只有 18 款樣本，沒有 developer、publisher、region、business model 節點。
2. **邊沒有時間維度**：2021 與 2025 的邊長得一樣。
3. **award 節點混合得獎與入圍**：邊的權重有分數，但視覺粗細沒有依權重縮放。
4. **hub 邊不是資料**：中心到類型的 12 條邊只是導覽用，計算節點度數時應排除。
5. **沒有遊戲之間的直接邊**：兩款遊戲的關係只能透過共享的類型／平台／獎項／來源間接表達。

## 7. 為什麼要圖譜，而不是只做表格？

表格回答「這款遊戲有什麼」，圖譜回答「哪些東西被同一組屬性連在一起」。例如：

- 表格看不出「CS2、Dota 2、PUBG 都靠同一個 Steam CCU 口徑」。
- 圖譜一看就知道這三款都連到 `source:S11`／`S12`，因此它們的「Tier 4」是同一種證據，不能當成三種獨立觀察。

這就是圖譜在教學上的價值：**它讓資料的來源結構變得可見**。
