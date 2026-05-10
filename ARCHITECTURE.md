# FCC Architecture Proposal — Modularisation & Stack

> Status: **Draft for review**
> Owner: David Perry
> Last revised: 10 May 2026
> Supersedes: implicit single-file architecture (v1.0–v7.47)

---

## 1. Purpose & non-goals

This document proposes the target architecture for FCC v8 onward. Its job is to **lock decisions before any file moves**, so the modularisation work is mechanical rather than discovery.

### Goals

1. Eliminate the corruption-prone monolith. Files small enough to read in full, edited safely.
2. Unblock the tech lock-ins already agreed: server-side API keys, event delegation, CSP tightening, Workers-based proxy, Cloudflare Pages + Workers + D1.
3. Provide a foundation for real cloud sync, real auth, and the v8.0 data sync roadmap (iCloud → Firebase/Supabase → Sheets → Notion).
4. Preserve every shipped feature and David's data through migration.
5. Make the codebase one a senior engineer would inherit without flinching.

### Non-goals

- No feature additions in this phase. Pure structural migration.
- No design changes. Orange FCC branding, current UX, current information architecture all preserved.
- No deletion of working code "because it's old". The strangler approach replaces, then retires.

---

## 2. Decisions needing your sign-off

These are the choices that determine everything downstream. **None of them is silently picked** — each lists alternatives and the reasoning for the recommendation.

| # | Decision | Recommendation | Reversibility |
|---|----------|----------------|----------------|
| D1 | Build tool | **Vite** | Easy to swap |
| D2 | Language | **TypeScript** (gradual, allow JS during migration) | Hard to reverse once committed |
| D3 | UI framework | **Vue 3** (with explicit alternatives below) | Very hard to reverse |
| D4 | CSS strategy | **CSS Modules + design-token CSS variables** | Medium |
| D5 | State management | **Pinia** (if Vue) / lightweight store equivalent | Medium |
| D6 | Repo layout | **pnpm monorepo** with `web` + `workers` + `shared` packages | Easy early, harder later |
| D7 | Testing stack | **Vitest** (unit) + **Playwright** (E2E) | Easy |
| D8 | Module-level testing gate | **Required** — no module merges without tests | Cultural, not technical |

The **only** decision I'd flag as genuinely contentious is **D3 (framework)**. It deserves a real conversation rather than a rubber-stamp. Section 4 lays out the trade-off.

---

## 3. Stack: build, language, infra

### D1 — Build: Vite

Vite is the near-default for Cloudflare Pages in 2026. Native ESM, fast HMR, first-class TypeScript, plugin ecosystem, official Cloudflare integration. Webpack is heavier and slower; Parcel has weaker Cloudflare alignment; Rollup-direct gives up DX for no real win (Vite uses Rollup for production builds anyway). No serious alternative.

### D2 — Language: TypeScript

The current FCC handles real money and real tax calculations. The class of bugs TypeScript prevents — wrong shape passed to a calculator, undefined where a number was expected, stale property references after a refactor — is exactly the class of bugs that has cost time historically (e.g. the journal `qty` vs `quantity` mismatch in v5.30).

**Migration approach:** allow `.js` and `.ts` to coexist during the transition. Each module becomes TS as it's extracted. Strict mode on from day one for new code; existing code can use looser settings until ported. No "big bang" rewrite.

Alternative considered: stay JS, use JSDoc types. Rejected because IDE and refactor support is materially worse for a codebase this size, and the user explicitly wants production-grade rigor.

### D6 — Repo layout: pnpm monorepo

Cloudflare deployment requires both web app and Workers, and they need to share types and schemas (especially for D1 and sync). The standard pattern is:

```
FCC/
├── packages/
│   ├── web/                # The PWA — Cloudflare Pages target
│   ├── workers/            # Cloudflare Workers (one subdir per worker)
│   │   ├── api-vault/
│   │   ├── proxy/
│   │   ├── sync/
│   │   └── auth/
│   └── shared/             # Types, schemas, pure utilities used by both
├── tools/                  # Scripts: validators, codemod helpers, deploy
├── docs/                   # This file lives here
├── .github/workflows/      # CI
├── package.json            # Workspace root
├── pnpm-workspace.yaml
└── README.md
```

pnpm over npm/yarn: faster, stricter (catches phantom dependencies), better disk usage. Workspaces are the standard way to share code between web and workers without publishing private packages.

### D7 — Testing: Vitest + Playwright

