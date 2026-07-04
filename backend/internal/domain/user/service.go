package user

import (
	"context"
	"time"
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) FindOrCreateGoogleUser(ctx context.Context, email, name, avatarURL, googleID string) (*User, error) {
	existing, err := s.repo.FindByGoogleID(ctx, googleID)
	if err == nil {
		return existing, nil
	}
	byEmail, emailErr := s.repo.FindByEmail(ctx, email)
	if emailErr == nil {
		byEmail.GoogleID = googleID
		byEmail.Name = name
		byEmail.AvatarURL = avatarURL
		byEmail.UpdatedAt = time.Now().UTC()
		return byEmail, s.repo.Update(ctx, byEmail)
	}
	newUser := NewGoogleUser(email, name, avatarURL, googleID)
	return newUser, s.repo.Create(ctx, newUser)
}
