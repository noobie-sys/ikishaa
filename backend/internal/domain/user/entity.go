package user

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	AvatarURL string    `json:"avatar_url"`
	GoogleID  string    `json:"google_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func NewGoogleUser(email, name, avatarURL, googleID string) *User {
	now := time.Now().UTC()
	return &User{
		ID:        uuid.New(),
		Email:     email,
		Name:      name,
		AvatarURL: avatarURL,
		GoogleID:  googleID,
		CreatedAt: now,
		UpdatedAt: now,
	}
}
