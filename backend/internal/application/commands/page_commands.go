package commands

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
	"github.com/ikisha/portfolio/backend/internal/domain/page"
)

type CreatePage struct {
	UserID   uuid.UUID       `json:"-"`
	Slug     string          `json:"slug"`
	Template string          `json:"template"`
	Content  json.RawMessage `json:"content"`
}

type UpdatePageContent struct {
	PageID  uuid.UUID       `json:"-"`
	UserID  uuid.UUID       `json:"-"`
	Content json.RawMessage `json:"content"`
}

type PublishPage struct {
	PageID uuid.UUID `json:"-"`
	UserID uuid.UUID `json:"-"`
}

type Bus struct {
	pages *page.Service
}

func NewBus(pages *page.Service) *Bus {
	return &Bus{pages: pages}
}

func (b *Bus) CreatePage(ctx context.Context, cmd CreatePage) (*page.Page, error) {
	return b.pages.Create(ctx, cmd.UserID, cmd.Slug, cmd.Template, cmd.Content)
}

func (b *Bus) UpdatePageContent(ctx context.Context, cmd UpdatePageContent) (*page.Page, error) {
	return b.pages.UpdateContent(ctx, cmd.PageID, cmd.UserID, cmd.Content)
}

func (b *Bus) PublishPage(ctx context.Context, cmd PublishPage) (*page.Page, error) {
	return b.pages.Publish(ctx, cmd.PageID, cmd.UserID)
}
