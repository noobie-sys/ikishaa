# Ikisha Architecture

Ikisha is a curated portfolio publishing engine for photographers and videographers. It is not a website builder. Users edit only predefined content fields. Internal templates own layout, typography, motion, and rendering behavior.

The architecture optimizes for cinematic public pages, media-heavy portfolios, static-first delivery, and a codebase a small team can ship quickly without locking itself into a weak foundation.

## Product Boundaries

```text
Allowed user control
  images, videos, copy, social links, metadata, galleries, hero fields, inquiry links

Not allowed
  arbitrary JSX, CSS, layout trees, plugins, drag and drop layout editing, third-party templates

Stored in database
  user identity, site instances, schema-constrained content, media records, publish state, analytics events

Stored in application code
  template schemas, renderers, defaults, editor field definitions, validation, template versions
```

This boundary is the main product moat. It keeps output quality high because design is curated and versioned by Ikisha, while still letting users move fast through content editing.

## System Diagram

```text
                   Cloudflare CDN
                        |
        +---------------+----------------+
        |                                |
username.ikisha.studio             app.ikisha.studio
 public portfolio                    dashboard
        |                                |
        v                                v
  Next.js App Router <------------> Go Fiber API
  ISR/SSR renderer                  monolith backend
        |                                |
        |                         +------+------+
        |                         |             |
        v                         v             v
  Cloudinary CDN              PostgreSQL      Redis
  images/transforms           Neon            queues/cache/rate limits
        |
        v
       Mux
 video HLS/playback
```

## Monolith Folder Structure

```text
ikisha/
  backend/
    cmd/api/                         Fiber entrypoint
    internal/application/            commands, queries, use-case orchestration
    internal/domain/                 business rules for page, user, media
    internal/infrastructure/         database, auth, Cloudinary, future Mux/Redis
    internal/interfaces/http/        handlers, routes, middleware
    migrations/                      PostgreSQL schema
    pkg/                             config, logging, response helpers, validation
    .air.toml                        backend hot reload
  frontend/
    src/app/                         Next.js App Router
    src/modules/page-renderer/       template renderer dispatcher
    src/templates/                   internal template registry implementations
    src/sections/                    controlled visual primitives
    src/types/                       content contracts shared by renderer
  docs/
    architecture.md
    example-page-content.json
  docker-compose.yml
```

The monolith is intentional. The first bottlenecks will be media delivery, publish fanout, analytics volume, and cache invalidation, not service boundaries. Keep operational complexity low until one boundary has measurable pressure.

## Backend Architecture

The Go backend is layered but not over-abstracted:

```text
HTTP handler
  parses request, handles status codes, auth context

Application command/query
  coordinates use cases such as create page, update content, publish

Domain service/entity
  enforces product rules: supported templates, valid content, publish constraints

Repository/infrastructure
  persists data in PostgreSQL and calls external services
```

Key decisions:

- Fiber is used for a small, fast HTTP API with simple middleware.
- PostgreSQL/Neon stores durable business data and JSONB content.
- Redis is optional now, but reserved for queues, rate limiting, publish jobs, and analytics buffering.
- Google OAuth is the only authentication provider. There are no password routes.
- Access and refresh tokens are stored as HTTP-only cookies. Tokens are not placed in URLs or local storage.

## Frontend Architecture

Next.js App Router owns the dashboard, previews, and public portfolio rendering.

```text
src/app/[slug]/page.tsx
  fetches published site content
  validates the content contract
  renders the selected internal template
  uses ISR with edge/CDN caching

src/modules/page-renderer/
  maps template id -> internal renderer

src/templates/<template-id>/
  config.ts       schema-facing configuration and defaults
  index.tsx       controlled renderer
  future files    editor fields, validation adapters, version migrations
```

Public pages should be mostly server-rendered HTML with minimal client components. Motion should be used only where it improves perceived quality. Media interactions can hydrate, but text, layout, image markup, metadata, and navigation should render on the server.

## Template Registry

Templates are versioned application code. A production template definition should look like:

```ts
export type TemplateDefinition<TData> = {
  id: string;
  name: string;
  version: number;
  schema: ZodSchema<TData>;
  defaults: TData;
  editorFields: EditorField[];
  renderer: React.ComponentType<{ data: TData }>;
  migrate?: Record<number, (oldData: unknown) => TData>;
};
```

The registry is a closed map:

```ts
const templates = {
  "minimal-grid@1": minimalGridTemplate,
  "cinematic-filmmaker@1": cinematicFilmmakerTemplate,
  "editorial-grid@1": editorialGridTemplate
};
```

