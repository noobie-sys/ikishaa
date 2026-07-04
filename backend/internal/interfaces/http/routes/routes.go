package routes

import (
	"log/slog"

	"github.com/gofiber/fiber/v2"
	"github.com/ikisha/portfolio/backend/internal/interfaces/http/handlers"
)

type Dependencies struct {
	Auth       *handlers.AuthHandler
	Pages      *handlers.PageHandler
	Media      *handlers.MediaHandler
	AuthMw     fiber.Handler
	PublicLogr *slog.Logger
}

func Register(app *fiber.App, deps Dependencies) {
	app.Get("/healthz", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"ok": true})
	})

	api := app.Group("/api")
	api.Get("/auth/google", deps.Auth.GoogleLogin)
	api.Get("/auth/google/callback", deps.Auth.GoogleCallback)
	api.Post("/auth/refresh", deps.Auth.Refresh)
	api.Post("/auth/logout", deps.Auth.Logout)

	// Callbacks Url for google...
	app.Get("/auth/google", deps.Auth.GoogleLogin)
	app.Get("/auth/google/callback", deps.Auth.GoogleCallback)

	api.Get("/pages/:slug", deps.Pages.GetBySlug)

	protected := api.Group("", deps.AuthMw)
	protected.Post("/pages", deps.Pages.Create)
	protected.Get("/pages", deps.Pages.ListMine)
	protected.Get("/me/pages", deps.Pages.ListMine)
	protected.Patch("/pages/:id", deps.Pages.UpdateContent)
	protected.Post("/pages/:id/publish", deps.Pages.Publish)
	protected.Post("/media/upload", deps.Media.Upload)
}
