<p align="center">
 <img src="./public/icons/icon-64.png" alt="Version">
</p>
<h1 align='center'>
TermExpander AI 
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/Manifest-V3-orange?style=flat-square" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Platform-Chrome-4285F4?logo=google-chrome&logoColor=white&style=flat-square" alt="Chrome Extension">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
</p>

---

TermExpander AI 是一款專為學術研究與專業寫作設計的 Chrome 擴充功能。它利用大型語言模型（LLM）技術，自動識別文本中的縮寫或專有名詞，並將其轉化為規範化的學術格式：[中文名稱（英文名稱, 縮寫）]。

### 核心功能

- 自動術語正規化：將口語或簡寫的專業詞彙（如：ITS, RAG, LLM）轉換為標準學術全稱。

- 即時浮動視窗 (Tooltip)：在網頁中選取任何文字，系統會立即調用 AI 並在選取位置旁邊顯示完整名稱，無需開啟彈出視窗。

- Gemini API 整合：支援 Google Gemini 系列模型（如 Gemini 2.5 Flash, 2.5 Pro, 2.0 flash lite），提供快速且準確的語義識別。

- 隱私保護：使用者的 API Key 儲存在瀏覽器本地（chrome.storage.local），不經過開發者伺服器。

- 學術語氣優化：除了補全名稱，還能微調句子語氣，使其更符合論文寫作風格。

### 技術棧

Frontend: React + vite + tailwindcss

Manifest V3: 符合 Chrome 最新擴充功能規範

LLM API: Google Gemini API

Storage: Chrome Storage API (Local)

### 本地部屬

1. 安裝步驟
   下載或 Clone 此專案資料夾到本地。

```bash
npm install
npm run build
```

開啟 Chrome 瀏覽器，進入 `chrome://extensions/`。

開啟右上角的 「開發者模式 (Developer mode)」。

點擊 「載入解壓縮擴充功能 (Load unpacked)」，選擇此`專案資料夾/dist`。

2. 設定 API Key
   點擊瀏覽器工具列中的 TermExpander AI 圖示。

展開 「設定（LLM）」 區塊。

填入您的 Google Gemini API Key。

點擊 「儲存設定」。

### 使用範例

選取文字自動補全
在任何學術網頁或論文中選取「NLP」，擴充功能將會顯示：

自然語言處理（Natural Language Processing, NLP）

手動轉換 (Popup)
點擊擴充功能圖示。

在「輸入文字」框中貼上：「ITS 結合 RAG 能提升學習效率」。

點擊 「轉換」。

輸出結果：「智慧導學系統（Intelligent Tutoring Systems, ITS） 結合 檢索增強生成（Retrieval-Augmented Generation, RAG） 能顯著提升學習效率。」

隱私與安全性
本工具僅於使用者選取文字或主動點擊轉換時與 Google API 連線。

不收集使用者的瀏覽歷史。

詳細資訊請參閱 [隱私權政策連結](/privacy.md)。

### 協作

歡迎一起協作！為了讓功能與品質一致，請依照以下規則進行。

### 開始之前

1. 先到 Issues 確認是否已有相同問題/需求。
2. 若是新需求或 bug，請開一個 Issue，描述：
   - 預期行為 / 實際行為（或需求目標）
   - 重現步驟（含網站/頁面，例如 Notion、Google Docs）
   - 相關截圖或錄影（可選）
   - 環境資訊（Chrome 版本、OS）

### 分支規則

- 從 `main` 拉分支。
- 命名建議：
  - `feat/<short-topic>`：新功能
  - `fix/<short-topic>`：修 bug
  - `docs/<short-topic>`：文件
  - `chore/<short-topic>`：雜項（重構、工具設定）

### Commit 規則

- 建議採用 Conventional Commits：
  - `feat: ...`、`fix: ...`、`docs: ...`、`chore: ...`、`refactor: ...`
- 一個 commit 盡量只做一件事；訊息要能描述「做了什麼」而不是「改了哪裡」。

### PR 流程

1. PR 需連結對應 Issue（例如在描述中寫 `Closes #123`）。
2. PR 描述請包含：
   - 變更內容摘要
   - 影響範圍（popup / content script / background / shared）
   - 測試方式與結果（至少 `npm run build`）
3. 請避免在同一個 PR 混入不相關重構與功能修改。

### 本地開發與驗證

```bash
npm install
npm run build
```

- 載入擴充功能：`chrome://extensions/` → Developer mode → Load unpacked → 選 `dist/`
- 修改後若牽涉到 content script，通常需要「重新載入擴充功能」並「重新整理目標頁面」才會生效。

### 程式碼風格與範圍

- 優先保持改動最小、聚焦在需求本身。
- 不要加入額外 UI/頁面/設定，除非 Issue 明確要求。
- 變更 content script（`src/extension/content.ts`）時，請特別注意：
  - 不要破壞一般網站的選取/複製行為
  - 針對特殊網站（Notion/Google Docs）要有 fallback 或提示
