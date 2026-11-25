# Deliverable 6 — Interactive HTML 規劃與實作對照

> 成果：`index.html`（單一檔案、離線可開、約 210 KB）
> 維護方式：`src/` 分檔 → `tools/build.py` 合併 → `index.html`

---

## 1. 為什麼要「先 Wiki、後 HTML」

如果先寫 HTML，資料會長成畫面的形狀：為了塞進一張卡而刪掉 caveat、為了圖表好看而補一個估算值。
本專案反過來：**資料先通過 schema 與 build 驗證，HTML 只是把資料投影成介面**。因此：

- 每一張遊戲卡、每一根長條、每一個圖譜節點，資料都來自 `data/*.json`。
- 畫面上不出現資料檔裡沒有的數字。
- 缺失值在資料層就是 `null`，畫面顯示 N/A，模擬器另行重新分配權重。

## 2. 12 章結構

| # | 章節 | 對應交付物 | 主要互動 |
|---|---|---|---|
| 01 | 研究問題與範圍（Hero） | D1 | 快速跳轉、四個統計數字 |
| 02 | 研究方法與來源 | D2 | 22 張來源卡、狀態篩選、來源搜尋 |
| 03 | 獎項機制與 Award Index | D3 | TGA 時間軸、18 款 Award 長條圖（可點） |
| 04 | 市場軸與證據等級 | D4 | Tier 分布圖、市場證據表、Steam 快照註記 |
| 05 | 18 款案例資料庫 | D3 | 搜尋、類型／平台篩選、排序、比較器（上限 3）、表格檢視 |
| 06 | 獎項 × 市場分析 | D4 | 散點圖（可點）、類型平均圖、2×2 矩陣 |
| 07 | Knowledge Graph | D5 | 72 節點力導向圖、拖曳、鍵盤、類型篩選、節點詳情 |
| 08 | 成功權重模擬器 | D4 | 四軸滑桿、四組 preset、缺值重分配、敏感度表 |
| 09 | Loop / Graph 工作流 | 作業要求 | 8 字循環 SVG、重複步驟表、檢查點表 |
| 10 | 執行與修正紀錄 | 作業要求 | 時間軸、錯誤→偵測→修正→預防表、QA 清單 |
| 11 | 測驗 | 教學設計 | 8 題、即時批改、每題解釋、重設 |
| 12 | 限制、反思、來源 | D7 | 六個限制卡、反思、22 筆來源追溯表 |

## 3. 互動功能對照

| 要求 | 實作 | 檔案 |
|---|---|---|
| 導覽列快速切換 | sidebar 12 章 anchor＋IntersectionObserver active；手機漢堡選單 | `body-01-shell.html`、`app-06-init.js` |
| 搜尋（遊戲／來源／獎項） | 全域搜尋，Ctrl/⌘+K 聚焦、↑↓ 移動、Esc 關閉 | `app-06-init.js` |
| 類型／平台篩選 | 5 個控制項（搜尋、類型、平台、排序、只看有獎／服務型） | `app-03-games.js` |
| 數據圖表 | SVG 長條圖（Award、Tier、Genre、Sim）、散點圖；無外部函式庫 | `app-02-render.js`、`app-03-games.js` |
| 遊戲比較器 | 最多 3 款、20 列欄位、可從 modal 加入／移除 | `app-03-games.js` |
| Knowledge Graph | 力導向布局、拖曳、鍵盤、filter、鄰居面板 | `app-04-graph.js` |
| 成功權重模擬器 | 四滑桿＋preset＋覆蓋率＋敏感度表 | `app-05-sim-quiz.js` |
| 互動測驗 | 8 題、批改、解釋、重設 | `app-05-sim-quiz.js` |
| 來源追溯 | 每張卡的 Sxx chip → 展開並高亮來源卡；來源表可外連 | `app-02-render.js` |

## 4. 設計系統

| 項目 | 選擇 |
|---|---|
| 風格 | 深色研究儀表板；青色（#5eead4）為主要 accent、琥珀（#fbbf24）為獎項訊號、紫（#c084fc）為平台 |
| 字體 | 系統字（Segoe UI／Noto Sans TC／system-ui），不載入外部字型（離線可用） |
| 版面 | 左側固定 sidebar（>980px）＋主內容；≤980px 收成抽屜 |
| 卡片 | 圓角 14–18px、細邊框、低對比漸層背景 |
| 圖表 | 手寫 SVG，`viewBox` 自適應；`<title>` 提供 hover 提示 |
| 圖片 | **不使用外部圖片**，因此沒有授權與失效 fallback 問題；視覺以 SVG／漸層／圖表構成 |
| 深色對比 | 文字 #e8eef6 on #0a1119，符合 WCAG AA 主文對比 |

## 5. 無障礙與鍵盤

- `skip-link` 跳至 `#main`。
- 所有互動元素為原生 `button`／`input`／`select`／`a`，或加上 `role="button"`＋`tabindex="0"`＋keydown 處理（圖表列、圖譜節點）。
- Modal：`role="dialog"`、`aria-modal`、Esc 關閉、Tab 焦點圈限、關閉後焦點回到觸發元素。
- `aria-live` 區域：搜尋結果數、比較器計數、模擬器覆蓋率、測驗結果、toast。
- 圖表以 `aria-hidden` 隱藏裝飾 SVG，另以 `role="img"` 容器提供 `aria-label`；資料另有表格檢視。
- `prefers-reduced-motion` 關閉動畫。

## 6. 響應式與列印

- ≤1100px：hero、模擬器、圖譜改單欄。
- ≤980px：sidebar 變抽屜、選單按鈕出現。
- ≤720px：所有 grid 改 `minmax(0,1fr)`、表格在 `.table-wrap` 內橫向捲動（頁面本身不橫向溢出）。
- ≤480px：統計數字縮小、hero 按鈕全寬。
- 列印：隱藏 sidebar／topbar／按鈕，白底黑字、卡片去陰影、圖表限高。

## 7. 離線與資料內嵌

`tools/build.py` 會把五個 token 各替換一次：

| Token | 內容 |
|---|---|
| `__GAMES_JSON__` | 18 款遊戲 |
| `__SOURCES_JSON__` | 22 個來源 |
| `__AWARDS_JSON__` | 5 屆 TGA |
| `__EDGES_JSON__` | 133 條資料邊 |
| `__BUILD_META_JSON__` | build 時間與計數 |

因此 `index.html` 不需要 `fetch()`、不需要伺服器、不呼叫任何外部 API。點開即可用；外部連結（來源 URL）只有使用者主動點擊時才需要網路。

## 8. 建置與驗證

```bash
py tools/build.py
```

build 會依序檢查：18 款、5 屆 TGA、id 唯一、31 個必填欄位、`awardIndex == Σ breakdown`、來源 ID 存在、Tier 0–5、非負銷量／CCU、summary／caveat 非空，最後才寫出 `index.html`。任一項失敗即以 exit code 1 中止，不產生半成品。
