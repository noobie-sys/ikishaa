package queries

import (
	"context"

	"github.com/google/uuid"
	"github.com/ikisha/portfolio/backend/internal/domain/page"
)

type Bus struct {
	pages page.Repository
}

func NewBus(pages page.Repository) *Bus {
	return &Bus{pages: pages}
}

func (b *Bus) GetPageBySlug(ctx context.Context, slug string) (*page.Page, error) {
	return b.pages.FindBySlug(ctx, slug, true)
}

func (b *Bus) GetUserPages(ctx context.Context, userID uuid.UUID) ([]page.Page, error) {
	return b.pages.FindByUserID(ctx, userID)
}
