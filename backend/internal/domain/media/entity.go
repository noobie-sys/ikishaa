package media

import (
	"time"

	"github.com/google/uuid"
)

type Media struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	URL       string    `json:"url"`
	PublicID  string    `json:"public_id"`
	Width     int       `json:"width"`
	Height    int       `json:"height"`
	Format    string    `json:"format"`
	CreatedAt time.Time `json:"created_at"`
}