Vitest is Vite-native, near-instant, Jest-compatible API. Playwright covers the cross-browser E2E story including iOS Safari emulation. The 98-test suite from v5.46 gets reborn at module level — most of it stops being end-to-end smoke and becomes proper unit tests.

---

## 4. The framework decision (D3)

This is the call worth thinking carefully about. Five real options:

### Option A — Stay vanilla (no framework)

The current approach. Keeps bundle size minimal, no learning curve, no framework churn risk.
**Why not:** the existing event-delegation work, the 27 tabs each managing their own DOM, the included/excluded toggles that have to update 6 different totals — these are the problems frameworks solve. Doing it vanilla in a modular codebase means writing your own framework, badly. Rejected.

### Option B — Vue 3 (Composition API)

Mature ecosystem. Excellent docs. Single-file components map cleanly onto FCC's tab structure. Pinia for state. Gentle migration path from vanilla — you can `mount()` Vue into existing DOM nodes incrementally, which matches the strangler approach.

**Strengths:** the gentlest migration of the modern frameworks. Templates feel close to existing HTML. Composition API gives the reactive primitives without React's mental overhead. Strong TypeScript support post-3.4.

**Weaknesses:** larger bundle than Solid or Svelte. The migration story (Options API → Composition API) means some tutorials are dated. Less "cutting edge" than Solid.

### Option C — Solid

Best-in-class performance. Signals model is the most ergonomic reactive primitive available. JSX without React's quirks. Tiny runtime.

**Strengths:** the technically strongest choice for an iOS PWA where performance matters. Smallest bundle. Cleanest mental model post-2024.

**Weaknesses:** smaller ecosystem. Fewer pre-built UI primitives. Migration is more disruptive — JSX is a bigger leap from existing HTML/JS than Vue templates.

### Option D — Svelte 5 (with Runes)

Compile-time framework, very small runtime. Runes (post-Svelte 5) give a similar reactive model to Solid. Strong Apple-aesthetic component ecosystem.

**Strengths:** smallest production bundle. Component syntax is approachable. Good iOS perf characteristics.

**Weaknesses:** Runes are recent enough that some library compatibility lags. Smaller ecosystem than Vue. Compile-time magic can be hard to debug when it breaks.

### Option E — React

The largest ecosystem. The most hireable. The most widely-known.
**Why not the recommendation:** for a single-developer-plus-AI project on Cloudflare, "hireability" doesn't matter. React's bundle, hooks gotchas, and re-render footguns are real costs without offsetting benefits at this scale. Useful as the "safe default", weak as the technical choice.

### Recommendation: Vue 3

Three reasons it edges out Solid and Svelte:

1. **Migration risk.** Vue's `mount(component, existingNode)` plus the closeness of templates to existing HTML means the strangler pattern is mechanical. With Solid or Svelte, every extracted module is also a syntax migration.
2. **Ecosystem maturity.** Pinia, Vue Router, VueUse, headless UI libraries — the production-grade pieces exist and are stable. Solid and Svelte have most of these but with thinner library ecosystems for the long tail.
3. **The technical gap to Solid is small.** Vue 3's reactivity is genuinely good. The bundle difference is ~30KB gzipped — not trivial, but not the bottleneck. iOS PWA performance is bound by storage I/O and chart rendering, not framework runtime.

If "cutting edge" weighs heavier than "lowest migration risk", **Solid is the alternative I'd pick second**. I'd push back on Svelte mainly because of the Runes-era ecosystem gaps.

**Decision needed from you.** I can produce a 50-line proof-of-concept extraction (e.g. the Subscriptions tab) in any of Vue / Solid / Svelte if you want to feel the difference before committing. That's a one-session investment that derisks the next six months.

---

## 5. Module layout (web package)

Inside `packages/web/src`:

