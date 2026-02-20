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

### A. 單向依賴流 (One-Way Dependency Flow)

這是專案的基石。各層之間有嚴格的依賴方向，防止循環依賴，確保程式碼的可測試性和可維護性。

**依賴鏈**: `app` → `view-modules` → `use-cases` → `react-providers` → `react-hooks` → `server-commands` → `firebase` / `genkit-flows` / `shared` → `domain-rules` → `domain-types`

*詳細規則請參閱 `docs/boundaries.md`。*

### B. 關注點分離 (Separation of Concerns)

- **UI 元件 (`view-modules`)**: 只負責渲染，不應包含業務邏輯或直接的資料庫請求。
- **邏輯 (`react-hooks`)**: 封裝可重用的 UI 邏輯或業務邏輯。
- **狀態 (`react-providers`)**: 作為 UI 與基礎設施層之間的橋樑，管理共享數據。
- **外部通訊 (`firebase`)**: 唯一負責與 Firebase 等外部服務互動的層。

### C. 事件驅動架構 (Event-Driven Architecture)

在工作區 (`Workspace`) 的範疇內，不同的功能模組（Capabilities）之間是解耦的。它們透過 `WorkspaceEventBus` 進行通訊，以發布和訂閱事件的方式協同工作，而非直接互相呼叫。

*詳細事件列表請參閱 `docs/events.md`。*

## 3. 目錄結構概覽 (Directory Structure Overview)

- `src/app`: Next.js 的 App Router 根目錄，包含所有頁面、佈局和路由。
- `src/view-modules`: 可重用的「智慧」UI 視圖元件（組合 hooks 和 use-cases）。
- `src/use-cases`: 用例協調層，組合 server-commands 和 domain 邏輯。
- `src/react-providers`: 全域狀態管理提供者 (`Providers`)。
- `src/react-hooks`: 可重用的 React Hooks，封裝業務邏輯。
- `src/server-commands`: 伺服器端 `"use server"` 動作，唯一負責資料修改的層。
- `src/firebase`: 與外部服務（特別是 Firebase）互動的程式碼。
- `src/genkit-flows`: 包含所有 Genkit 流程和 AI 相關的 schema。
- `src/domain-rules`: 純粹的業務邏輯函式，無副作用。
- `src/domain-types`: 專案中所有的 TypeScript 類型和介面定義。
- `src/shared`: 全域共享的工具和 UI 元件（shadcn/ui、工具函式、常數）。
- `docs`: 所有專案架構、規範和設計文件。

## 4. 狀態管理策略 (State Management Strategy)

專案採用分層的 React Context API 進行狀態管理，避免單一的「上帝物件 (God Object)」。這種設計確保數據僅在需要的範圍內可用，並提升效能。

*詳細的提供者層級結構請參閱 `docs/context.md`。*
