package response

import "github.com/gofiber/fiber/v2"

type ErrorBody struct {
	Error string `json:"error"`
}

func JSON(c *fiber.Ctx, status int, body any) error {
	return c.Status(status).JSON(body)
}

func Error(c *fiber.Ctx, status int, message string) error {
	return c.Status(status).JSON(ErrorBody{Error: message})
}
