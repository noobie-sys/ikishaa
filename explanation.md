# Ikisha Codebase Explanation

This project is a portfolio platform.

Think of it like this:

A user adds text and images. The app saves that content as clean JSON. Then a template takes that JSON and turns it into a beautiful public portfolio page.

The important rule is:

```text
Content decides WHAT to show.
Templates decide HOW it looks.
Animations decide HOW it moves.
```

Users are not allowed to change colors, fonts, spacing, or layouts. That keeps every portfolio looking polished and consistent.

---

# Big Picture

The full flow is:

```text
User uploads content
  -> Backend validates it
  -> Backend stores it in PostgreSQL
  -> Frontend fetches it
  -> Template renders it
  -> Public page appears
```

The app has two main parts:

```text
backend/   Go API server
frontend/  Next.js website
```

There is also:

```text
docker-compose.yml
```

That file helps run the whole project locally with Docker.

---

# Backend Explanation

The backend is written in Go.

It uses:

- Fiber for the HTTP API
- PostgreSQL for the database
- GORM for database access
- JWT for login tokens
- Google OAuth for Google login
- Cloudinary for image uploads

The backend lives here:

```text
backend/
```

---

# Backend Folder Structure

## `backend/cmd/api/main.go`

This is the starting point of the backend.

When you run:

```bash
go run ./cmd/api
```

Go starts from this file.

This file does the setup work:

- loads environment variables
- connects to the database
- creates repositories
- creates services
- creates HTTP handlers
- registers routes
- starts the Fiber server

You can think of `main.go` like the manager who connects all workers together.

---

## `backend/pkg/config`

This reads values from `.env`.

Example:

```env
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
CLOUDINARY_URL=...
```

The backend needs these values to know:

- where the database is
- what port to run on
- how to sign JWT tokens
- how to connect to Cloudinary
- how Google login should work

If something important is missing, the app stops early instead of failing later.

---

## `backend/internal/domain`

This is where the most important business rules live.

Business rules means:

```text
What is allowed?
What is not allowed?
What must always be true?
```

There are three main domains:

```text
page/
user/
media/
```

---

# Page Domain

The page domain is the most important part.

It lives here:

```text
backend/internal/domain/page
```

## `entity.go`

This contains the `Page` entity.

A page has:

- id
- user id
- slug
- template
- content JSON
- published state
- created time
- updated time

The `Page` is the aggregate root.

That means the page is in charge of its own important rules.

For example:

```go
func (p *Page) UpdateContent(content json.RawMessage) error
```

This method does not blindly replace content.

It first checks:

- is the page already published?
- is the content valid?
- does the JSON follow the required schema?

This is better than putting all rules inside HTTP handlers, because the rules stay close to the thing they protect.

---

## Page Content JSON

The allowed content shape is:

```json
{
  "version": 1,
  "sections": []
}
```

Sections can only be:

- text
- gallery
- carousel

Example:

```json
{
  "type": "text",
  "content": "Hello, I am a designer."
}
```

Example gallery:

```json
{
  "type": "gallery",
  "layout": "grid",
  "images": [
    {
      "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      "alt": "Project image"
    }
  ]
}
```

Notice what is missing:

- no color
- no font
- no spacing
- no animation
- no custom CSS

That is intentional.

The content only says what the user wants to show. The template decides how it looks.

---

## `repository.go`

This file defines what the page database layer must be able to do.

It says:

```go
type Repository interface
```

The repository can:

- create a page
- update a page
- find a page by id
- find a page by slug
- find all pages for a user

This is like a contract.

The domain does not care if the database is PostgreSQL, MySQL, or something else. It only cares that something satisfies this contract.

---

## `service.go`

This contains page use cases.

For example:

- create page
- update page content
- publish page

The service coordinates the work.

It loads the page, checks ownership, calls the page entity methods, then saves the page.

---

# User Domain

The user domain lives here:

```text
backend/internal/domain/user
```

It handles:

- creating users
- login with email/password
- finding or creating Google users

When someone logs in with Google for the first time, the backend creates their account automatically.

---

# Media Domain

The media domain lives here:

```text
backend/internal/domain/media
```

It handles image uploads.

It checks:

- file size
- file type
- upload location

Then it sends the file to Cloudinary.

Cloudinary gives back a public image URL.

That URL can then be stored inside the page content JSON.

---

# Application Layer

This lives here:

```text
backend/internal/application
```

It has:

```text
commands/
queries/
```

This is lightweight CQRS.

CQRS means:

```text
Commands change data.
Queries read data.
```

