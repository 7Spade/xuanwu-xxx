# 專案架構與程式碼規範

本文件概述了此專案的核心架構原則與程式碼規範。遵守這些標準對於維持程式碼品質、一致性與長期可維護性至關重要。

---

## 1. 核心哲學：簡潔至上

專案的指導原則是**奧卡姆剃刀定律 (Occam’s Razor)**：

> 如無必要，勿增實體。 (Do not introduce more complexity than is strictly necessary.)

每一個設計、架構和實作決策，都必須傾向於能夠完全滿足需求的**最簡單可行方案**。在增加新的程式碼、抽象層或依賴項之前，請先自問：

-   這個功能可以用更少的程式碼或檔案來實現嗎？
-   這是在解決一個真實且迫切的問題，還是一種過早的優化？
-   程式碼庫中是否已存在一個更簡單的等效方案？

---

## 2. 目錄結構與依賴流

本專案採用 **垂直切片架構 (Vertical Slice Architecture)**，以業務領域組織程式碼。

**依賴流向（單向）:**
```
app/  →  features/{name}/index.ts  →  shared/*
```

- **`src/app/`**: **路由組裝層 (Entry Layer)**。含 5 個路由群組：`(shell)/`（視覺容器）、`(account)/`（AccountProvider 共用上下文）、`(dashboard)/`（組織管理，巢狀於 account）、`(workspaces)/`（工作區列表 + 詳情，巢狀於 account）、`(public)/`（未登入）。只引用 `features/*/index.ts` 和 `shared/*`。
- **`src/features/`**: **17 個垂直功能切片**。每個切片擁有其業務領域的所有程式碼（`_actions.ts`、`_hooks/`、`_components/`、`index.ts`）。
- **`src/shared/`**: **跨切片共用基礎設施**。5 個模組：
  - `types/` — 全域類型定義（無邏輯）
  - `lib/` — 純業務規則函式（無 I/O）
  - `infra/` — Firebase SDK 唯一閘道
  - `ai/` — Genkit AI 流程（Server-side）
  - `ui/` — Shadcn/UI、providers、常數、i18n

詳細邊界規則請參閱 `docs/boundaries.md`。

---

## 3. 檔案命名規範: `kebab-case`

**這是一條不可協商的規則。** 在專案中創建的所有新檔案和目錄**都必須**使用 `kebab-case`。

-   **定義**: 使用連字號 (`-`) 分隔的小寫單字。
-   **適用於**:
    -   React 元件 (`.tsx`): `daily-log-card.tsx`
    -   Hooks (`.ts`): `use-bookmark-actions.ts`
    -   Context 檔案 (`.tsx`): `account-context.tsx`
    -   基礎設施適配器 (`.ts`): `auth.adapter.ts`
    -   類型定義 (`.ts`): `domain.ts` (或 `i18n-schema.ts`)
    -   目錄: `_components`, `_hooks`
-   **例外**:
    -   受 Next.js App Router 規範約束的檔案 (例如: `page.tsx`, `layout.tsx`)。
    -   特殊的設定檔 (例如: `tailwind.config.ts`)。

---

## 4. 元件設計原則

### 單一職責原則 (Single Responsibility Principle - SRP)
每個元件都應該只有一個，且僅有一個需要變更的理由。這對於互動式元素尤其重要。

**Action 元件:**
像「點讚」、「收藏」或「分享」這類功能，都必須封裝在它們各自獨立的元件中 (例如 `like-button.tsx`)。這些元件應使用專用的 hooks，並負責自身的 UI、狀態管理和邏輯。

-   **應該做 (DO)**: 創建 `<LikeButton log={log} />`，並讓它在內部處理自己的狀態和 API 呼叫。
-   **不該做 (DON'T)**: 將點讚按鈕的邏輯和狀態直接放在父元件 `DailyLogCard` 之中。

### 智慧容器 vs. 啞元件 (Smart Containers vs. Dumb Components)
-   **智慧容器 (Smart Containers)** (通常是頁面或頂層元件) 負責獲取資料和管理狀態。
-   **啞元件 (Dumb Components)** (`src/app/_components/` 中的大多數元件) 應純粹是展示性的。它們透過 props 接收資料和回呼函式，不應關心資料的來源。

---

## 5. 狀態管理策略

本專案採用混合式狀態管理方法，優先考慮一致性並避免產生「上帝物件 (God objects)」。

-   **全域/共享狀態 (Context)**: 用於那些真正全域且被應用程式中許多不同部分存取的資料 (例如：已驗證的使用者、當前活動的組織)。Context providers 應按層級組織。
-   **自給自足的邏輯 (Hooks)**: 用於那些功能上自成一體，即使它們出現在多個地方的特性。專用的 hook (例如 `use-bookmark-actions`) 應該獲取並管理自己的資料，使該功能變得可移植且與全域狀態解耦。

**經驗法則**: 如果狀態是關於一個特定的、封裝好的功能（如書籤），請使用專用的 hook。如果狀態是關於應用程式的整體上下文（如誰已登入），請使用 Context。

---

## 6. 樣式

-   **框架**: [Tailwind CSS](https://tailwindcss.com/)
-   **元件庫**: [shadcn/ui](https://ui.shadcn.com/)
-   **主題化 (Theming)**: 主題是透過定義在 `src/app/globals.css` 中的 CSS 變數來實現的。顏色使用 HSL 值定義。請勿使用任意的顏色值；應依賴主題變數 (例如 `bg-primary`, `text-destructive` 等)。
