# AI Change Log

This file explains the files I created and changed for the development demo and template preview work.

## What Changed

I added a local development demo experience so you can preview the frontend without needing a page from the database first.

You can now open:

```text
http://localhost:3000/demo
```

That route renders a complete portfolio page using valid sample `PageContent` JSON.

I also added a template library page:

```text
http://localhost:3000/templates
```

That page shows all available templates. Right now the project has one template:

```text
minimal-grid
```

The template preview uses the same renderer and sample content as the demo page.

## New Files Created

### `frontend/src/modules/demo/demoContent.ts`

This file contains reusable demo data.

It exports:

```text
demoPageContent
demoPublicPage
```

`demoPageContent` is valid `PageContent` JSON.

It includes:

- text section
- gallery section
- carousel section

This lets the frontend show a portfolio without needing a database record.

### `frontend/src/app/demo/page.tsx`

This is the new development demo page.

It renders:

```text
PageRenderer
```

using:

```text
demoPublicPage
```

That means the demo follows the same rendering path as real public pages.

It does not create a separate fake design system.

### `frontend/src/app/templates/page.tsx`

This is the new template library page.

It shows the available templates and includes a visual preview for `Minimal Grid`.

This page is useful during development because you can quickly check what templates exist and how they look.

### `ai.md`

This file is the explanation file you asked for.

It records what changed and why.

## Existing Files Changed

### `frontend/src/app/page.tsx`

I updated the homepage navigation.

Before, it only linked to:

```text
/demo
```

Now it links to:

```text
/demo
/templates
```

I also added two clear homepage buttons:

```text
View local demo
Browse templates
```

## Why I Made These Changes

Before this change, the main public page route was:

```text
/:slug
```

That route depends on the backend and database.

For example:

```text
http://localhost:3000/demo
```

could try to fetch:

```text
GET /api/pages/demo
```

If the database does not have a published page with slug `demo`, the page would fail or show not found.

That is not ideal when you just want to see the frontend during development.

So I added a real frontend-only demo route:

```text
/demo
```

Because it is a dedicated route, it does not need the backend.

## Important Architecture Rule Still Preserved

The demo content still follows the same strict content schema.

It does not include:

- colors
- fonts
- spacing
- animation settings
- custom styles

The template still controls the design.

The content only controls what text and images appear.

## How to Check It

