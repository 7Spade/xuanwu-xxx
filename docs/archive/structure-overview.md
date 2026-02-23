# Structure Overview

> 本文件描述專案的完整目錄結構。
> 架構原則與依賴規則請參閱 [architecture-overview.md](./architecture-overview.md)。

---

## 根目錄

```
/
├── src/                        ← 所有應用程式原始碼
├── functions/                  ← Firebase Cloud Functions
├── public/                     ← 靜態資源
├── docs/                       ← 設計文件
├── next.config.ts              ← Next.js 設定（@/ path alias）
├── tailwind.config.ts
├── tsconfig.json               ← TypeScript strict mode
├── eslint.config.mts           ← ESLint flat config
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── apphosting.yaml
└── components.json             ← Shadcn/UI CLI 設定
```

---

## `src/` 頂層結構

```
src/
├── app/          ← Next.js App Router 路由層（純組裝）
├── features/     ← 17 個垂直功能切片
├── shared/       ← 跨切片共用基礎設施
└── styles/       ← 全域 CSS
```

---

## `src/app/` — 路由層（含 4 個路由群組）

```
app/
├── layout.tsx                        ← 根佈局（providers）
│
├── (public)/                         ← 公開路由（未登入可存取）
│   ├── layout.tsx
│   ├── @modal/
│   │   ├── (.)reset-password/page.tsx← 攔截：重設密碼 Dialog
│   │   └── default.tsx
│   ├── login/page.tsx                ← /login
│   └── reset-password/page.tsx       ← /reset-password（canonical）
│
└── (shell)/                          ← 全域 UI 容器層（外殼層，純視覺結構）
    ├── layout.tsx                    ← SidebarProvider（提供 @sidebar + @modal 插槽，不承載業務）
    ├── @sidebar/default.tsx          ← DashboardSidebar（全域側欄 slot）
    ├── @modal/default.tsx            ← 全域覆蓋層 slot（預設 null）
    ├── page.tsx                      ← / 根入口（redirect）
    └── (account)/                    ← 路由群組：AccountProvider 共用上下文
        ├── layout.tsx                ← AccountProvider（(dashboard) + (workspaces) 共用）
        ├── (dashboard)/              ← 路由群組：組織管理業務路由
        │   └── dashboard/
        │       ├── layout.tsx            ← Auth Guard + SidebarInset + @header + @modal
        │       ├── page.tsx              ← /dashboard（redirect）
        │       ├── @header/default.tsx
        │       ├── @modal/
        │       │   ├── (.)account/new/page.tsx
        │       │   └── default.tsx
        │       └── account/
        │           ├── audit/page.tsx
        │           ├── daily/page.tsx
        │           ├── matrix/page.tsx
        │           ├── members/page.tsx
        │           ├── new/page.tsx
        │           ├── partners/[id]/page.tsx
        │           ├── partners/page.tsx
        │           ├── schedule/page.tsx
        │           ├── settings/page.tsx
        │           ├── teams/[id]/page.tsx
        │           └── teams/page.tsx
        └── (workspaces)/             ← 路由群組：工作區模組（列表 + 詳情）
            └── workspaces/
                ├── layout.tsx            ← 工作區模組共用佈局（可選）
                ├── page.tsx              ← /workspaces（列表）
                ├── new/page.tsx
                ├── @modal/
                │   ├── (.)new/page.tsx
                │   └── default.tsx
                └── [id]/                 ← /workspaces/[id]（詳情）
                    ├── layout.tsx        ← WorkspaceProvider
                    ├── page.tsx
                    ├── settings/page.tsx
                    ├── governance/page.tsx
                    ├── schedule-proposal/page.tsx
                    ├── daily-log/[logId]/page.tsx
                    ├── @plugin-tab/      ← 插件 Tab slot
                    │   ├── acceptance/ audit/ capabilities/ daily/
                    │   ├── document-parser/ files/ finance/ issues/
                    │   ├── members/ qa/ schedule/ tasks/
                    │   ├── default.tsx  loading.tsx  error.tsx
                    ├── @modal/           ← Dialog 攔截
                    │   ├── (.)settings/
                    │   ├── (.)schedule-proposal/
                    │   ├── (.)daily-log/[logId]/
                    │   └── default.tsx
                    └── @panel/           ← 右側面板攔截
                        ├── (.)governance/
                        └── default.tsx
```

