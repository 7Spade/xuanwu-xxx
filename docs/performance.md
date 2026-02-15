# 效能標準 (Performance Standards)

本文件旨在建立一套可衡量的效能標準與最佳實踐，以確保應用程式提供快速、流暢的使用者體驗。

---

## 1. 前端渲染 (Frontend Rendering)

### A. 核心 Web 指標 (Core Web Vitals)
- **LCP (Largest Contentful Paint)**: 應在 **2.5 秒**內。
- **FID (First Input Delay)**: 應在 **100 毫秒**內。
- **CLS (Cumulative Layout Shift)**: 應小於 **0.1**。

### B. React 渲染最佳實踐
- **延遲載入 (Lazy Loading)**:
  - 位於首屏（Above the Fold）下方的圖片**必須**使用延遲載入。在 Next.js 中，這由 `next/image` 元件自動處理，但需確保其被正確使用。
  - 對於大型或不常訪問的元件，應使用 `React.lazy` 或 Next.js 的 `dynamic()` 進行程式碼分割和動態載入。

- **狀態管理 (State Management)**:
  - 優先使用區域性狀態 (`useState`, `useReducer`) 處理與單一元件相關的 UI 變更。
  - **嚴禁**因細微的 UI 互動（如開關一個下拉菜單）而觸發全域 Context 的更新，以避免不必要的全域重新渲染。

- **記憶化 (Memoization)**:
  - 對於在元件渲染週期中可能重複發生的昂貴計算（例如：數據篩選、排序、格式化），應始終使用 `useMemo` 進行記憶化。
  - 對於傳遞給子元件的回呼函式，應使用 `useCallback` 包裹，以防止在父元件重新渲染時產生新的函式實例，從而避免子元件不必要的重新渲染。
  - 對於純展示性且 props 不常變更的元件，應使用 `React.memo` 進行包裹。

---

## 2. 數據獲取 (Data Fetching)

- **快取策略 (Caching)**:
  - **必須**啟用 Firestore 的離線數據持久性 (`enablePersistence`)。這可以顯著改善重複訪問時的載入時間，並提供基本的離線能力。
  - 對於不常變動的全域數據（如能力規格 `capabilitySpecs`），應在 `AppProvider` 中獲取一次，並在整個應用程式生命週期內快取。

- **打包體積 (Bundle Size)**:
  - **嚴禁**從 `firebase` 或其他大型套件中導入整個 SDK (例如 `import firebase from 'firebase/app'`)。
  - **必須**始終使用模組化導入，只引入需要的功能 (例如：`import { getFirestore } from 'firebase/firestore'`)，以最大限度地減小客戶端打包體積。

---

## 3. 載入狀態 (Loading States)

- **骨架屏 (Skeleton Screens)**:
  - 每個進行非同步數據獲取的元件，**必須**有一個對應的骨架屏 UI。
  - 在 Next.js 中，應優先使用 `loading.tsx` 檔案在路由層級實現骨架屏。
  - 對於元件級的數據獲取，應根據載入狀態 (`isLoading`) 進行條件渲染，顯示骨架屏。

- **樂觀更新 (Optimistic Updates)**:
  - 對於需要立即反饋的操作（如點讚、收藏），應實施樂觀更新。立即修改 UI 狀態，然後在背景執行 API 請求。如果請求失敗，必須將 UI 狀態還原。
