---
marp: true
theme: uncover
paginate: true
size: 16:9
style: |
  * { color-scheme: dark; }
  section, section * { box-sizing: border-box; }
  section {
    font-family: 'Inter', sans-serif;
    background-color: #0a0a0a !important;
    color: #e4e4e7 !important;
    font-size: 22px;
    padding: 40px 60px;
  }
  h1 { color: #14F195 !important; font-size: 1.8em; margin-bottom: 12px; }
  h2 { color: #9945FF !important; font-size: 1.3em; margin-bottom: 8px; }
  h3 { color: #14F195 !important; font-size: 1.05em; margin-bottom: 6px; }
  a { color: #14F195 !important; }
  code { background: #1a1a2e !important; color: #14F195 !important; padding: 1px 5px; border-radius: 3px; font-size: 0.85em; }
  pre { font-size: 0.75em; background: #111118 !important; }
  pre code { color: #14F195 !important; }
  strong { color: #ffffff !important; }
  table { font-size: 0.75em; width: 100%; }
  th { background: #1a1a2e !important; color: #9945FF !important; padding: 6px 10px; }
  td { background: #111118 !important; color: #e4e4e7 !important; padding: 5px 10px; }
  blockquote { border-left: 3px solid #9945FF; padding-left: 12px; color: #a1a1aa !important; font-size: 0.95em; }
  blockquote p { color: #a1a1aa !important; }
  ul, ol { font-size: 0.95em; margin: 4px 0; }
  li { margin: 2px 0; color: #e4e4e7 !important; }
  p { margin: 6px 0; color: #e4e4e7 !important; }
  section.lead { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
  section.lead h1 { font-size: 2.6em; }
  section.lead h2 { color: #a1a1aa !important; font-size: 1em; margin-top: 8px; }
  section.lead p { font-size: 0.85em; }
  section::after { color: #555 !important; }
---

<!-- _class: lead -->

# Superteam Academy

## Solana-native learning platform with on-chain credentials, gamified progression, and interactive coding challenges

**Live:** [superteam-academy-phi.vercel.app](https://superteam-academy-phi.vercel.app)
**Repo:** [github.com/KazachiKapai/superteam-academy](https://github.com/KazachiKapai/superteam-academy)

---

# What is Superteam Academy?

An **open-source, production-ready LMS** for Solana developer education.

> "Codecademy meets Cyfrin Updraft" — for Solana

- **Interactive courses** with integrated Monaco code editor
- **On-chain credentials** — soulbound NFTs that evolve as you learn
- **Gamification** — XP, streaks, achievements, leaderboard
- **Multilingual** — EN, PT-BR, ES from day one
- **Forkable** — any community can deploy their own instance

---

# Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 + React 19 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + Radix UI + shadcn/ui |
| Auth | Wallet Adapter (Phantom, Solflare, Coinbase) + Google + GitHub |
| Blockchain | Solana — Anchor 0.32, Token-2022, Metaplex Core |
| CMS | Sanity (headless, fallback to local data) |
| Database | MongoDB |
| AI | Groq via Vercel AI SDK |
| Analytics | PostHog + Sentry + GA4 |
| i18n | next-intl (PT-BR, ES, EN) |
| Deploy | Vercel with preview deployments |

---

# Architecture

```
  Next.js 16 (App Router)
  ┌────────────┬────────────┬──────────────┐
  │   Pages    │    API     │   Server     │
  │  (SSR/SSG) │   Routes   │   Actions    │
  └─────┬──────┴─────┬──────┴──────┬───────┘
        └────────────┼─────────────┘
                     │
        Service Layer (Abstractions)
  ┌──────────┬───────────────┬──────────────┐
  │ Progress │   Identity    │ Chain Reader │
  │ Adapter  │   Adapter     │   Service    │
  └────┬─────┴───────┬───────┴──────┬───────┘
       │             │              │
   MongoDB      MongoDB+Chain   Solana RPC
                                 (Helius)
```

Clean interfaces — swap stubs for on-chain calls without touching UI.

---

# Authentication

### Three sign-in methods

1. **Wallet** — Phantom, Solflare, Coinbase
   - Nonce challenge → signature → JWT (7-day TTL)
2. **Google OAuth** — one-click sign-in
3. **GitHub OAuth** — developer-friendly

### Account Linking

- Sign up with **any** method, link others later in Settings
- Wallet required for on-chain features (enrollment, credentials)
- All methods converge to unified identity in MongoDB

---

# Core Pages (1/2)

| Page | Route | Key Features |
|------|-------|-------------|
| Landing | `/` | Hero, stats, learning paths, testimonials |
| Catalog | `/courses` | Filter by difficulty/tags, progress % |
| Course | `/courses/[slug]` | Modules, enrollment CTA, XP preview |
| Lesson | `/courses/[slug]/lessons/[id]` | Split pane: content + code editor |
| Dashboard | `/dashboard` | Heatmap, streak, continue learning |

---

# Core Pages (2/2)

| Page | Route | Key Features |
|------|-------|-------------|
| Profile | `/profile/[username]` | Stats, badges, credentials, skills |
| Leaderboard | `/leaderboard` | Top 100 by XP, personal rank |
| Roadmaps | `/roadmaps/[slug]` | Interactive ReactFlow graph |
| Certificates | `/certificates/[id]` | On-chain verification, shareable |
| Settings | `/settings` | Account linking, language, theme |

**+ Admin routes:** `/admin`, `/admin/courses`, `/admin/users`, `/admin/settings`

---

# Interactive Code Editor

**Monaco Editor** with Solana-specific features:

- Rust & TypeScript syntax highlighting
- Starter code templates per challenge
- Test case runner with pass/fail output
- Progressive hints (reveal one at a time)
- Solution viewer
- Resizable split pane — content left, editor right

**Flow:** Read prompt → Write code → Run tests → See results → Earn XP

---

# Gamification — XP & Levels

- XP earned from lessons, challenges, courses, streaks
- Level formula: `Level = floor(sqrt(totalXP / 100))`
- On-chain: soulbound Token-2022 tokens (NonTransferable)
- Stubbed locally — ready for on-chain minting

### Streaks

- Daily activity tracking with calendar visualization
- Milestones at 7, 30, 100 days
- Streak freeze support

---

# Gamification — Achievements

8 unlockable badges backed by soulbound Metaplex Core NFTs:

| Badge | Condition |
|-------|-----------|
| First Steps | Complete your first course |
| Code Warrior | Complete 2+ courses |
| Streak Master | 7+ day streak |
| Top 100 | Reach leaderboard |
| Anchor Pro | Anchor-focused courses |
| DeFi Builder | DeFi track courses |
| Bug Hunter | Find and report bugs |
| Speed Demon | Fast course completion |

---

# On-Chain Integration

### Live on Devnet

- Wallet authentication (multi-wallet adapter)
- XP balance display (Token-2022 reads)
- Credential display (Metaplex Core NFT metadata)
- Course enrollment (learner signs transaction)
- Leaderboard (indexed from on-chain XP)

### Stubbed with clean abstractions

- Lesson completion (backend-signed)
- Course finalization & credential issuance
- Achievement claiming

**Services:** `ProgressAdapter` / `IdentityAdapter` / `ChainReadService`

---

# On-Chain Credentials

**Soulbound NFTs that evolve with the learner**

- **One NFT per track** — upgrades in place, no wallet clutter
- **PermanentFreezeDelegate** — truly soulbound
- **Verifiable** on Solana Explorer
- **Shareable** certificate page with download

### Credential Data

Track, level, courses completed, total XP, mint address, owner, cluster — all stored on-chain as NFT attributes.

---

# i18n — Three Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | Full UI |
| Portugues (BR) | `pt-br` | Full UI |
| Espanol | `es` | Full UI |

- All UI strings externalized in JSON
- Language switcher in header
- Cookie persistence + Accept-Language fallback
- `next-intl` with server & client support

---

# AI Assistant

**Groq-powered** contextual learning companion:

- Floating chat widget on every page
- Quick prompts: "Which course to start?", "Explain a concept", "Help with challenge"
- Markdown rendering with syntax-highlighted code
- Context-aware — knows courses and platform structure
- Guides without giving full solutions

---

# Learning Roadmaps

**Interactive graph visualization** with ReactFlow:

- **Solana Developer** — Fundamentals → Programs → Token-2022
- **dApp Developer** — Frontend → Wallet → Full Stack
- **DeFi Developer** — AMMs → Lending → Advanced DeFi

Features: zoom, pan, mini-map, click nodes for detail panel with resources, dark/light theme aware.

---

# Admin Dashboard

- **Analytics** — XP, streak, level distribution charts
- **Stats** — Total learners, courses, XP, active today
- **Course CRUD** — Create, edit, delete with on-chain sync
- **User Management** — Search by wallet, view stats
- **Per-user analytics** — Individual learner deep-dive
- **Platform settings** — Global configuration

Routes: `/admin`, `/admin/courses`, `/admin/users`, `/admin/settings`

---

# CMS & Analytics

### Sanity CMS

- Course → Module → Lesson schema
- Draft/publish workflow, media management
- **Fallback mode** — works without Sanity via local data

### Analytics (3 layers)

| Tool | Purpose |
|------|---------|
| PostHog | Session replay, heatmaps, custom events |
| Sentry | Error monitoring, 100% replay on error |
| GA4 | Funnel: enroll → complete → credential |

All conditional — only initialize if env vars set.

---

# Performance & Deployment

### Optimizations

- Turbopack builds, Suspense + async server components
- Tree-shaking (`optimizePackageImports`), dynamic imports
- Image optimization (AVIF/WebP), RPC caching (30s TTL)

### Targets

Lighthouse 90+ Performance, 95+ Accessibility, LCP < 2.5s

### Deployment

**Live:** [superteam-academy-phi.vercel.app](https://superteam-academy-phi.vercel.app)
Preview deploys on every PR, Playwright E2E tests, bundle analysis

---

# What Sets This Apart

| Feature | Implementation |
|---------|---------------|
| On-chain credentials | Soulbound NFTs that upgrade per track |
| Solana integration | Wallet auth, enrollment txns, XP on Devnet |
| Code editor | Monaco + Rust, test runner, hints |
| AI assistant | Contextual companion, not a chatbot |
| Admin dashboard | Analytics + course/user management |
| 3 languages | EN, PT-BR, ES externalized |
| Clean abstractions | Service layer ready for on-chain swap |
| Roadmaps | Interactive graph with resources |

---

# Bonus Features

- Admin dashboard with analytics and CRUD
- AI learning assistant (Groq)
- Interactive roadmaps (ReactFlow graphs)
- E2E tests (Playwright)
- Bundle analysis (`@next/bundle-analyzer`)
- Account linking (wallet + Google + GitHub)
- Activity heatmap (GitHub-style)
- Command palette (`cmdk`)
- Dark/light theme with system detection

---

<!-- _class: lead -->

# Thank You

**Live Demo:** [superteam-academy-phi.vercel.app](https://superteam-academy-phi.vercel.app)

**GitHub:** [github.com/KazachiKapai/superteam-academy](https://github.com/KazachiKapai/superteam-academy)

Next.js 16 · React 19 · Solana · TypeScript · Tailwind CSS
**Superteam Academy Team** for **Superteam Brazil**
