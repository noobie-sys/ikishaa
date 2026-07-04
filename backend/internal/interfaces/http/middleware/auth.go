package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/ikisha/portfolio/backend/internal/infrastructure/auth"
	"github.com/ikisha/portfolio/backend/pkg/response"
)

const UserIDKey = "userID"

func Auth(tokens *auth.JWTService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		token := c.Cookies("access_token")
		header := c.Get("Authorization")
		if token == "" && strings.HasPrefix(header, "Bearer ") {
			token = strings.TrimPrefix(header, "Bearer ")
		}
		if token == "" {
			return response.Error(c, fiber.StatusUnauthorized, "missing access token")
		}
		claims, err := tokens.ValidateAccess(token)
		if err != nil {
			return response.Error(c, fiber.StatusUnauthorized, "invalid token")
		}
		c.Locals(UserIDKey, claims.UserID)
		return c.Next()
	}
}

func UserID(c *fiber.Ctx) (uuid.UUID, bool) {
	id, ok := c.Locals(UserIDKey).(uuid.UUID)
	return id, ok
}
