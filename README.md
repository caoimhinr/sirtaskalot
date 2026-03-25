# SirTaskalot

A monorepo for a calendar-first task tracking platform with OAuth-ready auth, Redis caching, OpenTelemetry tracing, a read-only MCP interface, Flyway migrations, and Dockerized local infrastructure.

## Features

- Mobile-first calendar UI with quick completion actions and follow-up completion fields
- Dark/light visual treatment inspired by Home Assistant cards
- Tailwind CSS styling pipeline
- OAuth-ready authentication via NextAuth (Google and GitHub providers wired)
- PostgreSQL Prisma schema for users, tasks, accounts, and task completions
- Flyway SQL migrations for database bootstrap
- Redis-backed task caching with in-memory fallback
- OpenTelemetry export to Jaeger OTLP endpoint
- Separate read-only MCP server surface for task listing
- Tests covering UI, service, API, and MCP layers

## Workspace layout

- `apps/web` – Next.js application
- `apps/mcp` – read-only MCP handlers
- `packages/shared` – shared schemas and demo data
- `packages/db` – Prisma schema/client
- `packages/telemetry` – tracing bootstrap and action tracking
- `flyway/sql` – SQL migrations

## Run locally

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm test
npm run build
```

## Docker

```bash
docker compose up --build
```

This starts:

- app Postgres
- telemetry Postgres
- Redis
- Jaeger dashboard
- Flyway migration runner
- Next.js web app

## Notes

This implementation uses demo task data in the app/service layer to keep the project runnable without a seeded database, while still providing the Postgres schema and migration/integration points required for production wiring.
