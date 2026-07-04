package database

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/ikisha/portfolio/backend/internal/domain/media"
	"gorm.io/gorm"
)

type MediaRepository struct {
	db *gorm.DB
}

type mediaModel struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserID    uuid.UUID `gorm:"type:uuid;column:user_id"`
	URL       string
	PublicID  string `gorm:"column:public_id"`
	Width     int
	Height    int
	Format    string
	CreatedAt time.Time
}

func (mediaModel) TableName() string { return "media" }

func NewMediaRepository(db *gorm.DB) *MediaRepository {
	return &MediaRepository{db: db}
}

func (r *MediaRepository) Create(ctx context.Context, m *media.Media) error {
	return r.db.WithContext(ctx).Create(&mediaModel{
		ID:        m.ID,
		UserID:    m.UserID,
		URL:       m.URL,
		PublicID:  m.PublicID,
		Width:     m.Width,
		Height:    m.Height,
		Format:    m.Format,
		CreatedAt: m.CreatedAt,
	}).Error
}
