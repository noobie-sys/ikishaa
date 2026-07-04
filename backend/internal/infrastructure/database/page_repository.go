package database

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/ikisha/portfolio/backend/internal/domain/page"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type PageRepository struct {
	db *gorm.DB
}

type pageModel struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey"`
	UserID      uuid.UUID `gorm:"type:uuid;column:user_id"`
	Slug        string    `gorm:"uniqueIndex"`
	Template    string
	Content     datatypes.JSON `gorm:"type:jsonb"`
	IsPublished bool           `gorm:"column:is_published"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (pageModel) TableName() string { return "pages" }

func NewPageRepository(db *gorm.DB) *PageRepository {
	return &PageRepository{db: db}
}

func (r *PageRepository) Create(ctx context.Context, p *page.Page) error {
	return r.db.WithContext(ctx).Create(fromPage(p)).Error
}

func (r *PageRepository) Update(ctx context.Context, p *page.Page) error {
	return r.db.WithContext(ctx).Save(fromPage(p)).Error
}

func (r *PageRepository) FindByID(ctx context.Context, id uuid.UUID) (*page.Page, error) {
	var model pageModel
	if err := r.db.WithContext(ctx).First(&model, "id = ?", id).Error; err != nil {
		return nil, normalizeNotFound(err, "page not found")
	}
	return toPage(model), nil
}

func (r *PageRepository) FindBySlug(ctx context.Context, slug string, onlyPublished bool) (*page.Page, error) {
	query := r.db.WithContext(ctx).Where("slug = ?", slug)
	if onlyPublished {
		query = query.Where("is_published = ?", true)
	}
	var model pageModel
	if err := query.First(&model).Error; err != nil {
		return nil, normalizeNotFound(err, "page not found")
	}
	return toPage(model), nil
}

func (r *PageRepository) FindByUserID(ctx context.Context, userID uuid.UUID) ([]page.Page, error) {
	var models []pageModel
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("updated_at desc").Find(&models).Error; err != nil {
		return nil, err
	}
	pages := make([]page.Page, 0, len(models))
	for _, model := range models {
		pages = append(pages, *toPage(model))
	}
	return pages, nil
}

func fromPage(p *page.Page) *pageModel {
	return &pageModel{
		ID:          p.ID,
		UserID:      p.UserID,
		Slug:        p.Slug,
		Template:    p.Template,
		Content:     datatypes.JSON(p.Content),
		IsPublished: p.IsPublished,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

func toPage(model pageModel) *page.Page {
	return &page.Page{
		ID:          model.ID,
		UserID:      model.UserID,
		Slug:        model.Slug,
		Template:    model.Template,
		Content:     json.RawMessage(model.Content),
		IsPublished: model.IsPublished,
		CreatedAt:   model.CreatedAt,
		UpdatedAt:   model.UpdatedAt,
	}
}

func normalizeNotFound(err error, message string) error {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return errors.New(message)
	}
	return err
}
