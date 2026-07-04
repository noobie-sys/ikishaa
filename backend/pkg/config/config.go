package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv             string
	HTTPAddr           string
	FrontendURL        string
	DatabaseURL        string
	DatabaseMaxConns   int32
	JWTAccessSecret    string
	JWTRefreshSecret   string
	AccessTokenTTL     time.Duration
	RefreshTokenTTL    time.Duration
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string
	CookieSecure       bool
	CookieDomain       string
	CookieSameSite     string
	CloudinaryFolder   string
	CloudinaryFormats  []string
	MaxImageBytes      int64
}

func MustLoad() Config {
	_ = godotenv.Load()
	cfg := Config{
		AppEnv:             get("APP_ENV", "development"),
		HTTPAddr:           get("HTTP_ADDR", ":8080"),
		FrontendURL:        get("FRONTEND_URL", "http://localhost:3000"),
		DatabaseURL:        must("DATABASE_URL"),
		DatabaseMaxConns:   int32(getInt("DATABASE_MAX_CONNS", 20)),
		JWTAccessSecret:    must("JWT_ACCESS_SECRET"),
		JWTRefreshSecret:   must("JWT_REFRESH_SECRET"),
		AccessTokenTTL:     time.Duration(getInt("ACCESS_TOKEN_TTL_MINUTES", 15)) * time.Minute,
		RefreshTokenTTL:    time.Duration(getInt("REFRESH_TOKEN_TTL_HOURS", 720)) * time.Hour,
		GoogleClientID:     get("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: get("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURL:  get("GOOGLE_REDIRECT_URL", ""),
		CookieSecure:       getBool("COOKIE_SECURE", true),
		CookieDomain:       get("COOKIE_DOMAIN", ""),
		CookieSameSite:     get("COOKIE_SAME_SITE", "Lax"),
		CloudinaryFolder:   get("CLOUDINARY_UPLOAD_FOLDER", "ikisha/dev"),
		CloudinaryFormats:  getCSV("CLOUDINARY_ALLOWED_FORMATS", "jpg,jpeg,png,webp,avif"),
		MaxImageBytes:      int64(getInt("CLOUDINARY_MAX_IMAGE_BYTES", 25_000_000)),
	}
	if cfg.AppEnv == "production" {
		requireStrongSecret("JWT_ACCESS_SECRET", cfg.JWTAccessSecret)
		requireStrongSecret("JWT_REFRESH_SECRET", cfg.JWTRefreshSecret)
		if cfg.GoogleClientID == "" || cfg.GoogleClientSecret == "" || cfg.GoogleRedirectURL == "" {
			panic("Google OAuth environment variables are required in production")
		}
		if !cfg.CookieSecure {
			panic("COOKIE_SECURE must be true in production")
		}
	}
	return cfg
}

func requireStrongSecret(key, value string) {
	if len(value) < 32 || value == "replace-with-32-byte-access-secret" || value == "replace-with-32-byte-refresh-secret" {
		panic(fmt.Sprintf("%s must be a unique secret with at least 32 characters", key))
	}
}

func must(key string) string {
	value := os.Getenv(key)
	if value == "" {
		panic("missing environment variable: " + key)
	}
	return value
}

func get(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func getInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func getBool(key string, fallback bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func getCSV(key, fallback string) []string {
	value := get(key, fallback)
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			result = append(result, part)
		}
	}
	return result
}
