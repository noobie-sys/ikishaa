package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/ikisha/portfolio/backend/pkg/config"
)

type Claims struct {
	UserID uuid.UUID `json:"user_id"`
	jwt.RegisteredClaims
}

type JWTService struct {
	accessSecret  []byte
	refreshSecret []byte
	accessTTL     time.Duration
	refreshTTL    time.Duration
}

func NewJWTService(cfg config.Config) *JWTService {
	return &JWTService{
		accessSecret:  []byte(cfg.JWTAccessSecret),
		refreshSecret: []byte(cfg.JWTRefreshSecret),
		accessTTL:     cfg.AccessTokenTTL,
		refreshTTL:    cfg.RefreshTokenTTL,
	}
}

func (s *JWTService) GenerateAccess(userID uuid.UUID) (string, error) {
	return s.generate(userID, s.accessTTL, s.accessSecret)
}

func (s *JWTService) GenerateRefresh(userID uuid.UUID) (string, error) {
	return s.generate(userID, s.refreshTTL, s.refreshSecret)
}

func (s *JWTService) ValidateAccess(tokenString string) (*Claims, error) {
	return s.validate(tokenString, s.accessSecret)
}

func (s *JWTService) ValidateRefresh(tokenString string) (*Claims, error) {
	return s.validate(tokenString, s.refreshSecret)
}

func (s *JWTService) generate(userID uuid.UUID, ttl time.Duration, secret []byte) (string, error) {
	claims := Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID.String(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(secret)
}

func (s *JWTService) validate(tokenString string, secret []byte) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (any, error) {
		return secret, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, jwt.ErrTokenInvalidClaims
	}
	return claims, nil
}
