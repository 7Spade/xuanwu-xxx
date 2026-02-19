---
agent: 'agent'
tools: ['edit/editFiles', 'playwright-browser_*', 'bash']
description: 'Run Playwright MCP end-to-end checks on project pages, diagnose UI/runtime/performance bottlenecks, and apply minimal safe fixes.'
---

# Playwright MCP Web Test, Diagnose, Fix & Optimize

Use this prompt when you need full browser-based validation and optimization for this project.

## Test Credentials (Dev/Test only)

- Email: `test@demo.com`
- Password: `123456`

This credential is for local/dev testing only. Never reuse it for staging/production/public environments.
For shared test environments, rotate this password and load credentials from secure secret storage.

## Execution Contract

1. Use Playwright MCP to run real browser flows (no shortcut via only curl/log inspection).
2. Test target pages, collect errors/bottlenecks, then patch with smallest possible change.
3. Re-test the same flows to prove the issue is fixed and no new regressions are introduced.

## Mandatory Steps

### A. Baseline check

- Navigate to `/login`
- Authenticate with test account
- Validate post-login route
- Capture:
  - console errors/warnings,
  - failed network requests,
  - screenshot

### B. Route sweep

Validate at least:

- `/dashboard`
- `/dashboard/account/settings`
- `/dashboard/workspaces`
- one `/dashboard/workspaces/[id]` route reached via UI interaction

For each route:

- wait for stable render,
- detect loading deadlocks, hydration/runtime errors, broken interactions,
- capture snapshot and screenshot.

### C. Bottleneck diagnosis

Summarize issues by priority:

1. functional breakage,
2. runtime exceptions,
3. repeated failed requests,
4. slow interactions/long loading states.

### D. Fix and optimize

- Apply minimal, behavior-preserving fixes.
- Prefer existing project patterns/components.
- Keep architecture boundaries and SRP intact.

### E. Verification loop

- Re-run baseline + route sweep on changed areas.
- Confirm:
  - issue resolved,
  - no new console errors introduced,
  - no broken critical user path.

## Output Format

Provide:

1. **Issue List**: route + symptom + root cause
2. **Patch Summary**: exact files changed and why
3. **Verification Evidence**: before/after screenshots + console delta
4. **Residual Risk**: known limits or follow-up recommendations
