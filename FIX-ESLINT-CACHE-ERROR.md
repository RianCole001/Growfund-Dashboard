# Fix ESLint Cache Error - 'openHelp' is not defined

## Problem

You're getting an ESLint error:
```
ERROR[eslint]  src\components\CapitalPlan.js   Line 82:94:  'openHelp' is not defined  no-undef
```

But `openHelp` IS defined in the component on line 54:
```javascript
const openHelp = () => setShowHelpModal(true);
```

## Root Cause

This is a **stale ESLint cache** issue. The linter is reporting an old error that no longer exists.

## Solution

Clear the ESLint cache and restart the dev server:

### Option 1: Quick Fix (Recommended)

1. **Stop the dev server** (Ctrl+C in the terminal)
2. **Delete the cache folder:**
   ```bash
   rmdir /s /q node_modules\.cache
   ```
3. **Restart the dev server:**
   ```bash
   npm start
   ```

### Option 2: Full Clean

1. **Stop the dev server** (Ctrl+C)
2. **Delete node_modules and cache:**
   ```bash
   rmdir /s /q node_modules
   rmdir /s /q node_modules\.cache
   del package-lock.json
   ```
3. **Reinstall dependencies:**
   ```bash
   npm install
   ```
4. **Restart the dev server:**
   ```bash
   npm start
   ```

### Option 3: Manual Cache Clear

1. **Stop the dev server** (Ctrl+C)
2. **Navigate to the project:**
   ```bash
   cd Growfund-Dashboard/trading-dashboard
   ```
3. **Clear cache:**
   ```bash
   npm cache clean --force
   ```
4. **Restart:**
   ```bash
   npm start
   ```

## Verification

After clearing the cache and restarting:

1. The error should disappear
2. The app should compile successfully
3. `openHelp` function should work correctly

## Why This Happens

ESLint caches analysis results to speed up subsequent runs. Sometimes the cache becomes stale and reports errors that no longer exist. Clearing the cache forces ESLint to re-analyze the code.

## Prevention

To prevent this in the future:
- Restart the dev server after making significant changes
- Use `npm start` instead of keeping the server running indefinitely
- Clear cache periodically: `npm cache clean --force`