We do not use complicated event buses or projections.

It stays simple.

---

## Commands

Commands are actions that change something.

This project has:

- `CreatePage`
- `UpdatePageContent`
- `PublishPage`

Example:

```text
CreatePage means:
Please create a new page for this user.
```

---

## Queries

Queries only read data.

This project has:

- `GetPageBySlug`
- `GetUserPages`

Example:

```text
GetPageBySlug means:
Find the public page with this slug.
```

---

# Infrastructure Layer

This lives here:

```text
backend/internal/infrastructure
```

Infrastructure means tools outside the core business logic.

Examples:

- database
- Cloudinary
- JWT
- Google OAuth

---

## Database

Database files live here:

```text
backend/internal/infrastructure/database
```

This project uses GORM.

GORM talks to PostgreSQL.

The app is designed for Neon PostgreSQL, but it also works with local PostgreSQL.

The database stores:

- users
- pages
- media

The page content is stored as JSONB.

JSONB is PostgreSQL's efficient JSON storage type.

---

## Auth

Auth files live here:

```text
backend/internal/infrastructure/auth
```

Auth means login and identity.

The app supports:

- Google login
- email/password signup
- email/password login
- JWT access tokens
- refresh tokens in secure cookies

JWT is like a signed ticket.

When the user logs in, the backend gives them an access token.

The frontend sends that token when calling protected APIs.

---

## Cloudinary

Cloudinary files live here:

```text
backend/internal/infrastructure/cloudinary
```

Cloudinary stores uploaded images.

The backend does not store image files directly in PostgreSQL.

Instead:

```text
Image file -> Cloudinary -> URL -> PostgreSQL JSON content
```

---

# HTTP Layer

This lives here:

```text
backend/internal/interfaces/http
```

This layer talks to the outside world.

It contains:

- handlers
- middleware
- routes

---

## Handlers

Handlers receive HTTP requests.

For example:

```text
POST /api/pages
```

The handler:

1. reads the request body
2. gets the logged-in user
3. calls a command or query
4. returns JSON

Handlers should not contain deep business rules.

They mostly translate HTTP into application actions.

---

## Middleware

Middleware runs before handlers.

The auth middleware checks:

- is there an Authorization header?
- is the JWT valid?
- which user is logged in?

If the token is missing or invalid, the request is rejected.

---

## Routes

Routes connect URLs to handlers.

Example:

```text
POST /api/pages
```

goes to:

```text
PageHandler.Create
```

Public routes:

```text
GET /api/pages/:slug
```

Protected routes:

```text
POST /api/pages
PATCH /api/pages/:id
POST /api/pages/:id/publish
POST /api/media/upload
```

Protected means the user must be logged in.

---

# Database Migrations

Migrations live here:

```text
backend/migrations
```

Migrations create database tables.

The main tables are:

- users
- pages
- media

The pages table has:

- id
- user_id
- slug
- template
- content
- is_published
- created_at
- updated_at

The `content` column is JSONB.

That is where the portfolio content JSON is stored.

---

# Frontend Explanation

The frontend is written with Next.js.

It lives here:

```text
frontend/
```

It uses:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- GSAP
- Embla Carousel

The frontend renders public portfolio pages from structured JSON.

---

# Frontend Folder Structure

## `frontend/src/app`

This is where pages live.

Important files:

```text
src/app/page.tsx
src/app/[slug]/page.tsx
src/app/layout.tsx
src/app/globals.css
```

---

## `src/app/page.tsx`

This is the homepage.

It shows what Ikisha is:

- a template-driven portfolio platform
- not a drag-and-drop builder
- not a random style editor

It also links to sign in with Google.

---

## `src/app/[slug]/page.tsx`

This renders a public portfolio page.

Example URL:

```text
http://localhost:3000/jane-designer
```

The `[slug]` part is dynamic.

If the slug is `jane-designer`, the frontend asks the backend:

```text
GET /api/pages/jane-designer
```

The backend returns the page JSON.

Then the frontend passes it into the page renderer.

---

## ISR

The public page uses ISR.

ISR means Incremental Static Regeneration.

Simple explanation:

```text
Next.js can cache the page like a static page,
but refresh it every few minutes.
```

That makes public pages fast.

---

# Shared Frontend Types

Types live here:

```text
frontend/src/types/page.ts
```

This file defines the frontend version of `PageContent`.

The frontend expects content like:

```ts
type PageContent = {
  version: 1;
  sections: Section[];
};
```

This matches the backend validator.

That is important because both frontend and backend should agree on the shape of content.

