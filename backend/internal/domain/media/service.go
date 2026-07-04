package media

import (
	"context"
	"errors"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Service struct {
	repo     Repository
	uploader Uploader
	policy   UploadPolicy
}

type UploadPolicy struct {
	MaxBytes int64
	Folder   string
	Formats  []string
}

func NewService(repo Repository, uploader Uploader, policy UploadPolicy) *Service {
	if policy.MaxBytes == 0 {
		policy.MaxBytes = 25_000_000
	}
	if policy.Folder == "" {
		policy.Folder = "ikisha/dev"
	}
	if len(policy.Formats) == 0 {
		policy.Formats = []string{"jpg", "jpeg", "png", "webp", "avif"}
	}
	return &Service{repo: repo, uploader: uploader, policy: policy}
}

func (s *Service) Upload(ctx context.Context, userID uuid.UUID, file *multipart.FileHeader) (*Media, error) {
	if file.Size > s.policy.MaxBytes {
		return nil, errors.New("file exceeds maximum image size")
	}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !s.allowedExtension(ext) {
		return nil, errors.New("unsupported media type")
	}
	tmp, err := os.CreateTemp("", "ikisha-upload-*"+ext)
	if err != nil {
		return nil, err
	}
	defer os.Remove(tmp.Name())
	defer tmp.Close()

	src, err := file.Open()
	if err != nil {
		return nil, err
	}
	defer src.Close()
	if _, err := tmp.ReadFrom(src); err != nil {
		return nil, err
	}

	uploaded, err := s.uploader.Upload(ctx, tmp.Name(), s.policy.Folder+"/"+userID.String())
	if err != nil {
		return nil, err
	}
	uploaded.ID = uuid.New()
	uploaded.UserID = userID
	uploaded.CreatedAt = time.Now().UTC()
	return uploaded, s.repo.Create(ctx, uploaded)
}

func (s *Service) allowedExtension(ext string) bool {
	ext = strings.TrimPrefix(ext, ".")
	for _, format := range s.policy.Formats {
		if ext == strings.TrimPrefix(strings.ToLower(format), ".") {
			return true
		}
	}
	return false
}