```
src/
├── core/                   # App boot, router, lifecycle, shell
│   ├── App.vue             # Root component
│   ├── main.ts             # Entry point
│   ├── router.ts           # Tab routing
│   └── shell/              # Header, nav, footer, modals frame
├── features/               # One folder per tab. Self-contained.
│   ├── overview/
│   │   ├── OverviewTab.vue
│   │   ├── components/     # Tab-private components
│   │   ├── composables/    # Tab-private hooks
│   │   ├── store.ts        # Tab-private state slice
│   │   └── index.ts        # Public API: lazy-loaded entry
│   ├── crypto/
│   ├── equity/
│   ├── liabilities/
│   ├── analytics/          # Health Score, Wealth Velocity, etc.
│   ├── tax/
│   ├── debt-optimizer/
│   ├── what-if/
│   ├── journal/
│   ├── recurring/
│   ├── subscriptions/
│   ├── budget/
│   ├── fire/
│   ├── goals/
│   ├── milestones/
│   ├── alerts/
│   ├── notifications/
│   ├── assistant/
│   ├── family/
│   ├── achievements/
│   ├── integrations/
│   ├── documents/
│   ├── data-management/
│   └── settings/
├── shared/                 # Reusable UI primitives, no domain logic
│   ├── components/         # Card, Modal, Toast, Button, Toggle…
│   ├── charts/             # SVG chart primitives
│   ├── icons/
│   └── layout/
├── data/                   # Domain layer
│   ├── stores/             # Pinia stores: profile, holdings, settings…
│   ├── models/             # Domain types: Holding, Liability, Profile…
│   ├── schemas/            # Zod schemas for validation
│   ├── migrations/         # localStorage version migrations
│   └── persistence/        # Storage adapters (local, iCloud, D1)
├── services/               # Side-effectful boundaries
│   ├── api/                # CoinGecko, Yahoo, exchange APIs (via Worker)
│   ├── sync/               # Cloud sync orchestration
│   ├── auth/               # Auth flows
│   └── notifications/      # Push, in-app, sound
├── styles/
│   ├── tokens.css          # Design tokens (FCC orange, spacing, type)
│   ├── reset.css
│   └── global.css
└── utils/                  # Pure functions only. No state, no IO.
    ├── format.ts           # fmt(), fmtFull(), fmtNum() — battle-tested helpers
    ├── parse.ts            # parseNum(), safeDivide()
    ├── sanitize.ts
    └── dates.ts
```

### Why this shape

- **Features are vertical slices.** Each tab owns its components, state slice, and styles. Moving a feature is one folder, not a hunt.
- **`data/` separates domain from UI.** Stores, models, schemas — the things that survive a UI rewrite live here.
- **`services/` is the boundary to the outside world.** Anything with network I/O, storage I/O, or browser APIs goes here. Makes mocking trivial.
- **`shared/` is for UI primitives only.** No business logic ever lives here. The test: could this component render in a Storybook with no FCC context? If yes, it's shared.
- **`utils/` is pure functions only.** Anything with side effects belongs in `services/`.

### Lazy loading

Each `features/*/index.ts` is a Vite dynamic import target. The router lazy-loads features as tabs are opened. Initial bundle stays small (Overview + shell + shared). The 1.8MB monolith problem dissolves.

---

## 6. Workers topology

Four small Workers, not one big one. Each does one job and can be deployed independently.

| Worker | Job | D1 access? | KV/Secrets |
|--------|-----|-----------|------------|
| **api-vault** | Holds CoinGecko / Yahoo / Plaid / exchange keys server-side. Web calls authenticated endpoints; vault adds the key. | No | KV: rate-limit counters. Secrets: API keys. |
| **proxy** | CORS-safe pass-through for read-only public APIs that don't need keys but block browsers. | No | KV: response cache. |
| **sync** | Reads/writes to D1. Per-profile data, snapshots, journal, settings. | Yes | — |
| **auth** | Sign-up, sign-in, session tokens, 2FA. Issues JWTs that other Workers verify. | Yes (users table) | Secrets: JWT signing key. |

Auth must ship before sync, because sync without auth is data leakage.

`packages/shared/` holds the request/response types so web and Workers stay in sync.

### Why four Workers, not one