Why this matters:

- No arbitrary runtime code can execute.
- Template review happens through normal PRs.
- Data migrations are explicit.
- The dashboard can auto-generate forms from `editorFields`.
- Public rendering remains static-first because template code is known at build/runtime.

## Content Storage Model

Database stores content, not design:

```sql
users (
  id uuid primary key,
  email text not null unique,
  name text not null,
  avatar_url text not null,
  google_id text not null unique,
  created_at timestamptz not null,
  updated_at timestamptz not null
)

site_instances/pages (
  id uuid primary key,
  user_id uuid not null references users(id),
  slug text not null unique,
  template text not null,
  template_version int not null default 1,
  content jsonb not null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null
)

media (
  id uuid primary key,
  user_id uuid not null references users(id),
  provider text not null,           -- cloudinary | mux
  provider_asset_id text not null,
  url text not null,
  width int,
  height int,
  duration_seconds numeric,
  format text,
  status text not null,             -- uploading | processing | ready | failed
  created_at timestamptz not null
)
```

Current code uses `pages`; as custom domains and multiple portfolios mature, rename or introduce `site_instances` without changing the public rendering model.

## Database Design

Initial production tables:

- `users`: Google OAuth users only.
- `pages`: one portfolio/site instance per slug initially.
- `media`: Cloudinary image assets and future Mux video assets.
- `publish_jobs`: records queued publish/revalidation work.
- `analytics_events`: append-only raw events or buffered inserts.
- `daily_site_metrics`: aggregated views, uniques, device, geography, CTA events.

Indexes that matter first:

```sql
create index pages_user_id_updated_at_idx on pages(user_id, updated_at desc);
create index pages_published_slug_idx on pages(slug) where is_published = true;
create index pages_content_gin_idx on pages using gin(content);
create index media_user_id_created_at_idx on media(user_id, created_at desc);
create index analytics_events_site_created_idx on analytics_events(site_id, created_at desc);
```

Avoid querying deeply into JSONB for public rendering hot paths. Fetch by slug/id, validate contract, render. JSONB search is useful for internal tools, not request-critical public page rendering.

## API Structure

```text
GET    /healthz

GET    /api/auth/google
GET    /api/auth/google/callback
POST   /api/auth/refresh
POST   /api/auth/logout

GET    /api/pages/:slug                 public published page fetch
GET    /api/pages                       authenticated user pages
POST   /api/pages                       create from template defaults
PATCH  /api/pages/:id                   update schema-constrained content
POST   /api/pages/:id/publish           publish and trigger revalidation

POST   /api/media/upload                Cloudinary image upload
POST   /api/videos/mux/direct-upload    future Mux direct upload URL
POST   /api/webhooks/mux                future Mux status webhook

POST   /api/analytics/events            low-priority event ingest
GET    /api/analytics/sites/:id         dashboard metrics
```

Use idempotency keys for media uploads and publish jobs once retries are introduced.

## Rendering Strategy

Public portfolio pages are static-first:

```text
publish page
  -> validate content against template schema
  -> persist published snapshot
  -> trigger Next.js revalidation for /:slug
  -> Cloudflare purges or expires stale edge cache
  -> public visitors receive cached HTML and optimized media
```

Use:

- ISR for public portfolio pages.
- SSR only for preview/authenticated dashboard routes.
- Server components for public page layout and content.
- Client components only for carousels, subtle motion, and video player controls.

Do not make public rendering depend on a runtime page-builder tree. That would increase hydration, reduce cacheability, and weaken template quality control.

## Publishing Pipeline

```text
User clicks Publish
  |
  v
Backend loads draft page
  |
  v
Validate content with template schema/version
  |
  v
Write published state + published_at
  |
  v
Enqueue publish job
  |
  v
Trigger Next ISR revalidate for slug
  |
  v
Cloudflare serves fresh static HTML
```

Initially the publish job can run inline after the database transaction. Move it to Redis-backed jobs when publish retries, webhooks, and cache purges need reliability.

## Editor System

The dashboard editor is schema-driven:

```text
template.editorFields
  -> generated forms
  -> field-level validation
  -> autosave draft content
  -> preview renderer uses same template registry
```

Editor field examples:

```ts
{ path: "hero.title", type: "text", label: "Hero title", maxLength: 80 }
{ path: "hero.image", type: "image", accept: ["image/jpeg", "image/png", "image/webp"] }
{ path: "films", type: "videoList", provider: "mux", maxItems: 12 }
```

Autosave should debounce writes, send only content updates, and never let the client send layout or component definitions.

