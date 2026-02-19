# Playwright Testing Guide for Xuanwu Application

## Overview

This guide provides a complete workflow for testing the Xuanwu application using Playwright browser automation, from initial setup through complete user journeys including registration, login, account switching, and workspace operations.

## Purpose

- Avoid roundabout testing approaches
- Provide clear, repeatable test procedures
- Monitor console logs for errors
- Catch bugs early in development
- Document working test credentials

## Prerequisites

### System Requirements
- Node.js 18+ installed
- Firebase emulators (optional but recommended for isolated testing)
- Port 9002 available for dev server

### Test Credentials

**For Registration Testing:**
```
name: demo{number}      (e.g., demo1, demo2, demo3)
email: test{number}@demo.com  (e.g., test1@demo.com)
password: 123456
```

**For Login Testing:**
```
name: demo
email: test@demo.com
password: 123456
```

## Complete Testing Workflow

### Step 1: Install Dependencies

```bash
# Install project dependencies
npm install

# Playwright is already included in the project
# No additional Playwright installation needed
```

### Step 2: Start Development Server

```bash
# Start the Next.js dev server
npm run dev

# Server will be available at http://localhost:9002
# Wait for "Ready in X ms" message before testing
```

### Step 3: Use Playwright via Browser Automation Tools

The project uses browser automation tools (not standalone Playwright CLI). Use the following approach:

#### Registration Flow Test

```javascript
// Navigate to login page
await page.goto('http://localhost:9002/login');

// Wait for page to load
await page.waitForLoadState('networkidle');

// Take initial snapshot
const snapshot = await page.textContent('body');

// Find and click registration tab/button
// Look for text like "註冊" or "Register" or similar
const registerButton = await page.locator('text=註冊').first();
await registerButton.click();

// Fill registration form
await page.fill('input[name="name"]', 'demo1');
await page.fill('input[type="email"]', 'test1@demo.com');
await page.fill('input[type="password"]', '123456');

// Submit form
await page.click('button[type="submit"]');

// Monitor console for errors
const consoleMessages = [];
page.on('console', msg => {
  consoleMessages.push({
    type: msg.type(),
    text: msg.text()
  });
});

// Wait for navigation or success message
await page.waitForURL(/.*dashboard.*/);
```

#### Login Flow Test

```javascript
// Navigate to login page
await page.goto('http://localhost:9002/login');

// Fill login form
await page.fill('input[type="email"]', 'test@demo.com');
await page.fill('input[type="password"]', '123456');

// Click login button
await page.click('button[type="submit"]');

// Wait for dashboard
await page.waitForURL(/.*dashboard.*/);
```

#### Account Switcher Test

```javascript
// After login, locate account switcher in sidebar
const accountSwitcher = await page.locator('[data-testid="account-switcher"]');
await accountSwitcher.click();

// Verify accounts are listed
const accounts = await page.locator('[role="menuitem"]').all();
console.log(`Found ${accounts.length} accounts`);

// Switch to different account (if exists)
if (accounts.length > 1) {
  await accounts[1].click();
  await page.waitForLoadState('networkidle');
}
```

#### Workspace Operations Test

```javascript
// Create new workspace
const createWorkspaceButton = await page.locator('text=建立工作區');
await createWorkspaceButton.click();

// Fill workspace form
await page.fill('input[name="workspace-name"]', 'Test Workspace');
await page.click('button[type="submit"]');

// Navigate to workspace
await page.waitForURL(/.*workspaces\/.*/);

// Verify workspace loads
const workspaceName = await page.textContent('h1');
console.log(`Workspace loaded: ${workspaceName}`);
```

### Step 4: Console Monitoring

**Enable comprehensive console monitoring:**

```javascript
// Set up console listener BEFORE navigation
const consoleMessages = [];
const errors = [];

page.on('console', msg => {
  const entry = {
    type: msg.type(),
    text: msg.text(),
    timestamp: new Date().toISOString()
  };
  
  consoleMessages.push(entry);
  
  if (msg.type() === 'error') {
    errors.push(entry);
    console.error('Browser Error:', entry.text);
  }
});

// Also capture page errors
page.on('pageerror', error => {
  errors.push({
    type: 'pageerror',
    text: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
});

// After test, review errors
if (errors.length > 0) {
  console.log('=== ERRORS FOUND ===');
  errors.forEach(err => {
    console.log(`[${err.timestamp}] ${err.type}: ${err.text}`);
  });
}
```

