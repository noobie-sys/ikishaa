package handlers

import (
	"encoding/json"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/ikisha/portfolio/backend/internal/application/commands"
	"github.com/ikisha/portfolio/backend/internal/application/queries"
	"github.com/ikisha/portfolio/backend/internal/interfaces/http/middleware"
	"github.com/ikisha/portfolio/backend/pkg/response"
)

type PageHandler struct {
	commands *commands.Bus
	queries  *queries.Bus
}

func NewPageHandler(commands *commands.Bus, queries *queries.Bus) *PageHandler {
	return &PageHandler{commands: commands, queries: queries}
}

func (h *PageHandler) Create(c *fiber.Ctx) error {
	userID, ok := middleware.UserID(c)
	if !ok {
		return response.Error(c, fiber.StatusUnauthorized, "unauthorized")
	}
	var req struct {
		Slug     string          `json:"slug"`
		Template string          `json:"template"`
		Content  json.RawMessage `json:"content"`
	}
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "invalid request")
	}
	page, err := h.commands.CreatePage(c.Context(), commands.CreatePage{UserID: userID, Slug: req.Slug, Template: req.Template, Content: req.Content})
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, err.Error())
	}
	return response.JSON(c, fiber.StatusCreated, page)
}

func (h *PageHandler) UpdateContent(c *fiber.Ctx) error {
	userID, ok := middleware.UserID(c)
	if !ok {
		return response.Error(c, fiber.StatusUnauthorized, "unauthorized")
	}
	pageID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "invalid page id")
	}
	var req struct {
		Content json.RawMessage `json:"content"`
	}
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "invalid request")
	}
	page, err := h.commands.UpdatePageContent(c.Context(), commands.UpdatePageContent{PageID: pageID, UserID: userID, Content: req.Content})
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, err.Error())
	}
	return response.JSON(c, fiber.StatusOK, page)
}

func (h *PageHandler) Publish(c *fiber.Ctx) error {
	userID, ok := middleware.UserID(c)
	if !ok {
		return response.Error(c, fiber.StatusUnauthorized, "unauthorized")
	}
	pageID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "invalid page id")
	}
	page, err := h.commands.PublishPage(c.Context(), commands.PublishPage{PageID: pageID, UserID: userID})
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, err.Error())
	}
	return response.JSON(c, fiber.StatusOK, page)
}

func (h *PageHandler) GetBySlug(c *fiber.Ctx) error {
	page, err := h.queries.GetPageBySlug(c.Context(), c.Params("slug"))
	if err != nil {
		return response.Error(c, fiber.StatusNotFound, "page not found")
	}
	return response.JSON(c, fiber.StatusOK, page)
}

func (h *PageHandler) ListMine(c *fiber.Ctx) error {
	userID, ok := middleware.UserID(c)
	if !ok {
		return response.Error(c, fiber.StatusUnauthorized, "unauthorized")
	}
	pages, err := h.queries.GetUserPages(c.Context(), userID)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	return response.JSON(c, fiber.StatusOK, pages)
}
