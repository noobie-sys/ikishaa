package page

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

// It will create a new page and save it to the repository.

func (s *Service) Create(ctx context.Context, userID uuid.UUID, slug string, template string, content json.RawMessage) (*Page, error) {
	page, err := New(userID, slug, template, content)
	if err != nil {
		return nil, err
	}
	if err := s.repo.Create(ctx, page); err != nil {
		return nil, err
	}
	return page, nil
}

func (s *Service) UpdateContent(ctx context.Context, pageID uuid.UUID, userID uuid.UUID, content json.RawMessage) (*Page, error) {
	page, err := s.repo.FindByID(ctx, pageID)
	if err != nil {
		return nil, err
	}
	if page.UserID != userID {
		return nil, ErrForbidden
	}
	if err := page.UpdateContent(content); err != nil {
		return nil, err
	}
	return page, s.repo.Update(ctx, page)
}

func (s *Service) Publish(ctx context.Context, pageID uuid.UUID, userID uuid.UUID) (*Page, error) {
	page, err := s.repo.FindByID(ctx, pageID)
	if err != nil {
		return nil, err
	}
	if page.UserID != userID {
		return nil, ErrForbidden
	}
	if err := page.Publish(); err != nil {
		return nil, err
	}
	return page, s.repo.Update(ctx, page)
}
