---
applyTo: '**/*.{ts,tsx,js,jsx}'
description: 'Instructions for AI agents to perform end-to-end testing using Playwright browser automation. Covers the complete user journey from registration to workspace operations with console monitoring.'
---

# Playwright E2E Testing Instructions for AI Agents

## When to Use This Guide

Use this guide when asked to:
- Test user registration or login flows
- Verify UI functionality end-to-end
- Debug authentication issues
- Test account switching
- Verify workspace operations
- Monitor application for runtime errors
- Perform integration testing

## Prerequisites Check

Before starting any Playwright tests, verify:

1. **Dev server is running:**
   ```bash
   npm run dev
   # Should show "Ready in X ms" and listening on port 9002
   ```

2. **Browser automation tools available:**
   - Use `browser_eval` tool with Playwright actions
   - NOT standalone Playwright CLI

3. **Test environment ready:**
   - No existing test data conflicts
   - Firebase emulators running (optional but recommended)

## Standard Testing Workflow

### Phase 1: Setup and Navigation

**Always start with console monitoring:**

```typescript
// Enable console monitoring BEFORE any navigation
const errors: string[] = [];
const warnings: string[] = [];
const logs: string[] = [];

page.on('console', msg => {
  const text = msg.text();
  const type = msg.type();
  
  if (type === 'error') {
    errors.push(text);
    console.error('🔴 Browser Error:', text);
  } else if (type === 'warning') {
    warnings.push(text);
    console.warn('⚠️  Browser Warning:', text);
  } else {
    logs.push(text);
  }
});

page.on('pageerror', error => {
  errors.push(error.message);
  console.error('🔴 Page Error:', error.message);
});
```

### Phase 2: Registration Flow Test

**Test Credentials:**
- name: `demo{number}` (e.g., demo1, demo2)
- email: `test{number}@demo.com`
- password: `123456`

**Steps:**

```typescript
// 1. Navigate to login page
await page.goto('http://localhost:9002/login');
await page.waitForLoadState('networkidle');

// 2. Find and click registration tab
// Look for "註冊" or "Register" text
const registerTab = await page.locator('text=註冊').first();
await registerTab.click();
await page.waitForTimeout(500); // Allow tab switch animation

// 3. Fill registration form
// Use flexible selectors that work across UI changes
await page.fill('input[name="name"]', 'demo1');
await page.fill('input[type="email"]', 'test1@demo.com');
await page.fill('input[type="password"]', '123456');

// 4. Submit form
await page.click('button[type="submit"]');

// 5. Wait for redirect to dashboard
await page.waitForURL(/.*dashboard.*/, { timeout: 10000 });

// 6. Verify success
const url = page.url();
console.log('✅ Registration successful, redirected to:', url);
```

**Expected Results:**
- ✅ No console errors
- ✅ Redirects to /dashboard
- ✅ Account created in Firestore
- ✅ User logged in

**Common Issues:**

1. **Firestore undefined error:**
   - Error: `Unsupported field value: undefined`
   - Fix: Already resolved in `unified-account.repository.ts`
   - If reoccurs: Check optional fields are filtered

2. **Form elements not found:**
   - Use `page.waitForSelector('input[name="name"]')` before filling
   - Check actual HTML with `await page.content()`
   - Adjust selectors based on actual markup

### Phase 3: Login Flow Test

**Test Credentials:**
- email: `test@demo.com`
- password: `123456`

**Steps:**

```typescript
// 1. Navigate to login page
await page.goto('http://localhost:9002/login');
await page.waitForLoadState('networkidle');

// 2. Ensure on login tab (not registration)
// If tabs exist, click login tab
const loginTab = await page.locator('text=登入').first();
if (await loginTab.isVisible()) {
  await loginTab.click();
}

// 3. Fill login form
await page.fill('input[type="email"]', 'test@demo.com');
await page.fill('input[type="password"]', '123456');

// 4. Submit
await page.click('button[type="submit"]');

// 5. Wait for dashboard
await page.waitForURL(/.*dashboard.*/, { timeout: 10000 });

console.log('✅ Login successful');
```

### Phase 4: Account Switcher Test

**After successful login:**

```typescript
// 1. Locate account switcher component
// This is in the sidebar
const accountSwitcher = await page.locator('[data-testid="account-switcher"]');
await accountSwitcher.waitFor();

// 2. Click to open menu
await accountSwitcher.click();
await page.waitForTimeout(300); // Allow menu animation

// 3. Count available accounts
const accountItems = await page.locator('[role="menuitem"]').all();
console.log(`Found ${accountItems.length} accounts in switcher`);

// 4. Verify personal account exists
const personalAccount = await page.locator('text=demo').first();
if (await personalAccount.isVisible()) {
  console.log('✅ Personal account visible in switcher');
}

// 5. If multiple accounts, test switching
if (accountItems.length > 1) {
  await accountItems[1].click();
  await page.waitForLoadState('networkidle');
  console.log('✅ Successfully switched accounts');
}
```

### Phase 5: Workspace Operations Test

**Create and navigate to workspace:**