---

## `src/features/` — 17 個垂直切片

每個切片標準結構：

```
features/{name}/
├── GEMINI.md           ← AI 說明（必須）
├── _actions.ts         ← "use server" 寫入（選用）
├── _queries.ts         ← Firestore 讀取/onSnapshot（選用）
├── _types.ts           ← 切片私有類型（選用）
├── _hooks/             ← React hooks（選用）
├── _components/        ← UI 元件（選用）
└── index.ts            ← 公開 API（必須）
```

| 切片 | 主要職責 |
|------|---------|
| `account.auth` | 登入、註冊、重設密碼 |
| `account` | 組織 CRUD、統計、權限矩陣 |
| `workspace-core` | 工作區 CRUD、設定、導航、外殼（Sidebar/Header） |
| `workspace-core.event-bus` | 跨切片事件匯流排（Observer 引擎、Context、Hooks） |
| `workspace-governance.members` | 成員管理（帳號層 + 工作區層） |
| `workspace-governance.teams` | 團隊管理 |
| `workspace-governance.partners` | 協力廠商管理 |
| `workspace-governance.schedule` | 排班、提案、治理審核 |
| `workspace-business.daily` | 工作日誌、留言、書籤、按讚 |
| `workspace-business.tasks` | 任務樹、CRUD |
| `workspace-governance.audit` | 稽核事件追蹤 |
| `workspace-business.files` | 檔案上傳、管理 |
| `workspace-business.issues` | 議題追蹤 |
| `workspace-business.finance` | 財務插件 |
| `workspace-business.qa` | QA 插件 |
| `workspace-business.document-parser` | AI 文件解析 |
| `workspace-business.acceptance` | 驗收插件 |
| `account-user.profile` | 使用者個人資料、偏好、安全 |

---

## `src/shared/` — 5 個共用模組

```
shared/
├── types/                    ← 全域領域類型
│   ├── account.types.ts
│   ├── workspace.types.ts
│   ├── schedule.types.ts
│   ├── task.types.ts
│   ├── daily.types.ts
│   ├── audit.types.ts
│   ├── skill.types.ts
│   └── index.ts
│
├── lib/                      ← 純工具 + 領域規則
│   ├── account.rules.ts
│   ├── schedule.rules.ts
│   ├── skill.rules.ts
│   ├── task.rules.ts
│   ├── workspace.rules.ts
│   ├── format-bytes.ts
│   ├── i18n.ts
│   └── utils.ts
│
├── infra/                    ← Firebase 基礎設施
│   ├── app.client.ts
│   ├── firebase.config.ts
│   ├── auth/
│   ├── storage/
│   ├── analytics/
│   ├── messaging/
│   └── firestore/
│       ├── firestore.client.ts
│       ├── firestore.facade.ts
│       ├── firestore.read.adapter.ts
│       ├── firestore.write.adapter.ts
│       ├── firestore.converter.ts
│       ├── firestore.utils.ts
│       └── repositories/
│           ├── account.repository.ts
│           ├── user.repository.ts
│           ├── workspace.repository.ts
│           ├── schedule.repository.ts
│           ├── daily.repository.ts
│           └── audit.repository.ts
│
├── ai/                       ← Genkit AI 流程
│   ├── genkit.ts
│   ├── dev.ts
│   ├── flows/
│   └── schemas/
│
└── ui/                       ← UI 原語（shadcn + providers + 常數）
    ├── shadcn-ui/
    ├── app-providers/
    │   ├── firebase-provider.tsx
    │   ├── auth-provider.tsx
    │   ├── theme-provider.tsx
    │   └── i18n-provider.tsx
    ├── constants/
    ├── i18n-types/
    └── utility-hooks/
```

---

## 命名慣例

| 類型 | 模式 | 範例 |
|------|------|------|
| 切片 hooks | `use-{what}.ts` | `use-workspace-schedule.ts` |
| 切片 actions | `_actions.ts` | `features/workspace-governance.schedule/_actions.ts` |
| 切片 views | `{name}.{context}-view.tsx` | `schedule.account-view.tsx` |
| 共用類型 | `{domain}.types.ts` | `shared/types/schedule.types.ts` |
| 共用規則 | `{domain}.rules.ts` | `shared/lib/schedule.rules.ts` |
| Barrel | `index.ts` | 每個切片必須有 |