---

# Frontend Validation

Validation lives here:

```text
frontend/src/types/validation.ts
```

This checks that content from the backend is valid before rendering it.

That protects the renderer from bad data.

---

# Page Renderer

Renderer files live here:

```text
frontend/src/modules/page-renderer
```

There are two main files:

```text
PageRenderer.tsx
TemplateRenderer.tsx
```

## PageRenderer

This receives a full page object.

Then it passes the template and content to the template renderer.

## TemplateRenderer

This chooses the correct template.

Example:

```text
template = "minimal-grid"
```

means:

```text
Use MinimalGridTemplate
```

This makes it easy to add more templates later.

---

# Template System

Templates live here:

```text
frontend/src/templates
```

Right now there is one template:

```text
minimal-grid
```

The template controls:

- page layout
- spacing
- typography
- colors
- theme

Sections do not control these things.

That is a very important rule.

---

# Minimal Grid Template

Files:

```text
frontend/src/templates/minimal-grid/index.tsx
frontend/src/templates/minimal-grid/config.ts
```

## `config.ts`

This stores design choices:

- background color
- text color
- layout classes
- typography classes

## `index.tsx`

This renders the page using those design choices.

It loops through the content sections.

If the section is text, it renders `TextBlock`.

If the section is gallery, it renders `Gallery`.

If the section is carousel, it renders `Carousel`.

---

# Sections

Sections live here:

```text
frontend/src/sections
```

There are three section types:

```text
gallery/
text/
carousel/
```

Sections should only render the content they receive.

They should not decide the whole page design.

---

## Text Section

File:

```text
frontend/src/sections/text/TextBlock.tsx
```

This renders text content.

It does not choose page colors or layout.

The template passes the class names.

---

## Gallery Section

File:

```text
frontend/src/sections/gallery/Gallery.tsx
```

This renders multiple images.

It uses:

- Next.js Image for optimized images
- aspect ratio boxes to prevent layout shift
- centralized image hover animation

Layout shift means the page jumps around while images load.

We avoid that by giving images stable sizes.

---

## Carousel Section

File:

```text
frontend/src/sections/carousel/Carousel.tsx
```

This uses Embla Carousel.

It supports:

- smooth dragging
- touch screens
- responsive slides

The carousel is simple and minimal.

---

# Animation System

Animations live here:

```text
frontend/src/animations
```

There are two groups:

```text
core/
presets/
```

---

## Reveal Animation

File:

```text
frontend/src/animations/core/reveal.ts
```

This animation makes sections gently appear as they enter the screen.

It is used with Framer Motion.

---

## Image Hover Animation

File:

```text
frontend/src/animations/presets/imageHover.ts
```

This uses GSAP.

When the mouse enters an image:

```text
image scales up slightly
```

When the mouse leaves:

```text
image scales back down
```

The important part:

Animations are not inside the JSON.

JSON only contains content.

---

# Why This Separation Matters

Imagine a school uniform.

Students can choose what books they carry, but the school controls the uniform.

In this app:

```text
User content = books
Template design = uniform
Animation system = how people walk into the room
```

The user controls the content.

The platform controls the design.

That keeps every page looking professional.

---

# Authentication Flow

Login works like this:

```text
User clicks Google login
  -> Google asks user to approve
  -> Google sends user back to backend
  -> Backend creates or finds user
  -> Backend creates JWT tokens
  -> Frontend receives access token
```

The refresh token is stored in an HTTP-only cookie.

HTTP-only means JavaScript cannot read it.

That is safer.

---

# Media Upload Flow

Image upload works like this:

```text
User uploads image
  -> Backend checks file
  -> Backend uploads to Cloudinary
  -> Cloudinary returns image URL
  -> URL is saved in PageContent JSON
```

The database stores the image URL, not the image file itself.

---

# Publishing Flow

A page starts unpublished.

When the user publishes it:

```text
Backend validates content
  -> marks page as published
  -> public slug becomes available
```

Only published pages are visible publicly.

---

# Why This Is a Monolith

A monolith means the backend is one app.

This project is not split into microservices.

That is good here because:

- easier to build
- easier to debug
- easier to deploy
- fewer moving parts

The code is still organized into modules, so it can grow later.

---

# How to Add a New Template Later

To add a new template:

1. Create a folder:

```text
frontend/src/templates/new-template
```

2. Add:

```text
index.tsx
config.ts
```

3. Register it in:

```text
frontend/src/modules/page-renderer/TemplateRenderer.tsx
```

