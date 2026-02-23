# 專案藍圖 (Project Blueprints)

本文件作為一個索引，旨在提供專案中具體實作的微觀設計規範與規格。開發者在實作新功能時，應以此處連結的文件作為主要參考，以確保程式碼的一致性與品質。

## 1. 核心實體與資料庫綱要 (Entities & Schema)

- **文件**: `docs/schema.md`
- **內容**: 定義了 Firestore 資料庫中的核心實體（如 `User`, `Organization`, `Workspace`, `WorkspaceTask` 等）的結構、欄位與其之間的關係。這是所有資料操作的基礎。

## 2. 應用程式事件模型 (Event Model)

- **文件**: `docs/events.md`
- **內容**: 詳述了 `WorkspaceEventBus` 的事件驅動模型，列出了系統中所有已定義的事件名稱、其對應的 `payload` 結構，以及觸發時機。

## 3. 程式碼撰寫與命名規範 (Coding & Naming Conventions)

- **文件**: `docs/conventions.md` & `.idx/airules.md`
- **內容**: 包含了專案的程式碼風格、檔案命名規則 (`kebab-case`)、元件設計原則 (SRP)、以及狀態管理策略。

### `kebab-case` 檔案命名範例
- **React 元件 (`.tsx`)**: `daily-log-card.tsx`
- **Hooks (`.ts`)**: `use-bookmark-actions.ts`
- **Context 檔案 (`.tsx`)**: `account-context.tsx`
- **基礎設施適配器 (`.ts`)**: `auth.adapter.ts`
- **類型定義 (`.ts`)**: `domain.ts`
- **目錄**: `_components`, `_hooks`

## 4. 安全性規則 (Security Rules)

- **文件**: `docs/rules.md` & `docs/security.md`
- **內容**: 描述了 Firestore 和 Cloud Storage 的安全規則設計原則，包括角色基礎的存取控制 (RBAC)、資料驗證和所有權驗證。

## 5. UI 元件庫規格 (UI Component Specifications)

- **文件**: `src/shared/ui/shadcn-ui/`
- **內容**: `shadcn/ui` 的所有可用 UI 元件。開發時應優先使用這些已存在的元件，避免重複造輪子。詳細的組件列表和使用方法可參考其官方文件。

## 6. 系統限制與配額 (System Limits)

- **文件**: `docs/limits.md`
- **內容**: 概述了系統關鍵部分（Firestore, Storage, Functions）的運行限制與配額，所有功能設計都應考慮這些限制。
