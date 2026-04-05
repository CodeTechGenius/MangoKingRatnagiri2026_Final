# Fix: Cannot find module '__SERVER__/internal.js'

## Root Cause

This error happens because:
1. `@sveltejs/adapter-static` was used — it does NOT support SSR and conflicts with
   SvelteKit's server runtime module `__SERVER__/internal.js`
2. `.svelte-kit/` folder (generated files) doesn't exist yet — you must run
   `svelte-kit sync` before starting the dev server

## Fixes Applied (already in the updated files)

### 1. Replaced adapter-static → adapter-node

`svelte.config.js`:
```js
// BEFORE (broken)
import adapter from '@sveltejs/adapter-static';
const config = { kit: { adapter: adapter({ fallback: 'index.html' }) } };

// AFTER (fixed)
import adapter from '@sveltejs/adapter-node';
const config = { kit: { adapter: adapter() } };
```

### 2. Added svelte-kit sync to dev script

`package.json`:
```json
"scripts": {
  "dev": "svelte-kit sync && vite dev"
}
```

### 3. Removed ssr: false from layout.ts files

`src/routes/(app)/+layout.ts`:
```ts
// BEFORE (broken with adapter-node)
export const ssr = false;

// AFTER
export const prerender = false;
```

### 4. Fixed store files to use browser guard

```ts
// BEFORE (breaks SSR)
const token = localStorage.getItem('auth_token');

// AFTER (safe)
import { browser } from '$app/environment';
if (browser) { const token = localStorage.getItem('auth_token'); }
```

---

## Fresh Setup Steps (Windows)

Open PowerShell or Command Prompt inside the `client/` folder:

```powershell
# Step 1: Delete stale generated files (if they exist)
rmdir /s /q .svelte-kit
rmdir /s /q node_modules
rmdir /s /q build

# Step 2: Install dependencies (now includes adapter-node instead of adapter-static)
npm install

# Step 3: Generate SvelteKit internal files
npx svelte-kit sync

# Step 4: Start dev server
npm run dev
```

The `npm run dev` script now runs `svelte-kit sync` automatically before starting Vite,
so you only need to do Step 3 manually the very first time.

---

## Quick Fix (if you don't want to re-download)

If you already have the project and just want to patch it:

**1. Update `package.json`** — change adapter and dev script:
```json
{
  "scripts": {
    "dev": "svelte-kit sync && vite dev"
  },
  "devDependencies": {
    "@sveltejs/adapter-node": "^3.0.0"
  }
}
```
Remove `"@sveltejs/adapter-static"` from devDependencies.

**2. Update `svelte.config.js`**:
```js
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      $lib: 'src/lib',
      $api: 'src/lib/api',
      $stores: 'src/lib/stores',
      $components: 'src/lib/components',
      $utils: 'src/lib/utils'
    }
  }
};
export default config;
```

**3. Update `src/routes/(app)/+layout.ts`**:
```ts
export const prerender = false;
```
Remove `export const ssr = false;`

**4. Reinstall and sync**:
```powershell
npm install
npx svelte-kit sync
npm run dev
```

---

## If You See Other Errors After This Fix

### "Cannot find module '$lib/...'"
Run: `npx svelte-kit sync` — this creates the path aliases in `.svelte-kit/tsconfig.json`

### "Module not found: lucide-svelte"
The project doesn't use lucide-svelte anymore (removed). All icons are emoji/SVG.

### Port 5173 already in use
```powershell
npx kill-port 5173
npm run dev
```

### CORS errors when calling /api/*
Make sure the server is running on port 4000:
```powershell
# In server/ folder
npm run dev
```
The Vite proxy in `vite.config.js` forwards `/api/*` to `http://localhost:4000`.