Start the frontend:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:3000
```

Then open:

```text
http://localhost:3000/demo
```

Then open:

```text
http://localhost:3000/templates
```

## Development vs Deployed URL

For development, use:

```text
http://localhost:3000
```

For deployment, use the URL from your hosting provider.

For example, if deployed on Vercel, the URL may look like:

```text
https://your-project.vercel.app
```

The deployed versions of the new pages would be:

```text
https://your-project.vercel.app/demo
https://your-project.vercel.app/templates
```

Replace `your-project.vercel.app` with your real deployed frontend URL.

---

## May 16, 2026 — Mono Collage template

Added a second portfolio template inspired by a monochrome editorial collage reference. Existing templates were not modified.

### New template: `mono-collage`

A high-contrast black-and-white collage layout with:

- Locked asymmetric 12-column grid and thin white gutters
- Fixed minimal logo (`MonoLogo` SVG + wordmark) — not user-editable
- Four template-owned accent images (grayscale via CSS)
- One prominent **main image** slot (user-replaceable)
- Two editable text fields: **label** (header) and **caption** (footer)

Content JSON shape (stored in `pages.content`):

```json
{
  "version": 1,
  "kind": "mono-collage",
  "mainImage": { "url": "https://..." },
  "label": "Collection No. 1",
  "caption": "A study in contrast..."
}
```

### Demo route

Pre-filled demo (no database required):

```text
http://localhost:3000/demo/mono-collage
```

### Editor behavior (`/templates`)

Select **Mono Collage** in the template library. Users can edit only:

- Main image (replace/upload)
- Label text
- Caption text

Layout, logo, accent images, colors, fonts, spacing, and breakpoints stay locked.

### New frontend files

- `frontend/src/types/monoCollage.ts`
- `frontend/src/templates/mono-collage/` (`config.ts`, `index.tsx`, `MonoLogo.tsx`, `CollageImage.tsx`)
- `frontend/src/modules/demo/monoCollageDemoContent.ts`
- `frontend/src/modules/templates-editor/components/MonoCollageEditorView.tsx`
- `frontend/src/app/demo/mono-collage/page.tsx`

### Updated frontend files (integration only)

- `frontend/src/types/page.ts` — `TemplateID` union, `PageContent` union
- `frontend/src/types/validation.ts` — template-aware validation
- `frontend/src/modules/page-renderer/TemplateRenderer.tsx` — dispatches `mono-collage`
- `frontend/src/modules/templates-editor/registry.ts` — registers new template
- `frontend/src/app/[slug]/page.tsx` — validates content per template
- `frontend/src/lib/pageContent.ts` — `isMonoCollageContent`, `pageDescription`
- `frontend/src/app/page.tsx` — link to mono collage demo

### Backend changes

- `backend/migrations/000002_add_mono_collage_template.up.sql` — allow `mono-collage` in `pages.template` check
- `backend/pkg/validator/mono_collage.go` — validates mono-collage content
- `backend/pkg/validator/content.go` — `ValidatePageContent(template, raw)` routes by template
- `backend/internal/domain/page/entity.go` — template constant + template-aware validation

Run migration:

```bash
# apply 000002 against your Postgres database
```

---

## May 16, 2026 — Flexible per-image and per-text editing

Refactored the template editor so **every image and every text field** can be changed individually on hover/click, for current and future templates.

### Unified editing pattern

| Piece | Role |
|-------|------|
| `TemplateImage` | View mode = `next/image`; edit mode = hover → Replace image |
| `TemplateText` | View mode = static text; edit mode = click to edit |
| `createTemplateEditor()` | Wraps any template component with `onContentChange` for `/templates` |
| `countEditableFields()` | Counts images + texts for the editor toolbar |

Templates accept optional `onContentChange` (and `onChromeChange` for minimal-grid). The same component renders public pages (no handlers) and the editor (handlers attached).

### Mono Collage — all 5 images editable

Content now stores **all collage images** in JSON (not fixed config URLs):

```json
{
  "images": {
    "topLeft": { "url": "https://..." },
    "tallRight": { "url": "https://..." },
    "main": { "url": "https://..." },
    "midRight": { "url": "https://..." },
    "bottomRight": { "url": "https://..." }
  },
  "label": "...",
  "caption": "..."
}
```

### Minimal Grid — every section image + text

Gallery images, carousel slides, hero text, body text blocks, and aside label are all individually editable via the same `TemplateImage` / `TemplateText` flow.

### Adding a future template

1. Define content JSON (images + optional text fields).
2. Build one template component; use `TemplateImage` / `TemplateText` with `onUrlChange` / `onChange` when `onContentChange` is set.
3. Register in `registry.ts` with `createTemplateEditor(YourTemplate)`.
4. Add backend validator + migration template id if needed.

### Removed (merged into template components)

- `MinimalGridEditorView.tsx`
- `MonoCollageEditorView.tsx`

---

## May 16, 2026 — Editorial Strip carousel template

Added a third template inspired by a horizontal editorial carousel reference (THEMANAGEGRAM-style).

### Template: `editorial-strip`

- **Smooth horizontal carousel** — Embla Carousel with autoplay plugin, loop, centered slides, and eased scroll duration (pauses on hover; disabled in editor and for `prefers-reduced-motion`)
- **Peek layout** — center slide full width, neighbors partially visible
- **Locked design** — cream background `#f2f0eb`, header layout, portrait 3:4 images, bold uppercase captions
- **Editable content** — header `(00)` / brand / `(2024)`, each slide image, `line1` (e.g. `INSPO—`), `line2` (e.g. `CHRONIQUES DE L'ÉTÉ [024]`)

### Demo route

```text
http://localhost:3000/demo/editorial-strip
```

### New files

- `frontend/src/templates/editorial-strip/` — `index.tsx`, `config.ts`, `EditorialCarousel.tsx`
- `frontend/src/types/editorialStrip.ts`
- `frontend/src/modules/demo/editorialStripDemoContent.ts`
- `frontend/src/app/demo/editorial-strip/page.tsx`
- `backend/migrations/000003_add_editorial_strip_template.up.sql`
- `backend/pkg/validator/editorial_strip.go`

### Dependency

- `embla-carousel-autoplay` (smooth timed advance between slides)