## Common Issues and Solutions

### Issue 1: Firestore Undefined Values

**Error:** `Function setDoc() called with invalid data. Unsupported field value: undefined`

**Solution:** Ensure optional fields are not passed as undefined. Already fixed in `unified-account.repository.ts`.

### Issue 2: Form Fields Not Found

**Solution:** 
- Use `page.waitForSelector()` before filling
- Check actual HTML structure with `page.content()`
- Use flexible selectors: `input[type="email"]` instead of specific IDs

### Issue 3: Navigation Timeout

**Solution:**
- Increase timeout: `{ timeout: 30000 }`
- Wait for specific elements instead of navigation
- Use `waitForLoadState('networkidle')`

### Issue 4: Firebase Auth Not Available

**Solution:**
- Ensure dev server is fully started
- Check Firebase config is properly initialized
- Verify environment variables are set

## Complete Test Script Example

```javascript
// Full E2E test from registration to workspace creation

async function runFullE2ETest(page) {
  const errors = [];
  
  // Monitor console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // 1. Registration
  await page.goto('http://localhost:9002/login');
  await page.click('text=註冊');
  await page.fill('input[name="name"]', 'demo1');
  await page.fill('input[type="email"]', 'test1@demo.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*dashboard.*/);
  
  // 2. Verify dashboard loads
  await page.waitForSelector('text=歡迎');
  
  // 3. Create workspace
  await page.click('text=建立工作區');
  await page.fill('input[name="name"]', 'My Workspace');
  await page.click('button:has-text("建立")');
  await page.waitForURL(/.*workspaces\/.*/);
  
  // 4. Verify workspace
  const workspaceTitle = await page.textContent('h1');
  console.log('Workspace created:', workspaceTitle);
  
  // 5. Test account switcher
  await page.click('[data-testid="account-switcher"]');
  const accountCount = await page.locator('[role="menuitem"]').count();
  console.log('Accounts available:', accountCount);
  
  // Report errors
  if (errors.length > 0) {
    console.error('Test completed with errors:');
    errors.forEach(err => console.error('  -', err));
    return false;
  }
  
  console.log('✅ Full E2E test passed!');
  return true;
}
```

## Best Practices

1. **Always monitor console** - Catch errors early
2. **Use stable selectors** - Prefer data-testid over text
3. **Wait for elements** - Don't assume instant rendering
4. **Incremental testing** - Test one flow at a time
5. **Clean test data** - Use numbered accounts for isolation
6. **Screenshot on failure** - Capture state for debugging
7. **Explicit waits** - Use waitForSelector, not arbitrary timeouts

## Test Data Management

### Registration Test Accounts
```
demo1 / test1@demo.com / 123456
demo2 / test2@demo.com / 123456
demo3 / test3@demo.com / 123456
```

### Login Test Account
```
demo / test@demo.com / 123456
```

### Cleanup
```javascript
// After testing, optionally clean up test accounts
// (Implementation depends on your Firebase setup)
```

## Debugging Tips

1. **Enable verbose console output:**
   ```javascript
   page.on('console', msg => console.log('PAGE LOG:', msg.text()));
   ```

2. **Take screenshots at each step:**
   ```javascript
   await page.screenshot({ path: 'step1-login.png' });
   ```

3. **Inspect HTML structure:**
   ```javascript
   const html = await page.content();
   console.log(html);
   ```

4. **Check network requests:**
   ```javascript
   page.on('request', req => console.log('→', req.method(), req.url()));
   page.on('response', res => console.log('←', res.status(), res.url()));
   ```

## Integration with CI/CD

For automated testing in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Start dev server
  run: npm run dev &
  
- name: Wait for server
  run: npx wait-on http://localhost:9002
  
- name: Run Playwright tests
  run: npm run test:e2e
```

## Maintenance

- Update test credentials when authentication changes
- Review and update selectors when UI changes
- Keep this guide synchronized with actual implementation
- Document new user flows as they are added

## Related Documentation

- [Agent Skills: Webapp Testing](.github/skills/webapp-testing/SKILL.md)
- [Next.js Testing Instructions](.github/instructions/nextjs.instructions.md)
- [Playwright Official Docs](https://playwright.dev/)

---

**Last Updated:** 2026-02-17  
**Version:** 1.0  
**Status:** Active
