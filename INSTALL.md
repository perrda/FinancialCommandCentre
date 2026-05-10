# Setting up FCC v8 — step by step

This guide is written for someone who's comfortable copy-pasting Terminal commands but doesn't write code. Every step tells you what to type, what should happen, and what to do if something goes wrong.

> **Important:** none of this touches your existing FCC. v7.47 keeps working exactly as it does now. We're building v8 alongside it on a separate branch.

---

## Before you start — what you need

You need three things on your Mac:

1. **Terminal** — built into macOS, find it via Spotlight (Cmd+Space, type "Terminal").
2. **Node.js 20+** — the runtime that powers the build tools.
3. **pnpm 9+** — the package manager.

Steps 0a, 0b, 0c below get you those three. Skip any you already have.

---

### Step 0a — Check if you have Node.js

In Terminal:

```bash
node --version
```

**If you see** `v20.something` or `v22.something` — you're good, skip to 0b.
**If you see** `v18.something` or older, or `command not found` — install or upgrade.

To install or upgrade: download the **LTS** version from <https://nodejs.org/> and run the `.pkg` installer. Click through the defaults. Then close Terminal and reopen it.

---

### Step 0b — Install pnpm

```bash
npm install -g pnpm
```

When done, verify:

```bash
pnpm --version
```

**You should see** `9.something`. If you see anything 8 or older, run `npm install -g pnpm@latest` and check again.

---

### Step 0c — Verify Git knows who you are

```bash
git config --global user.name
git config --global user.email
```

If both print your name and email, you're set. If either is blank, set them:

```bash
git config --global user.name "David Perry"
git config --global user.email "your-email@example.com"
```

---

## Step 1 — Create the v8 branch

Navigate into your FCC project:

```bash
cd /Users/davidperry/Desktop/iCloud/AI_Projects/FCC
```

Make sure you're up to date and on a clean state:

```bash
git status
git pull
```

**You should see** "nothing to commit, working tree clean" (or similar). If you have uncommitted changes, commit or stash them first.

Now create the v8 branch:

```bash
git checkout -b v8-foundation
```

**You should see** `Switched to a new branch 'v8-foundation'`.

---

## Step 2 — Add the foundation files

Download `fcc-v8-foundation.zip` (provided alongside this guide) and unzip it. You'll get a folder called `fcc-v8-foundation` containing the new project skeleton.

In Terminal, copy the contents into your FCC directory. Replace `~/Downloads/fcc-v8-foundation` with the actual path where you unzipped it:

```bash
cp -R ~/Downloads/fcc-v8-foundation/. /Users/davidperry/Desktop/iCloud/AI_Projects/FCC/
```

The trailing `/.` is important — it copies the contents (including hidden files like `.gitignore`), not the folder itself.

Verify it landed:

```bash
ls -la
```

**You should see** new files: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`, `.nvmrc`, `README.md`, plus folders `packages/`, `docs/`, `.github/`.

Your existing `financial_command_centre.html` (the v7.47 monolith) should still be there too — completely untouched.

---

## Step 3 — Install everything

```bash
pnpm install
```

**What happens:** pnpm downloads Vue, Vite, TypeScript, Vitest, and a few other packages. First run takes about 30–60 seconds.

**You should see** something ending in:
```
Done in 30s
```

**If you see errors:** the most common ones are:
- "ERR_PNPM_LOCKFILE_VERSION_MISMATCH" — run `pnpm install --no-frozen-lockfile` instead.
- Network errors — check your internet, try again.
- Permission errors — make sure you're in the right directory, not a system folder.

---

## Step 4 — Run the dev server

```bash
pnpm dev
```

**What happens:** Vite starts up, your default browser should open automatically to <http://localhost:5173/>.

**You should see** an FCC-branded page that says "v8 — under construction", with a Phase, Version, Build time, and a counter that ticks every second. The counter is a smoke test — if it's incrementing, the whole toolchain (Vue + TypeScript + Vite + reactivity) is working end-to-end.

**To stop the dev server:** in Terminal, press `Ctrl+C`.

---

## Step 5 — Run the tests

```bash
pnpm test
```

**You should see** something like:
```
✓ src/smoke.test.ts (2)
  ✓ toolchain smoke test (2)
    ✓ Vitest runs
    ✓ TypeScript types work

Test Files  1 passed (1)
     Tests  2 passed (2)
```

That's the foundation tested.

---

## Step 6 — Run a production build

```bash
pnpm build
```

**You should see** Vite produce output in `packages/web/dist/`. The build summary at the end shows file sizes — for the placeholder app, the JS bundle should be under 100 KB.

This is what Cloudflare Pages will serve once we hook it up.

---

## Step 7 — Commit and push

You've now got a working v8 foundation. Commit it:

```bash
git add .
git commit -m "Phase 0: v8 monorepo foundation (Vue 3 + TS + Vite)"
git push -u origin v8-foundation
```

**You should see** a push success message ending with something like:
```
* [new branch]      v8-foundation -> v8-foundation
```

GitHub will now run the CI workflow on your branch automatically. To see it: go to <https://github.com/perrda/FCC>, click the "Actions" tab. You should see your commit running through type-check, test, and build. Green check = success.

---

## Step 8 — (Later session) Connect Cloudflare Pages

This is for the next session. We'll set up Cloudflare Pages to deploy the `v8-foundation` branch as a preview, alongside the existing v7.47. Both will be live, both will work.

Don't do this yet — it needs a few decisions that are easier with you on the call.

---

## What's done at the end of Step 7

✅ Monorepo skeleton in place
✅ Vue 3 + TypeScript + Vite working locally
✅ Tests running
✅ CI green on GitHub
✅ v7.47 monolith completely untouched
✅ Ready for Phase 1 next session

That's Phase 0 complete.

---

## If anything goes wrong

Tell me what step you got stuck on, paste the error message you saw, and I'll diagnose. Don't try to fix it by guessing — these tools have specific error patterns and there's almost always a known cause.

The branch is safe — your real FCC is on `main`, untouched. Worst case you delete the `v8-foundation` branch and we start over.
