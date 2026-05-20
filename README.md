# 3D Printing Backend

Comprehensive backend for managing a fleet of 3D printers, print jobs, parts, filament inventories, and related operations. This repository provides a TypeScript/Node.js Express API with a PostgreSQL database managed by Prisma.

## Table of Contents
- **Project Overview**: What this backend does and its responsibilities
- **Tech Stack**: Languages, frameworks, and tools used
- **Quickstart**: Install, configure, and run locally
- **Environment Variables**: Required configuration keys
- **Database**: Prisma schema, migrations, seeding
- **Project Structure**: File and folder roles
- **API Overview**: Main routes and responsibilities
- **Development**: Scripts, testing, and common tasks
- **Deployment**: Notes for production
- **Contributing & Troubleshooting**

## Project Overview

This service is the backend component for a 3D printing management system. It exposes REST endpoints to:
- Manage printers and their configuration
- Create and track print jobs and queueing
- Store and manage part files and previews
- Track filament profiles and inventory
- Log commands sent to printers and their responses
- Record maintenance and printer events

It integrates with MQTT (see `src/services/mqtt.listener.ts`) to communicate with Pi/edge devices, and serves static `uploads/` files for part assets.

## Tech Stack

- Node.js (TypeScript) with ECMAScript modules
- Express 5 for the HTTP API
- Prisma ORM with PostgreSQL (`prisma` + `@prisma/client`)
- Swagger/OpenAPI for API docs
- MQTT integration for device events
- Testing with Vitest and Supertest

Key files:
- [package.json](package.json) — scripts and dependencies
- [app.ts](app.ts) — Express app configuration and route mounting
- [server.ts](server.ts) — server bootstrap and middleware (CORS, static uploads, Swagger)
- [prisma/schema.prisma](prisma/schema.prisma) — full DB schema and enums

## Quickstart (Local)

Prerequisites:
- Node.js (recommended latest LTS)
- PostgreSQL database
- `npx` (installed with Node)

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root (see Environment Variables below).

3. Run database migrations and start the server (development):

```bash
# Run migrations and start once
npm run start

# Start with watcher for development
npm run dev
```

4. API docs will be available at `/api-docs` when the server is running.

## Environment Variables

Create a `.env` file with at least the following keys:

- `DATABASE_URL` — Postgres connection string used by Prisma
- `PORT` — HTTP port (default 3000)
- `MQTT_BROKER_URL` — MQTT broker URL used by the MQTT listener

Example `.env` contents:

```
DATABASE_URL=postgresql://user:password@localhost:5432/3d_printing_db
PORT=3000
MQTT_BROKER_URL=mqtt://broker.example:1883
```

## Database (Prisma)

- The Prisma schema is in [prisma/schema.prisma](prisma/schema.prisma). It defines models for `Printer`, `PrintJob`, `Part`, `FilamentProfile`, `Inventory`, `CommandLog`, `GcodeCommand`, `PrinterEvent`, and related enums.
- Use Prisma Migrate to create and apply migrations. This project triggers migrations via the `start` script which runs `npx prisma migrate deploy`.
- To create migrations locally (development) run:

```bash
npx prisma migrate dev --name init
```

- To generate/update the Prisma client (after schema changes):

```bash
npx prisma generate
```

- Seeding: The project has a seed script configured in `package.json` under the `prisma.seed` key that calls `prisma/seed.js`.

## Project Structure

Top-level files:
- `app.ts` — Creates and configures the Express app, mounts routes.
- `server.ts` — Starts the HTTP server, configures Swagger and static assets.
- `package.json` — scripts and dependencies.
- `prisma/` — Prisma schema, migrations and seed scripts.

Source tree (important folders):
- `src/routes/` — Express routers that map URL paths to controllers (e.g., `printer.routes.ts`, `printJob.routes.ts`, `gCodeCmd.routes.ts`).
- `src/controllers/` — Controllers implement request handling and return responses.
- `src/services/` — Business logic, helpers and integrations (e.g., `mqtt.listener` starts MQTT subscriptions on server boot).
- `src/repositories/` — Data-access layer wrapping Prisma queries (common DB access patterns in `base.repository.ts`).
- `src/utils/`, `src/validations/`, `src/types/` — Utility helpers, validation schemas, and TypeScript typings.
- `uploads/` — Static folder served by the app for uploaded files (images/parts).

Refer to these files directly while developing features or debugging behavior.

## API Overview

The API follows RESTful principles and is grouped by resource. Main mounted routes (see `app.ts`):

- `GET/POST/PUT/DELETE /api/printers` — manage printers
- `GET/POST/PUT/DELETE /api/print-jobs` — create and track print jobs and queue
- `GET/POST/PUT/DELETE /api/parts` — part assets and metadata
- `GET/POST /api/gcode-commands` — predefined G-code commands
- `GET/POST /api/command-logs` — logs of commands sent to printers
- `GET/POST /api/filament-profiles` — filament profiles and relationships
- `GET/POST /api/inventory` — stock actions
- `POST /api/printer-events` — incoming events from printers (also tracked via MQTT)

For exact route definitions, open the router files in `src/routes/` (for example: [src/routes/gCodeCmd.routes.ts](src/routes/gCodeCmd.routes.ts)).

API documentation is automatically generated and served at `/api-docs` using Swagger. The Swagger setup is in `swagger.ts`.

## Development & Testing

Useful npm scripts (from `package.json`):
- `npm run dev` — start server with `tsx` in watch mode for fast TypeScript development
- `npm run start` — run migrations and start server (production-ready startup)
- `npm test` or `npm run test:run` — run tests with Vitest

Testing guidance:
- Unit and integration tests live in the `tests/` folder (example: `tests/printer.test.ts`).
- Use Supertest for HTTP endpoint testing.

## MQTT Integration

The code imports `src/services/mqtt.listener` from `server.ts` so the MQTT client connects when the server starts. The MQTT listener publishes/subscribes to topics for printer telemetry and job lifecycle events. Configure `MQTT_BROKER_URL` to point to your broker.

## Deploying to Production

- Ensure `DATABASE_URL` points to a managed Postgres instance and run migrations: `npx prisma migrate deploy`.
- Use a process manager (systemd, PM2, container orchestration) to run `npm run start`.
- For containers: build an image that installs dependencies and runs `npm run start`. Ensure environment variables are injected securely.

## Troubleshooting

- Server not starting: check `PORT`, `DATABASE_URL` and Prisma migrations. Look for errors in console output when `npx prisma migrate deploy` runs.
- Database connection issues: confirm Postgres is reachable and credentials in `DATABASE_URL` are correct.
- MQTT problems: verify `MQTT_BROKER_URL` and network reachability; check logs from `src/services/mqtt.listener`.

## Contributing

1. Create an issue describing the bug or feature.
2. Create a branch `feat/your-feature` or `fix/your-bug`.
3. Add/modify tests in `tests/` and ensure `npm test` passes.
4. Open a PR with a clear description of the change and migration notes if needed.

## Files To Look At First

- [app.ts](app.ts) — app wiring and route mounting
- [server.ts](server.ts) — static assets, Swagger and MQTT bootstrap
- [prisma/schema.prisma](prisma/schema.prisma) — canonical data model
- [package.json](package.json) — scripts and commands you will run

---

If you'd like, I can:
- Open a more detailed endpoint-by-endpoint reference using the router files.
- Add examples for common cURL requests and Postman collections.
- Create a `README` section for deployment with Docker and GitHub Actions.

README created and placed in the repository root.