## Cloudinary Image Pipeline

Upload flow:

```text
Dashboard selects image
  -> backend validates auth, size, MIME type
  -> backend uploads to Cloudinary folder scoped by user/site
  -> Cloudinary stores original
  -> backend stores public_id, dimensions, format
  -> template renders transformed delivery URL
```

Delivery rules:

- Use Cloudinary `f_auto,q_auto` for AVIF/WebP and compression.
- Use responsive widths based on template slots.
- Use DPR-aware transforms.
- Use blur placeholders or dominant color placeholders for perceived speed.
- Use `priority` only for above-the-fold hero/first images.
- Lazy-load the rest.

The database should store Cloudinary `public_id` and metadata. Renderers should generate delivery URLs instead of trusting arbitrary user-provided image URLs long-term.

## Mux Video Pipeline

Do not self-host transcoding.

```text
Dashboard requests direct upload
  -> backend creates Mux direct upload
  -> browser uploads to Mux
  -> Mux transcodes adaptive bitrate renditions
  -> Mux webhook updates media status/playback_id
  -> template renders HLS player and thumbnails
```

Public pages should load thumbnails first, defer player hydration, and start HLS only when the video is near viewport or intentionally played. Use muted short hero loops carefully and provide a static fallback poster on mobile.

## CDN And Caching

Cloudflare fronts public pages and static assets.

Suggested cache policy:

```text
HTML public pages:      cache at edge, short stale-while-revalidate
Next static assets:     immutable, one year
Cloudinary images:      immutable transformed URLs
Mux HLS/thumbnails:     provider CDN
API authenticated:      no-store
Preview routes:         no-store
Analytics ingest:       no-store
```

Use cache tags later:

```text
site:<site_id>
slug:<slug>
template:<template_id>:<version>
```

This enables precise purge on publish or template migration.

## Subdomain Routing

Target production routing:

```text
aman.ikisha.studio -> Cloudflare wildcard DNS -> Next.js
```

Next.js middleware can map hostnames:

```text
app.ikisha.studio           dashboard app
www.ikisha.studio           marketing
<username>.ikisha.studio    public portfolio slug/tenant
```

Initial implementation can keep `/:slug` locally and evolve to host-based lookup when wildcard DNS and SSL are configured. Custom domains later add a `domains` table with verification status, DNS target, and ownership checks.

## Authentication

Google OAuth only:

- `/api/auth/google` creates a CSRF state cookie and redirects to Google.
- `/api/auth/google/callback` validates state and verified email.
- Backend creates or links a user by `google_id`/email.
- Backend sets HTTP-only `access_token` and `refresh_token` cookies.
- Dashboard API calls rely on cookies with CORS credentials.

Do not store tokens in local storage or query strings. In production set:

```text
COOKIE_SECURE=true
COOKIE_DOMAIN=.ikisha.studio
COOKIE_SAME_SITE=Lax
```

If the dashboard and API move to different top-level domains, revisit SameSite and CSRF protections.

## Media Upload Security

Validate before upload:

- authenticated user
- max bytes
- MIME type and extension
- image dimensions if available
- user/site ownership

Never accept public media URLs as permanent truth. Store provider IDs and generate safe delivery URLs. Keep upload folders scoped:

```text
ikisha/<env>/<user_id>/<site_id>/
```

## Analytics Architecture

Basic now, scalable later:

```text
Browser event
  -> lightweight /api/analytics/events
  -> Redis buffer or direct insert
  -> raw analytics_events
  -> periodic aggregation
  -> daily_site_metrics
  -> dashboard charts
```

Tracked events:

- page view
- unique visitor approximation
- video play/progress
- gallery interaction
- CTA click
- inquiry click
- device type
- country/region from edge headers

Keep analytics scripts tiny and non-blocking. Public page speed is more important than perfect analytics.

## Queue/Event Processing

Start with in-process jobs for:

- publish revalidation
- Cloudflare purge
- analytics aggregation

Move to Redis workers when retries or volume demand it:

```text
publish.requested
media.image.uploaded
media.video.ready
analytics.flush
template.migration.requested
```

This gives a migration path without introducing microservices early.

## Security Strategy

- Google OAuth only.
- HTTP-only cookies for tokens.
- Strong secret validation in production.
- CORS locked to the frontend origin.
- Rate-limit auth, media upload, publish, and analytics endpoints.
- Validate all JSON content against internal template schemas.
- Reject unknown template ids.
- Never execute user-provided code.
- Use Cloudinary/Mux provider IDs, not arbitrary executable media metadata.
- Add CSRF tokens for state-changing cookie-authenticated routes before production launch.
- Keep `.env` out of Git and document only placeholders in `.env.example`.

