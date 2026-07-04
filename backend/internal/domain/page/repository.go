package page

import (
	"context"

	"github.com/google/uuid"
)

type Repository interface {
	Create(ctx context.Context, page *Page) error
	Update(ctx context.Context, page *Page) error
	FindByID(ctx context.Context, id uuid.UUID) (*Page, error)
	FindBySlug(ctx context.Context, slug string, onlyPublished bool) (*Page, error)
	FindByUserID(ctx context.Context, userID uuid.UUID) ([]Page, error)
}