```typescript
// 1. Find create workspace button
const createButton = await page.locator('text=建立工作區').first();
await createButton.click();

// 2. Wait for dialog/form
await page.waitForSelector('input[name="name"]');

// 3. Fill workspace name
const workspaceName = `Test Workspace ${Date.now()}`;
await page.fill('input[name="name"]', workspaceName);

// 4. Submit
await page.click('button:has-text("建立")');

// 5. Wait for navigation to workspace
await page.waitForURL(/.*workspaces\/.*/, { timeout: 10000 });

// 6. Verify workspace loaded
const title = await page.textContent('h1');
console.log('✅ Workspace created:', title);

// 7. Navigate to workspace list
await page.click('text=工作區');
await page.waitForURL(/.*workspaces$/);

// 8. Verify workspace appears in list
const workspaceLink = await page.locator(`text=${workspaceName}`);
if (await workspaceLink.isVisible()) {
  console.log('✅ Workspace appears in list');
}
```

## Error Detection and Reporting

**Always conclude testing with error summary:**

```typescript
// After all tests complete
console.log('\n=== TEST SUMMARY ===');
console.log(`Total errors: ${errors.length}`);
console.log(`Total warnings: ${warnings.length}`);
console.log(`Total logs: ${logs.length}`);

if (errors.length > 0) {
  console.log('\n🔴 ERRORS FOUND:');
  errors.forEach((err, i) => {
    console.log(`  ${i + 1}. ${err}`);
  });
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS FOUND:');
  warnings.forEach((warn, i) => {
    console.log(`  ${i + 1}. ${warn}`);
  });
}

// Return success/failure status
return errors.length === 0;
```

## Screenshots for Debugging

**Capture screenshots at key points:**

```typescript
// After each major step
await page.screenshot({ 
  path: `/tmp/test-registration-${Date.now()}.png`,
  fullPage: true 
});
```

## Common Patterns

### Wait for Element with Retry

```typescript
async function waitForElement(selector: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      return true;
    } catch (e) {
      console.log(`Retry ${i + 1}/${maxRetries} for ${selector}`);
      await page.waitForTimeout(1000);
    }
  }
  return false;
}
```

### Fill Form with Validation

```typescript
async function fillFormField(selector: string, value: string) {
  await page.waitForSelector(selector);
  await page.fill(selector, value);
  
  // Verify value was set
  const actualValue = await page.inputValue(selector);
  if (actualValue !== value) {
    throw new Error(`Failed to fill ${selector}: expected "${value}", got "${actualValue}"`);
  }
}
```

### Check for Specific Errors

```typescript
// Monitor for specific error patterns
const criticalErrors: string[] = [];

page.on('console', msg => {
  const text = msg.text();
  
  // Check for known error patterns
  if (text.includes('Unsupported field value: undefined')) {
    criticalErrors.push('Firestore undefined value error detected');
  }
  
  if (text.includes('Firebase: Error')) {
    criticalErrors.push('Firebase authentication error: ' + text);
  }
  
  if (text.includes('hydration')) {
    criticalErrors.push('React hydration error: ' + text);
  }
});
```

## Full E2E Test Template

```typescript
async function runFullE2ETest() {
  const testNumber = Math.floor(Math.random() * 10000);
  const errors: string[] = [];
  
  // Setup console monitoring
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  try {
    // 1. Registration
    console.log('Step 1: Testing registration...');
    await page.goto('http://localhost:9002/login');
    await page.click('text=註冊');
    await page.fill('input[name="name"]', `demo${testNumber}`);
    await page.fill('input[type="email"]', `test${testNumber}@demo.com`);
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard.*/);
    console.log('✅ Registration passed');
    
    // 2. Account switcher
    console.log('Step 2: Testing account switcher...');
    const switcher = await page.locator('[data-testid="account-switcher"]');
    await switcher.click();
    await page.waitForTimeout(300);
    console.log('✅ Account switcher passed');
    
    // 3. Workspace creation
    console.log('Step 3: Testing workspace creation...');
    await page.click('text=建立工作區');
    await page.fill('input[name="name"]', `Workspace ${testNumber}`);
    await page.click('button:has-text("建立")');
    await page.waitForURL(/.*workspaces\/.*/);
    console.log('✅ Workspace creation passed');
    
    // 4. Summary
    console.log('\n=== TEST RESULTS ===');
    console.log(`✅ All tests passed`);
    console.log(`Errors detected: ${errors.length}`);
    
    return errors.length === 0;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}
```

## AI Agent Guidelines

When performing Playwright tests as an AI agent:

1. **Always enable console monitoring first**
2. **Use descriptive console.log messages** for each step
3. **Capture and report all errors** found
4. **Take screenshots** on failures
5. **Provide actionable fix suggestions** for errors found
6. **Test incrementally** - one flow at a time
7. **Use the test credentials** specified in this guide
8. **Wait for elements** before interacting
9. **Report both successes and failures** clearly
10. **Document any deviations** from expected behavior

## Maintenance Notes

- Update selectors when UI components change
- Adjust wait times if application becomes slower/faster
- Add new test flows as features are added
- Keep test credentials synchronized with actual test data
- Review and update error patterns as codebase evolves

## Related Files

- **Test Guide:** `.github/prompts/playwright-testing-guide.md`
- **Registration Service:** `src/infra/firebase/auth/account-registration.service.ts`
- **Account Repository:** `src/infra/firebase/firestore/repositories/unified-account.repository.ts`
- **Login Page:** `src/app/(auth)/login/page.tsx`

---

**Version:** 1.0  
**Last Updated:** 2026-02-17  
**Maintained By:** Development Team
