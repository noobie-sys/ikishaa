package page

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/ikisha/portfolio/backend/pkg/validator"
)

const (
	TemplateMinimalGrid     = "minimal-grid"
	TemplateMonoCollage     = "mono-collage"
	TemplateEditorialStrip  = "editorial-strip"
)

var allowedTemplates = map[string]struct{}{
	TemplateMinimalGrid:    {},
	TemplateMonoCollage:    {},
	TemplateEditorialStrip: {},
}

type Page struct {
	ID          uuid.UUID       `json:"id"`
	UserID      uuid.UUID       `json:"user_id"`
	Slug        string          `json:"slug"`
	Template    string          `json:"template"`
	Content     json.RawMessage `json:"content"`
	IsPublished bool            `json:"is_published"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

func New(userID uuid.UUID, slug string, template string, content json.RawMessage) (*Page, error) {
	if slug == "" {
		return nil, errors.New("slug is required")
	}
	if _, ok := allowedTemplates[template]; !ok {
		return nil, errors.New("unsupported template")
	}
	if err := validator.ValidatePageContent(template, content); err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	return &Page{
		ID:          uuid.New(),
		UserID:      userID,
		Slug:        slug,
		Template:    template,
		Content:     content,
		IsPublished: false,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

func (p *Page) UpdateContent(content json.RawMessage) error {
	if p.IsPublished {
		return errors.New("published pages must be unpublished before content updates")
	}
	if err := validator.ValidatePageContent(p.Template, content); err != nil {
		return err
	}
	p.Content = content
	p.touch()
	return nil
}

func (p *Page) Publish() error {
	if err := validator.ValidatePageContent(p.Template, p.Content); err != nil {
		return err
	}
	p.IsPublished = true
	p.touch()
	return nil
}

func (p *Page) touch() {
	p.UpdatedAt = time.Now().UTC()
}
