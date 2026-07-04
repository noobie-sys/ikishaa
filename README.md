# Ikisha Portfolio Platform

Monolith-first premium portfolio publishing platform for photographers, videographers, designer, architecture and any one who loves to showcase thier picture and art but not have access to premium minimal website to showcase. Ikisha is a curated publishing engine: users edit content, while internal versioned templates own design, layout, media behavior, and motion.

## Layout

- `backend`: Go Fiber API, PostgreSQL/Neon, Google OAuth-only auth, JWT cookies, Cloudinary uploads, future Mux/Redis hooks.
- `frontend`: Next.js App Router renderer with template-driven public pages.
- `docker-compose.yml`: local Postgres, Redis, backend, and frontend wiring.
- `docs/architecture.md`: production architecture, rendering, media, caching, analytics, deployment, and scaling plan.

## Flow

User input -> schema-constrained content JSON -> PostgreSQL JSONB -> internal template registry -> static-first public portfolio page -> Cloudflare/Cloudinary/Mux optimized delivery.

## Quick Start

1. Copy environment files:
   - `backend/.env.example` -> `backend/.env`
   - `frontend/.env.example` -> `frontend/.env.local`
2. Start local infrastructure:
   ```bash
   docker compose up --build
   ```
3. Run migrations from `backend/migrations` against your Neon or local PostgreSQL database.

## Backend Hot Reload

For local Go development without running the backend inside Docker:

```bash
cd backend
make install-air
make dev
```

`make dev` uses `backend/.air.toml` and restarts the API when files under `cmd`, `internal`, or `pkg` change.

The Docker backend service also runs Air with the repository mounted into the container, so `docker compose up backend` rebuilds the API on Go file changes.

## Security Notes

- Do not commit real `.env` files.
- `.env.example` contains placeholders only.
- Production JWT secrets must be unique random values of at least 32 characters.
- Auth is Google OAuth only; tokens are issued in HTTP-only cookies, not query strings or local storage.

See `docs/example-page-content.json` for a valid content payload.
See `docs/architecture.md` for the full architecture document.
