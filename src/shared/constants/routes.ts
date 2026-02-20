/**
 * @fileoverview shared/constants/routes.ts — Application route path constants.
 * Use these instead of hardcoding path strings in components.
 */

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  WORKSPACES: "/dashboard/workspaces",
  WORKSPACES_NEW: "/dashboard/workspaces/new",
  ACCOUNT_NEW: "/dashboard/account/new",
  ACCOUNT_MEMBERS: "/dashboard/account/members",
  ACCOUNT_TEAMS: "/dashboard/account/teams",
  ACCOUNT_PARTNERS: "/dashboard/account/partners",
  ACCOUNT_SETTINGS: "/dashboard/account/settings",
  ACCOUNT_MATRIX: "/dashboard/account/matrix",
  ACCOUNT_SCHEDULE: "/dashboard/account/schedule",
  ACCOUNT_DAILY: "/dashboard/account/daily",
  ACCOUNT_AUDIT: "/dashboard/account/audit",
} as const;
