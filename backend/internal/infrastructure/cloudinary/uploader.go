package cloudinary

import (
	"context"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/ikisha/portfolio/backend/internal/domain/media"
)

type Uploader struct {
	client         *cloudinary.Cloudinary
	allowedFormats []string
}

func NewUploader(allowedFormats []string) (*Uploader, error) {
	client, err := cloudinary.New()
	if err != nil {
		return nil, err
	}
	return &Uploader{client: client, allowedFormats: allowedFormats}, nil
}

func (u *Uploader) Upload(ctx context.Context, filePath string, folder string) (*media.Media, error) {
	result, err := u.client.Upload.Upload(ctx, filePath, uploader.UploadParams{
		Folder:         folder,
		ResourceType:   "image",
		AllowedFormats: u.allowedFormats,
	})
	if err != nil {
		return nil, err
	}
	return &media.Media{
		URL:      result.SecureURL,
		PublicID: result.PublicID,
		Width:    result.Width,
		Height:   result.Height,
		Format:   result.Format,
	}, nil
}
