package handlers

import (
	"crypto/rand"
	"encoding/base64"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/ikisha/portfolio/backend/internal/domain/user"
	"github.com/ikisha/portfolio/backend/internal/infrastructure/auth"
	"github.com/ikisha/portfolio/backend/pkg/config"
	"github.com/ikisha/portfolio/backend/pkg/response"
)

type AuthHandler struct {
	users  *user.Service
	tokens *auth.JWTService
	google *auth.GoogleOAuth
	cfg    config.Config
}

func NewAuthHandler(users *user.Service, tokens *auth.JWTService, google *auth.GoogleOAuth, cfg config.Config) *AuthHandler {
	return &AuthHandler{users: users, tokens: tokens, google: google, cfg: cfg}
}

func (h *AuthHandler) GoogleLogin(c *fiber.Ctx) error {
	state := randomState()
	h.setCookie(c, "oauth_state", state, 10*time.Minute)
	return c.Redirect(h.google.AuthCodeURL(state), fiber.StatusTemporaryRedirect)
}

func (h *AuthHandler) GoogleCallback(c *fiber.Ctx) error {
	if c.Query("state") != c.Cookies("oauth_state") {
		return response.Error(c, fiber.StatusBadRequest, "invalid oauth state")
	}
	profile, err := h.google.ExchangeProfile(c.Context(), c.Query("code"))
	if err != nil {
		return response.Error(c, fiber.StatusUnauthorized, err.Error())
	}
	u, err := h.users.FindOrCreateGoogleUser(c.Context(), profile.Email, profile.Name, profile.Picture, profile.ID)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, err.Error())
	}
	access, refresh, err := h.tokensFor(u.ID.String())
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "token generation failed")
	}
	h.setAccessCookie(c, access)
	h.setRefreshCookie(c, refresh)
	h.clearCookie(c, "oauth_state")
	return c.Redirect(h.cfg.FrontendURL+"/dashboard", fiber.StatusTemporaryRedirect)
}

func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	claims, err := h.tokens.ValidateRefresh(c.Cookies("refresh_token"))
	if err != nil {
		return response.Error(c, fiber.StatusUnauthorized, "invalid refresh token")
	}
	access, err := h.tokens.GenerateAccess(claims.UserID)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "token generation failed")
	}
	h.setAccessCookie(c, access)
	return response.JSON(c, fiber.StatusOK, fiber.Map{"ok": true})
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	h.clearCookie(c, "access_token")
	h.clearCookie(c, "refresh_token")
	return response.JSON(c, fiber.StatusOK, fiber.Map{"ok": true})
}

func (h *AuthHandler) tokensFor(userID string) (string, string, error) {
	id, err := uuidParse(userID)
	if err != nil {
		return "", "", err
	}
	access, err := h.tokens.GenerateAccess(id)
	if err != nil {
		return "", "", err
	}
	refresh, err := h.tokens.GenerateRefresh(id)
	return access, refresh, err
}

func (h *AuthHandler) setRefreshCookie(c *fiber.Ctx, token string) {
	h.setCookie(c, "refresh_token", token, h.cfg.RefreshTokenTTL)
}

func (h *AuthHandler) setAccessCookie(c *fiber.Ctx, token string) {
	h.setCookie(c, "access_token", token, h.cfg.AccessTokenTTL)
}

func (h *AuthHandler) setCookie(c *fiber.Ctx, name, value string, ttl time.Duration) {
	c.Cookie(&fiber.Cookie{
		Name:     name,
		Value:    value,
		HTTPOnly: true,
		Secure:   h.cfg.CookieSecure,
		SameSite: h.cfg.CookieSameSite,
		Domain:   h.cfg.CookieDomain,
		Expires:  time.Now().Add(ttl),
		MaxAge:   int(ttl.Seconds()),
	})
}

func (h *AuthHandler) clearCookie(c *fiber.Ctx, name string) {
	c.Cookie(&fiber.Cookie{
		Name:     name,
		Value:    "",
		HTTPOnly: true,
		Secure:   h.cfg.CookieSecure,
		SameSite: h.cfg.CookieSameSite,
		Domain:   h.cfg.CookieDomain,
		Expires:  time.Now().Add(-time.Hour),
		MaxAge:   -1,
	})
}

func randomState() string {
	buf := make([]byte, 32)
	_, _ = rand.Read(buf)
	return base64.RawURLEncoding.EncodeToString(buf)
}