- Independent deploy = blast radius limited.
- Independent secrets = key vault is the only Worker that touches API keys.
- Smaller Worker = faster cold start (Cloudflare's per-Worker CPU and memory limits).
- Easier to reason about, easier to test.

---

## 7. Migration strategy

**Strangler pattern.** The monolith and the new code coexist. Every session, one slice moves. The monolith never gets edited again — only retired piece by piece.

### Phase 0 — Foundation (1 session)

Set up the monorepo skeleton, Vite config, TypeScript config, Vitest config, CI on GitHub Actions running `pnpm test` and `pnpm build`. Empty `web` package with a placeholder `index.html` that just shows "FCC v8 — under construction" plus a working link to the v7.47 monolith hosted side-by-side.

**Verify:** CI green. Empty web package deploys to Cloudflare Pages preview. Existing monolith still accessible.

### Phase 1 — Domain extraction (2–3 sessions)

Move `data/` first: types, schemas, stores, persistence adapters. Port `utils/` (format, parse, sanitize). These are pure and testable in isolation. Write Vitest tests as you go.

The new `data/` layer reads the **same localStorage keys** the monolith uses. This is the bridge: both versions read and write the same store, so they're never out of sync.

**Verify:** monolith still works. New data layer has tests. localStorage shape unchanged.

### Phase 2 — Shell (1 session)

Build `core/` and `shared/`: app shell, header, nav, modals frame, design tokens. Render the existing HTML skeleton through the new framework, but with no tab content yet — every tab links back to the monolith.

**Verify:** new shell renders correctly on iPhone, iPad, desktop. All three breakpoints visually match v7.47.

### Phase 3 — Feature-by-feature migration (10–15 sessions)

One feature per session. Recommended order, leaf-first:

1. **Settings** (small, well-bounded, exercises the framework on real config)
2. **Subscriptions** (recent, clean, good test of CRUD + chart pattern)
3. **Goals**, **Milestones** (similar shape, batchable)
4. **Budget**, **FIRE**, **What-If** (calculator-style, mostly pure functions)
5. **Journal**, **Recurring**, **Income** (transactional, share patterns)
6. **Tax** (heavier — Section 104 pools, B&B detection)
7. **Crypto**, **Equity**, **Liabilities** (the core holdings — touches everything)
8. **Analytics** (Health Score, Wealth Velocity, Period Comparison — depends on holdings)
9. **Debt Optimizer**, **Rebalance** (depends on liabilities + holdings)
10. **Overview** (last — it aggregates everything else)
11. **Family**, **Profiles** (touches storage layer; do after data is solid)
12. **Assistant**, **Notifications**, **Alerts**, **Integrations**, **Documents**, **Achievements**, **Data Management** (cleanup pass)

Each session: extract feature → write tests → swap the monolith's tab to load the new component → verify in browser → ship.

**Verify each session:** feature works identically to v7.47. Tests pass. Bundle size monitored.

### Phase 4 — Workers (3–4 sessions)

Build the four Workers. Auth first, then api-vault, then proxy, then sync. Each gets its own integration tests against a local Wrangler dev server.

The web app gets a feature flag per Worker: `useAuthBackend`, `useApiVault`, etc. Rollout is gradual; rollback is one flag.

### Phase 5 — Monolith retirement (1 session)

When every tab is on the new code path, the monolith's HTML is stripped to a redirect. The `.html` file remains in git history. This is the moment v7.47 stops being the source of truth.

### Total estimate

20–25 working sessions. Most sessions are <2 hours of focused work. The whole migration is realistically 6–10 weeks at one session every other day, faster if pushed.

---

## 8. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Data loss during migration | Low | Catastrophic | Phase 1 reads same localStorage keys. iCloud backup before every session. D1 sync after Phase 4 means cloud copy. |
| Visual regression | Medium | Medium | Phase 2 visual diff against v7.47 screenshots. Per-feature visual diff in Phase 3. |
| Framework choice regret | Low | High | Optional POC before committing (Section 4). Easy to swap **before** any real code; near-impossible **after**. |
| Migration stalls midway | Medium | Medium (codebase has both old and new) | Per-feature flags so partial migration is shippable. Strangler means every session is shippable. |
| iOS Safari surprises | Medium | Medium | Playwright iOS emulation in CI. Real-device test before retiring monolith. |
| Cloudflare-specific footguns | Low | Medium | Workers-local dev mirrors production. CI builds with `wrangler deploy --dry-run`. |
| Scope creep ("while we're in here…") | High | High | This document explicitly forbids feature work during migration. Add to backlog instead. |

---

## 9. Decisions log

When you sign off, record the decision and date. Future-you (and future-me) will thank you.

| Date | Decision | Choice | Rationale | Sign-off |
|------|----------|--------|-----------|----------|
| | D1 — Build tool | | | |
| | D2 — Language | | | |
| | D3 — Framework | | | |
| | D4 — CSS strategy | | | |
| | D5 — State mgmt | | | |
| | D6 — Repo layout | | | |
| | D7 — Testing | | | |
| | D8 — Test gate | | | |

---

## 10. What I need from you next

1. **Sign off the decisions in section 2** (or push back on any of them).
2. **Specifically commit on D3 (framework)**, or ask for the POC.
3. **Confirm Phase 0** is the next session's work, or flag anything that needs to happen before it.
4. **Anything in this doc that's wrong, missing, or assumes something I shouldn't be assuming.**

Once D1–D8 are locked, I can produce the Phase 0 setup PR in one session.
