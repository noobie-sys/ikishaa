# Template Workflow

This project should build and test every template locally before publishing or uploading anything.

## Current Template Flow

```text
Backend stores:
page.template = "minimal-grid"
page.content = JSON

Frontend receives:
template id + content JSON

Frontend chooses:
template id -> React template component
```

The backend does not render templates. It only validates that a template id is allowed and stores that id with the page.

The frontend owns the real template UI.

## Files Involved

Backend:

```text
backend/internal/domain/page/entity.go
backend/migrations/000001_init.up.sql
```

Frontend:

```text
frontend/src/types/page.ts
frontend/src/modules/page-renderer/TemplateRenderer.tsx
frontend/src/templates/
frontend/src/app/templates/page.tsx
frontend/src/modules/demo/demoContent.ts
```

## Add A New Template

Use `editorial-split` as the example template id.

### 1. Create The Frontend Template Folder

Create:

```text
frontend/src/templates/editorial-split/
```

Add:

```text
frontend/src/templates/editorial-split/index.tsx
frontend/src/templates/editorial-split/config.ts
```

`config.ts` should hold theme, layout, and typography constants.

`index.tsx` should export the actual React template component.

### 2. Add The Template Type

Update:

```text
frontend/src/types/page.ts
```

Change:

```ts
export type TemplateID = "minimal-grid";
```

To:

```ts
export type TemplateID = "minimal-grid" | "editorial-split";
```

### 3. Register The Template In The Frontend Renderer

Update:

```text
frontend/src/modules/page-renderer/TemplateRenderer.tsx
```

Import the new template:

```ts
import { EditorialSplitTemplate } from "@/templates/editorial-split";
```

Add it to the registry:

```ts
const templates: Record<TemplateID, ComponentType<{ content: PageContent }>> = {
  "minimal-grid": MinimalGridTemplate,
  "editorial-split": EditorialSplitTemplate
};
```

### 4. Add It To The Template Library Page

Update:

```text
frontend/src/app/templates/page.tsx
```

Add a new object to the `templates` array:

```ts
{
  id: "editorial-split",
  name: "Editorial Split",
  status: "Local preview",
  description: "A split editorial layout for text-led portfolio stories."
}
```

This makes it visible in the local template browser.

### 5. Add Local Demo Content

Update:

```text
frontend/src/modules/demo/demoContent.ts
```

For quick testing, add another `PublicPage` object that uses:

```ts
template: "editorial-split"
```

The content JSON should stay the same shape:

```json
{
  "version": 1,
  "sections": []
}
```

Do not add colors, fonts, layout settings, or custom CSS to content JSON.

### 6. Register The Template In The Backend

Update:

```text
backend/internal/domain/page/entity.go
```

Add a new constant:

```go
const TemplateEditorialSplit = "editorial-split"
```

Add it to `allowedTemplates`:

```go
var allowedTemplates = map[string]struct{}{
	TemplateMinimalGrid:     {},
	TemplateEditorialSplit:  {},
}
```

This lets the API accept pages with `template: "editorial-split"`.

### 7. Update The Database Template Check

Current migration only allows:

```sql
constraint pages_template_check check (template in ('minimal-grid'))
```

For a new template, create a new migration that drops and recreates the check constraint.

Example:

```sql
alter table pages drop constraint pages_template_check;

alter table pages
  add constraint pages_template_check
  check (template in ('minimal-grid', 'editorial-split'));
```

Do not edit old migrations after they have already been applied to a shared database. For local-only development, editing the first migration is acceptable only if you reset the local database.

### 8. Test Locally First

Run frontend:

```bash
cd frontend
npm run dev
```

Run backend with hot reload:

```bash
cd backend
make dev
```

Open:

```text
http://localhost:3000/templates
http://localhost:3000/demo
```

Only after the template looks correct locally should you publish or upload anything.

## Remove A Template

Remove it from these places:

```text
frontend/src/modules/page-renderer/TemplateRenderer.tsx
frontend/src/types/page.ts
frontend/src/app/templates/page.tsx
backend/internal/domain/page/entity.go
database template check constraint
```

Before removing a template from the backend or database, make sure no existing pages still use that template id.

## Future Feature Notes

For every new feature request, add a file in this root folder:

```text
step-by-step/
```

Example:

```text
step-by-step/logout.md
step-by-step/backend-hot-reload.md
step-by-step/template-workflow.md
```

Each file should explain:

- what changed
- which files were touched
- how to run it locally
- how to test it
