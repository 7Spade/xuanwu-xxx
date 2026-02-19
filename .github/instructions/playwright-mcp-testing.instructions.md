---
applyTo: '**/*.tsx, **/*.ts, **/*.jsx, **/*.js'
description: 'Playwright MCP testing workflow for this project: page verification, issue diagnosis, bottleneck analysis, and safe optimization loops.'
---

# Playwright MCP Testing & Optimization Instructions

## Goal

Use Playwright MCP as the default browser-validation path for this project to:

1. verify real page behavior (not only HTTP status),
2. detect UI/runtime errors,
3. identify bottlenecks,
4. apply minimal fixes without changing intended behavior.

## Test Account (Project Test Environment Only)

- Email: `test@demo.com`
- Password: `123456`

Use this account only for local/dev validation in this repository.
Do not reuse this credential in staging/production or any public-facing environment.
If testing in any shared environment, replace this password immediately and provide credentials via secure env/secret storage.

## Standard Workflow

### 1) Start and navigate

- Start browser session
- Open target route (e.g. `/login`, `/dashboard`, `/dashboard/workspaces`)
- Wait for page to stabilize before assertions

### 2) Authentication flow

- If route requires auth, use the test account above to sign in.
- Confirm redirect target and key UI shell are rendered.

### 3) Collect diagnostics

Always capture:

- page snapshot (a11y tree or structured snapshot),
- browser console messages,
- network request anomalies (failed requests, long requests),
- full-page screenshot for the current state.

### 4) Analyze bottlenecks

Prioritize bottlenecks in this order:

1. runtime errors/hydration failures,
2. repeated network failures or retries,
3. slow first render / blocking UI states,
4. obvious re-render hotspots from interactions.

### 5) Fix with minimal impact

- Keep changes surgical and scoped.
- Do not redesign UI unless necessary for the bug/perf issue.
- Preserve behavior and existing contracts.
- Re-run the same Playwright scenario to verify no regressions.

## Required Route Coverage (minimum)

- `/login`
- `/dashboard`
- `/dashboard/account/settings`
- `/dashboard/workspaces`
- one dynamic workspace route: `/dashboard/workspaces/[id]` (use available id from UI navigation)

## Expected Validation Artifacts

For every meaningful fix, keep evidence:

- before/after screenshot,
- before/after console error summary,
- short note of root cause and exact fix.

## Optimization Heuristics for This Project

- Prefer SSR-safe fixes over client-only workarounds.
- Avoid creating new abstractions unless a repeated issue demands it.
- If changing component internals, preserve props/API and visual output.
- If touching data flows, keep existing layer boundaries:
  `app -> components -> context -> hooks -> infra -> lib -> types`.
