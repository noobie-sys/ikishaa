package validator

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"strings"
)

type PageContent struct {
	Version  int       `json:"version"`
	Sections []Section `json:"sections"`
}

type Section struct {
	Type    string          `json:"type"`
	Layout  string          `json:"layout,omitempty"`
	Images  []Image         `json:"images,omitempty"`
	Content string          `json:"content,omitempty"`
	Items   []CarouselItem  `json:"items,omitempty"`
	Raw     json.RawMessage `json:"-"`
}

type Image struct {
	URL string `json:"url"`
	Alt string `json:"alt,omitempty"`
}

type CarouselItem struct {
	URL string `json:"url"`
}

func ValidatePageContent(template string, raw json.RawMessage) error {
	switch template {
	case "editorial-strip":
		return ValidateEditorialStripContent(raw)
	case "mono-collage":
		return ValidateMonoCollageContent(raw)
	case "minimal-grid", "":
		return validateMinimalGridContent(raw)
	default:
		return errors.New("unsupported template")
	}
}

func validateMinimalGridContent(raw json.RawMessage) error {
	var content PageContent
	if err := json.Unmarshal(raw, &content); err != nil {
		return fmt.Errorf("invalid page content JSON: %w", err)
	}
	if content.Version != 1 {
		return errors.New("content version must be 1")
	}
	if len(content.Sections) == 0 {
		return errors.New("content requires at least one section")
	}
	if len(content.Sections) > 20 {
		return errors.New("content may not exceed 20 sections")
	}
	for idx, section := range content.Sections {
		if err := validateSection(section); err != nil {
			return fmt.Errorf("section %d: %w", idx, err)
		}
	}
	return nil
}

func validateSection(section Section) error {
	switch section.Type {
	case "gallery":
		if section.Layout != "grid" && section.Layout != "stack" {
			return errors.New("gallery layout must be grid or stack")
		}
		if len(section.Images) == 0 || len(section.Images) > 24 {
			return errors.New("gallery requires 1-24 images")
		}
		for _, image := range section.Images {
			if err := validateURL(image.URL); err != nil {
				return err
			}
		}
	case "text":
		if strings.TrimSpace(section.Content) == "" {
			return errors.New("text content is required")
		}
		if len(section.Content) > 4000 {
			return errors.New("text content exceeds 4000 characters")
		}
	case "carousel":
		if len(section.Items) == 0 || len(section.Items) > 20 {
			return errors.New("carousel requires 1-20 items")
		}
		for _, item := range section.Items {
			if err := validateURL(item.URL); err != nil {
				return err
			}
		}
	default:
		return errors.New("unsupported section type")
	}
	return nil
}

func validateURL(value string) error {
	parsed, err := url.ParseRequestURI(value)
	if err != nil || parsed.Scheme == "" || parsed.Host == "" {
		return errors.New("image URL must be absolute")
	}
	if parsed.Scheme != "https" {
		return errors.New("image URL must use https")
	}
	return nil
}
