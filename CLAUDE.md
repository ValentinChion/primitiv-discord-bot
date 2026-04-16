# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a financial request management system for Discord consisting of two separate apps:
- **`bot/`** — Cloudflare Worker (serverless) that handles Discord slash commands and interactions
- **`dashboard/`** — Next.js 16 web dashboard for viewing and managing financial requests

Both share the same PostgreSQL database schema via Prisma.

## Commands

### Bot (`bot/`)
```bash
npm run dev          # Local development via wrangler
npm run deploy       # Deploy to Cloudflare Workers
npm run register     # Register slash commands with Discord API
npm run prisma:generate  # Regenerate Prisma client after schema changes
npm run prisma:migrate   # Apply migrations (production)

# Utility scripts
npm run generate-report   # Generate and preview a daily report
npm run test:prompt       # Test Claude AI prompt
npm run test:categories   # List categories
npm run test:cron         # Manually trigger the cron job
```

### Dashboard (`dashboard/`)
```bash
npm run dev          # Next.js development server
npm run build        # Generate Prisma client + Next.js production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit — also runs automatically on every file save via .claude/settings.json hooks
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:migrate   # Apply migrations (dev) — will fail if DB has drift; use `npx prisma db push` instead
npm run prisma:studio    # Open Prisma data browser
```

## Architecture

### Bot (Cloudflare Worker)

Entry point: `bot/src/index.ts` — HTTP handler that receives Discord interaction webhooks and routes to handlers.

**Slash commands:**
- `/demande` — Creates a financial request, stores it in DB, DMs the treasurer (notification only — no buttons)

**Cron job** (`0 4 * * *` UTC daily) — Fetches messages from configured Discord channels, analyzes them with Claude AI, and posts a financial report.

The bot uses **Discord Interactions API** (HTTP-based), not a WebSocket gateway — no persistent connection needed. Handlers are lazy-loaded to avoid unnecessary DB connections on health check requests.

**Subrequest limit:** Cloudflare Workers free tier allows max **50 outbound HTTP requests** per invocation. The daily report pre-filters inactive channels via `last_message_id` snowflake decoding and hard-caps at `MAX_CHANNELS = 40` to stay within this limit. All outbound calls go through `trackedFetch` for visibility.

### Dashboard (Next.js 16)

Route layout uses a `(admin)` route group so `/schedule` has no Navbar while all admin pages share one via `app/(admin)/layout.tsx`.

**Admin routes** (with Navbar):
- `/primitiv` — Home / landing page
- `/primitiv/demande` — Table of all financial requests with inline status updates
- `/primitiv/paiements` — Table of payments with Google Drive invoice links
- `/primitiv/schedule-handler` — CRUD admin for Ekotone festival schedule slots

**Public routes** (no Navbar):
- `/schedule` — Public festival schedule page (no auth, fetches from `/api/schedule`)

API routes: `app/api/demandes/`, `app/api/paiements/`, `app/api/schedule/`, `app/api/schedule/[id]/`

UI built with Shadcn (new-york theme, zinc base color, lucide icons) + Tailwind CSS v4. The `/schedule` page uses Tailwind utilities with custom tokens defined in the `@theme inline` block of `globals.css` (colors `acid`, `sch-bg`, `sch-text`, `sch-muted`, `sch-border`; fonts `bebas`, `mono-share`, `barlow`). No Shadcn on that page. External fonts loaded via `<link>` tags in `app/layout.tsx` — do NOT use `@import url(...)` in `globals.css`; Tailwind's inline expansion pushes it past the CSS spec's "imports must precede all rules" requirement, causing a parse error.

### Database (Prisma + PostgreSQL)

Schema lives in both `bot/prisma/schema.prisma` and `dashboard/prisma/schema.prisma` (kept in sync).

Key models:
- `Demande` — Financial request with status (PENDING, VALIDATED, DENIED) and type (DEMANDE, PAIEMENT, REMBOURSEMENT)
- `Paiement` — Payment record, linked to a Demande
- `Slot` — Ekotone festival schedule slot with `Day` (FRIDAY/SATURDAY/SUNDAY), `Stage` (MAIN/AFTER), `startTime`/`endTime` (DateTime), `artistName`, `note`, `description`, `imageUrl` (uploaded to R2 via `/api/upload`)

**Important:** The bot uses `@prisma/extension-accelerate` because Cloudflare Workers require Prisma Accelerate for connection pooling. The dashboard can use a standard `DATABASE_URL`. These are different npm packages (`@prisma/extension-accelerate@1.2.1` vs `@prisma/extension-accelerate@2.0.2`).

**Schema changes (dashboard):** `prisma migrate dev` will fail with "drift detected" because the remote DB has migrations not present locally. Use `prisma db push` instead to sync the schema directly.

### Services (`bot/src/services/`)

| File | Purpose |
|---|---|
| `database.ts` | Prisma client + `DemandeService` CRUD operations |
| `claude.ts` | Claude API calls (`callClaude`, `callClaudeForJSON`, `callClaudeStreaming`) |
| `messages.ts` | Fetch messages from Discord channels (`getDailyChannelMessages`) |
| `storage.ts` | Upload files to Cloudflare R2, download from Discord CDN |
| `sendMessage.ts` | Send/edit Discord messages |
| `surveys.ts` | Survey handling |
| `trackedFetch.ts` | `fetch()` wrapper that logs `[Subrequest #N] METHOD URL` and counts outbound HTTP calls |

## Environment Variables

### Bot (`.dev.vars` for local, Cloudflare secrets for production)
```
DISCORD_TOKEN, DISCORD_PUBLIC_KEY, DISCORD_APPLICATION_ID
TRESORIER_ID                 # Treasurer's Discord user ID (DM target for new requests)
DATABASE_URL                 # Must be a Prisma Accelerate URL (prisma://...)
R2_PUBLIC_URL                # Public base URL of the R2 bucket (e.g. https://pub-xxxx.r2.dev)
ANTHROPIC_API_KEY            # Optional, for daily report analysis
```

### Dashboard (`.env`)
```
DATABASE_URL                 # Standard PostgreSQL URL
R2_ACCOUNT_ID                # Cloudflare account ID (for artist image uploads)
R2_ACCESS_KEY_ID             # R2 API token key ID
R2_SECRET_ACCESS_KEY         # R2 API token secret
R2_BUCKET_NAME               # R2 bucket name
R2_PUBLIC_URL                # Public base URL of the R2 bucket (same as bot's R2_PUBLIC_URL)
```

## TypeScript Configuration

- **Bot:** `ES2022` target, `bundler` module resolution (Cloudflare Workers compatible)
- **Dashboard:** `ES2017` target, `DOM` libs, path alias `@/*` → `./*`
- Both use strict TypeScript
- Dashboard's `next.config.ts` has `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` — type errors won't fail the build