## Rate Limiting

Initial policy:

```text
auth routes:       strict per IP
media upload:      per user + per IP, lower concurrency
publish:           per site, debounce repeated publishes
analytics ingest:  generous but sampled under abuse
public pages:      handled mostly by CDN
```

Use Redis for distributed limits once multiple backend instances exist.

## Observability And Logging

Use structured logs with request IDs.

Log fields:

```text
request_id, user_id, site_id, slug, method, path, status, duration_ms, error_code
```

Metrics:

- API latency by route/status
- DB query latency and pool usage
- publish job duration/failures
- Cloudinary upload failures
- Mux webhook failures
- ISR revalidation failures
- cache hit ratio from Cloudflare
- public page Core Web Vitals

Tracing:

- HTTP request span
- DB span
- external provider span
- publish/revalidation span

Do not log tokens, OAuth codes, cookies, Cloudinary secrets, Mux secrets, or signed URLs.

## Performance Strategy

Public pages:

- server-render most markup
- minimize client JavaScript
- keep templates deterministic and static-first
- image dimensions/aspect ratios fixed to avoid layout shift
- preload only critical hero media
- lazy-load below-the-fold galleries
- defer video players
- avoid broad Framer Motion wrappers on huge galleries
- use CSS transitions when possible

Backend:

- keep public page API payload compact
- index slug lookups
- use DB connection pool limits for Neon
- add response caching or published snapshots if API fetch becomes hot

## Mobile Performance

Mobile is the primary experience:

- smaller image widths and DPR-aware transforms
- no autoplay 4K hero video on constrained devices
- poster-first video UI
- avoid expensive scroll-linked effects
- preserve 60fps by animating opacity/transform only
- test slow 4G and mid-range Android devices

## SEO Strategy

Each published portfolio should render:

- unique title and description from content metadata
- Open Graph image from hero/cover image
- canonical URL
- robots/indexing controls
- JSON-LD for person/creative work where appropriate
- sitemap entries for published portfolios

Preview and dashboard routes must be `noindex`.

## Template Versioning

Store both `template_id` and `template_version`. When a template changes:

```text
minor visual-only change
  -> keep same schema version, no content migration

schema change
  -> add new version and migration
  -> keep old renderer until all content migrates

breaking design/product change
  -> create new template id or major version
```

Never silently reinterpret old content in a way that changes meaning.

## Error Handling

Use stable error responses:

```json
{
  "error": {
    "code": "invalid_content",
    "message": "Hero image is required"
  }
}
```

Current helper can evolve from simple `{ "error": "..." }` to coded errors. Avoid leaking provider internals to users; log internal details with request IDs.

## Deployment Architecture

Initial production:

```text
Frontend: Next.js on Vercel or container platform
Backend: Go container on Fly.io/Render/Railway/ECS
Database: Neon PostgreSQL
Redis: Upstash/managed Redis when needed
CDN/DNS: Cloudflare
Images: Cloudinary
Videos: Mux
```

Docker Compose remains the local integration environment. Kubernetes is unnecessary until operational needs justify it.

## Docker Architecture

Local:

- Postgres
- Redis
- backend with Air hot reload
- frontend container for production-like build, or `npm run dev` locally for frontend iteration

Backend hot reload:

```bash
docker compose up --build backend
```

Air watches `cmd`, `internal`, and `pkg`, rebuilds `./tmp/api`, and restarts Fiber.

## CI/CD

Minimum CI:

```text
backend: go test ./...
frontend: npm ci, npm run build
docker: docker compose config
migrations: migration lint/check in a disposable PostgreSQL
```

Deployment should require:

- all tests pass
- no TypeScript errors
- image builds
- production env validation passes
- migrations applied before app rollout

## Scalability Roadmap

Phase 1: monolith

- current Go API + Next.js
- synchronous publish revalidation
- direct Cloudinary upload via backend
- basic analytics table

Phase 2: reliable jobs

- Redis queues
- publish retries
- Mux webhooks
- analytics aggregation
- rate limits

Phase 3: public rendering hardening

- published snapshots
- host-based subdomain routing
- cache tags and purge automation
- custom domains

Phase 4: split only proven bottlenecks

- analytics ingestion worker/service if event volume dominates
- media processing worker if webhook/upload orchestration grows
- publishing worker if cache invalidation becomes complex

Do not split templates into external plugins. Internal template code remains part of the application.
