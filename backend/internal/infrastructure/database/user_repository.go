package database

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/ikisha/portfolio/backend/internal/domain/user"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

type userModel struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey"`
	Email     string    `gorm:"uniqueIndex"`
	Name      string
	AvatarURL string  `gorm:"column:avatar_url"`
	GoogleID  *string `gorm:"column:google_id;uniqueIndex"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (userModel) TableName() string { return "users" }

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, u *user.User) error {
	return r.db.WithContext(ctx).Create(fromUser(u)).Error
}

func (r *UserRepository) Update(ctx context.Context, u *user.User) error {
	return r.db.WithContext(ctx).Save(fromUser(u)).Error
}

func (r *UserRepository) FindByID(ctx context.Context, id uuid.UUID) (*user.User, error) {
	var model userModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		return nil, normalizeNotFound(err, "user not found")
	}
	return toUser(model), nil
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*user.User, error) {
	var model userModel
	if err := r.db.WithContext(ctx).First(&model, "email = ?", email).Error; err != nil {
		return nil, normalizeNotFound(err, "user not found")
	}
	return toUser(model), nil
}

func (r *UserRepository) FindByGoogleID(ctx context.Context, googleID string) (*user.User, error) {
	var model userModel
	if err := r.db.WithContext(ctx).First(&model, "google_id = ?", googleID).Error; err != nil {
		return nil, normalizeNotFound(err, "user not found")
	}
	return toUser(model), nil
}

func fromUser(u *user.User) *userModel {
	return &userModel{
		ID:        u.ID,
		Email:     u.Email,
		Name:      u.Name,
		AvatarURL: u.AvatarURL,
		GoogleID:  stringPtr(u.GoogleID),
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}

func toUser(model userModel) *user.User {
	return &user.User{
		ID:        model.ID,
		Email:     model.Email,
		Name:      model.Name,
		AvatarURL: model.AvatarURL,
		GoogleID:  stringValue(model.GoogleID),
		CreatedAt: model.CreatedAt,
		UpdatedAt: model.UpdatedAt,
	}
}

func stringPtr(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}

func stringValue(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}
