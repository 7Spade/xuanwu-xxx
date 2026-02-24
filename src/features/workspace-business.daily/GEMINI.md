# Feature Slice: `workspace-business.daily`

## Domain

Daily work logs — create posts, upload images, toggle likes, add comments, bookmark logs.

## Responsibilities

- Create / delete daily log entries with image uploads
- Like / unlike a log entry
- Add / remove comments
- Bookmark / unbookmark logs
- Account-level and workspace-level daily log feeds
- Daily log detail dialog (intercepted modal)

## Internal Files

| File / Dir | Purpose |
|-----------|---------|
| `_actions.ts` | `createDailyLog`, `deleteDailyLog`, `toggleLike`, `addDailyLogComment`, `toggleBookmark` |
| `_queries.ts` | `onSnapshot` listeners for daily logs |
| `_hooks/` | `useWorkspaceDaily`, `useAggregatedLogs`, `useDailyCommands`, `useBookmarkCommands`, `useDailyUpload` |
| `_components/` | `DailyView`, `DailyAccountView`, `DailyWorkspaceView`, `DailyLogCard`, `DailyLogDialog`, `Composer`, `ImageCarousel`, `LikeButton`, `BookmarkButton`, `CommentButton`, `ShareButton` |
| `index.ts` | Public exports |

## Public API (`index.ts`)

```ts
export { DailyWorkspaceView } from "./_components/daily.workspace-view";
export { DailyAccountView } from "./_components/daily.account-view";
export { DailyLogDialog } from "./_components/daily-log-dialog";
```

## Who Uses This Slice?

- `app/dashboard/account/daily/page.tsx`
- `app/dashboard/workspaces/[id]/@businesstab/daily/page.tsx`
- `app/dashboard/workspaces/[id]/@modal/(.)daily-log/[logId]/page.tsx`
- `app/dashboard/workspaces/[id]/daily-log/[logId]/page.tsx`
