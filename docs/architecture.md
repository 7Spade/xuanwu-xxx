# 專案架構 (Project Architecture)

本文件旨在提供專案的整體技術架構、設計原則與核心技術棧的高階概覽，作為新成員引導、架構決策和長期維護的參考基準。

## 1. 核心技術棧 (Core Technology Stack)

| 類別 (Category) | 技術 (Technology) | 備註 (Notes) |
| :--- | :--- | :--- |
| **主要框架** | [Next.js](https://nextjs.org/) (App Router) | 採用 App Router 進行路由、渲染和資料獲取。 |
| **程式語言** | [TypeScript](https://www.typescriptlang.org/) | 全專案範圍內強制使用，以確保類型安全。 |
| **UI 樣式** | [Tailwind CSS](https://tailwindcss.com/) | 功能優先的 CSS 框架，用於快速建構 UI。 |
| **UI 元件庫** | [shadcn/ui](https://ui.shadcn.com/) | 可組合、可訪問的元件集合。 |
| **後端 & 資料庫** | [Firebase](https://firebase.google.com/) | 使用其 Firestore, Authentication, 和 Storage 服務。 |
| **生成式 AI** | [Genkit](https://firebase.google.com/docs/genkit) | 用於處理與大型語言模型 (LLM) 相關的後端流程。 |
| **狀態管理** | React Context & `useReducer` | 採用分層的 Context API 進行全域狀態管理。 |
| **國際化 (i18n)**| `next-intl` 模式 | 透過 JSON 檔案和 Context 實現多語言支援。 |

## 2. 架構原則 (Architectural Principles)

本專案遵循一系列核心原則，以確保程式碼的清晰度、可維護性和可擴展性。

### A. 垂直切片架構 (Vertical Slice Architecture — VSA)

> **目標：AI 開發零認知 — 實作任何功能只需讀一個資料夾。**

專案採用 **垂直切片架構 (VSA)**，以業務領域為單位組織程式碼，而非以技術層為單位。

```
src/
├── app/          ← Next.js 路由（純組裝，零業務邏輯）
├── features/     ← 17 個垂直功能切片（每個業務領域一個）
└── shared/       ← 5 個跨切片共用基礎設施模組
```

**依賴流（單向）**：`app` → `features/{name}/index.ts` → `shared/*`

- `app/` 僅引用 `features/*/index.ts`（公開 API）和 `shared/*`
- `features/*` 引用 `shared/*`，以及其他切片的 `index.ts`（禁止引用私有 `_` 路徑）
- `shared/*` 零功能依賴

**詳細設計請參閱 `docs/vertical-slice-architecture.md`。**

### B. 關注點分離 (Separation of Concerns)

### B. 關注點分離 (Separation of Concerns)

- **UI 元件 (`view-modules`)**: 只負責渲染，不應包含業務邏輯或直接的資料庫請求。
- **邏輯 (`react-hooks`)**: 封裝可重用的 UI 邏輯或業務邏輯。
- **狀態 (`react-providers`)**: 作為 UI 與基礎設施層之間的橋樑，管理共享數據。
- **外部通訊 (`firebase`)**: 唯一負責與 Firebase 等外部服務互動的層。

### C. 事件驅動架構 (Event-Driven Architecture)

在工作區 (`Workspace`) 的範疇內，不同的功能模組（Capabilities）之間是解耦的。它們透過 `WorkspaceEventBus` 進行通訊，以發布和訂閱事件的方式協同工作，而非直接互相呼叫。

*詳細事件列表請參閱 `docs/events.md`。*

## 3. 目錄結構概覽 (Directory Structure Overview)

**目標狀態（VSA）：**

- `src/app`: Next.js App Router 路由入口，純組裝層，不含業務邏輯。
- `src/features/`: 17 個垂直功能切片，每個切片擁有其業務領域的所有程式碼。
- `src/shared/types/`: 全域 TypeScript 類型定義（原 `domain-types/`）。
- `src/shared/lib/`: 純工具函式與領域規則（原 `domain-rules/` + `shared/utils/`）。
- `src/shared/infra/`: Firebase 基礎設施（原 `firebase/`）。
- `src/shared/ai/`: Genkit AI 流程（原 `genkit-flows/`）。
- `src/shared/ui/`: shadcn-ui、Providers、i18n、常數（原 `shared/`）。

**遷移中（舊水平層，逐步搬移至上述結構）：**

- `src/domain-types/` → `src/shared/types/`
- `src/domain-rules/` → `src/shared/lib/`
- `src/firebase/` → `src/shared/infra/`
- `src/genkit-flows/` → `src/shared/ai/`
- `src/server-commands/` → `src/features/{name}/_actions.ts`
- `src/react-hooks/` → `src/features/{name}/_hooks/`
- `src/react-providers/` → `src/features/{name}/_hooks/` 或 `src/shared/ui/`
- `src/use-cases/` → `src/features/{name}/`（內嵌至 hooks 或 actions）
- `src/view-modules/` → `src/features/{name}/_components/`

詳細切片列表請參閱 `docs/vertical-slice-architecture.md`。

## 4. 狀態管理策略 (State Management Strategy)

專案採用分層的 React Context API 進行狀態管理，避免單一的「上帝物件 (God Object)」。這種設計確保數據僅在需要的範圍內可用，並提升效能。

*詳細的提供者層級結構請參閱 `docs/context.md`。*
