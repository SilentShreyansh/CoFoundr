# CoFoundr

> Where startups are born together — a platform to share startup ideas, find co-founders, build teams, and collaborate.

Built with **Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn UI · Prisma · PostgreSQL · Auth.js · React Query**.

This project is being built in **verified vertical slices**. Each slice compiles and runs before the next begins.

| Slice | Scope | Status |
|------|-------|--------|
| 1 | Foundation: scaffold, full Prisma schema (16+ tables), Docker Postgres, seed | ✅ |
| 2 | Authentication (email/password + Google + GitHub, sessions, reset/verify) | ✅ |
| 3 | Profiles + Posts + Feed core loop (CRUD, infinite scroll, likes/comments/saves) | ✅ |
| 4 | Teams + Applications (apply/accept/reject, membership) | ✅ |
| 5 | Notifications center (nav bell + count, mark read) | ✅ |
| 6 | Real-time messaging (Pusher presence + polling fallback, receipts/typing/online) | ✅ |
| 7 | Search (ideas + people) + weekly Leaderboard (+ Vercel cron snapshot) | ✅ |
| 8 | Founder analytics, Admin dashboard, AI recommendations | ✅ |

All slices compile and pass `tsc --noEmit` + `npm run build` (31 routes). **Runtime flows still need a Postgres database to exercise** — see Quick start.

---

## Prerequisites

- Node.js 20+ (tested on 24)
- Docker Desktop (for local Postgres) — or any Postgres 14+ connection string

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env and adjust if needed
cp .env.example .env

# 3. Start Postgres (Docker)
docker compose up -d

# 4. Create the schema and seed demo data
npm run db:push
npm run db:seed

# 5. Run the app
npm run dev
```

App runs at http://localhost:3000.

**Seeded logins** (password for all: `password123`):
`ada@cofoundr.dev` (admin), `bruno@cofoundr.dev`, `carmen@cofoundr.dev`, `diego@cofoundr.dev`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Generate Prisma client + production build |
| `npm run db:push` | Push the Prisma schema to the database (no migration history) |
| `npm run db:migrate` | Create + apply a migration (dev) |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Drop, re-create, and re-seed the database |

## Environment variables

See [`.env.example`](./.env.example) for the full list. Minimum to run locally is `DATABASE_URL` and `AUTH_SECRET`. OAuth and email are optional in development.

## Project structure

```
prisma/
  schema.prisma        # complete data model (16+ tables)
  seed.ts              # demo data
src/
  app/                 # Next.js App Router pages
    layout.tsx
    page.tsx           # landing page
    globals.css        # Tailwind v4 + shadcn theme tokens
  components/
    providers.tsx      # ThemeProvider + React Query
    theme-toggle.tsx
  lib/
    prisma.ts          # Prisma client singleton
    utils.ts           # cn() helper
docker-compose.yml     # local Postgres
```

## Deployment (Vercel)

1. Push to GitHub and import the repo into Vercel.
2. Provision a Postgres database (Vercel Postgres / Neon / Supabase) and set `DATABASE_URL`.
3. Set `AUTH_SECRET`, `AUTH_URL`, OAuth, and storage env vars in the Vercel project.
4. Build command `npm run build` runs `prisma generate` automatically; run `prisma migrate deploy` as a deploy step (or `db push` for the first deploy).
