package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/ikisha/portfolio/backend/internal/domain/media"
	"github.com/ikisha/portfolio/backend/internal/interfaces/http/middleware"
	"github.com/ikisha/portfolio/backend/pkg/response"
)

type MediaHandler struct {
	media *media.Service
}

func NewMediaHandler(media *media.Service) *MediaHandler {
	return &MediaHandler{media: media}
}

func (h *MediaHandler) Upload(c *fiber.Ctx) error {
	userID, ok := middleware.UserID(c)
	if !ok {
		return response.Error(c, fiber.StatusUnauthorized, "unauthorized")
	}
	file, err := c.FormFile("file")
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "file is required")
	}
	uploaded, err := h.media.Upload(c.Context(), userID, file)
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, err.Error())
	}
	return response.JSON(c, fiber.StatusCreated, uploaded)
}