4. Allow the template in the backend page domain.

That means updating:

```text
backend/internal/domain/page/entity.go
```

5. Update the database migration or constraint if needed.

---

# How to Add a New Section Later

To add a new section:

1. Add it to backend validation.

File:

```text
backend/pkg/validator/content.go
```

2. Add it to frontend types.

File:

```text
frontend/src/types/page.ts
```

3. Add frontend validation.

File:

```text
frontend/src/types/validation.ts
```

4. Create a section component.

Example:

```text
frontend/src/sections/video/Video.tsx
```

5. Teach templates how to render it.

Important:

Do not add styling controls to the content JSON.

---

# Development Commands

Start backend:

```bash
cd backend
go run ./cmd/api
```

Start frontend:

```bash
cd frontend
npm run dev
```

Build frontend:

```bash
cd frontend
npm run build
```

Test backend:

```bash
cd backend
go test ./...
```

Start with Docker:

```bash
docker compose up --build
```

---

# Environment Files

Backend env file:

```text
backend/.env
```

Frontend env file:

```text
frontend/.env.local
```

Backend needs:

```env
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUDINARY_URL=
```

Frontend needs:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
INTERNAL_API_BASE_URL=http://localhost:8080
```

---

# Most Important Rules

Remember these rules:

```text
Do not put styling in JSON.
Do not put animations in JSON.
Do not let users customize layout.
Do not build drag-and-drop editing.
Do not turn this into microservices too early.
```

The clean separation is the main idea of the whole project.

---

# Simple Summary

The backend is responsible for:

- users
- login
- uploads
- validation
- saving pages
- publishing pages

The frontend is responsible for:

- fetching public pages
- choosing templates
- rendering sections
- running animations
- keeping pages fast

The database stores:

- users
- uploaded media metadata
- page content JSON

The template controls:

- layout
- colors
- fonts
- spacing

The content controls:

- text
- image URLs
- section order

That is the whole idea.

---

# Template Workflow And Local Development Guide

This section was added for the new template workflow request. The full step-by-step file is:

```text
step-by-step/template-workflow.md
```

New feature explanations should also get their own file in:

```text
step-by-step/
```

Do not delete old explanations. Add a divider and append the new explanation.

## How Templates Work

The backend stores:

```text
template = "minimal-grid"
content = JSON
```

The backend validates and stores the template id. The frontend renders the actual design.

The current frontend registry is:

```text
frontend/src/modules/page-renderer/TemplateRenderer.tsx
```

The current backend allowlist is:

```text
backend/internal/domain/page/entity.go
```

The current database check constraint is:

```text
backend/migrations/000001_init.up.sql
```

## Add A New Template

Use `editorial-split` as an example.

Create:

```text
frontend/src/templates/editorial-split/index.tsx
frontend/src/templates/editorial-split/config.ts
```

Update the frontend template type:

```text
frontend/src/types/page.ts
```

Example:

```ts
export type TemplateID = "minimal-grid" | "editorial-split";
```

Register it in:

```text
frontend/src/modules/page-renderer/TemplateRenderer.tsx
```

Example:

```ts
import { EditorialSplitTemplate } from "@/templates/editorial-split";

const templates: Record<TemplateID, ComponentType<{ content: PageContent }>> = {
  "minimal-grid": MinimalGridTemplate,
  "editorial-split": EditorialSplitTemplate
};
```

Add it to the local template browser:

```text
frontend/src/app/templates/page.tsx
```

Add local demo content:

```text
frontend/src/modules/demo/demoContent.ts
```

Register it in the backend:

```text
backend/internal/domain/page/entity.go
```

Example:

```go
const TemplateEditorialSplit = "editorial-split"

var allowedTemplates = map[string]struct{}{
	TemplateMinimalGrid:    {},
	TemplateEditorialSplit: {},
}
```

Update the database template constraint with a new migration:

```sql
alter table pages drop constraint pages_template_check;

alter table pages
  add constraint pages_template_check
  check (template in ('minimal-grid', 'editorial-split'));
```

## Test Locally First

Run backend hot reload:

```bash
cd backend
make dev
```

Run frontend:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000/templates
http://localhost:3000/demo
```

Build and test every template locally before uploading, publishing, or deploying.

## Remove A Template

Remove it from:

```text
frontend/src/modules/page-renderer/TemplateRenderer.tsx
frontend/src/types/page.ts
frontend/src/app/templates/page.tsx
backend/internal/domain/page/entity.go
database template check constraint
```

Before removing it from backend or database, confirm no existing page still uses that template id.
