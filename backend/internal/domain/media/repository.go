package media

import (
	"context"
)

type Repository interface {
	Create(ctx context.Context, media *Media) error
}

type Uploader interface {
	Upload(ctx context.Context, filePath string, folder string) (*Media, error)
}
