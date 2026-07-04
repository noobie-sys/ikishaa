package validator

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

type EditorialStripContent struct {
	Version int                    `json:"version"`
	Kind    string                 `json:"kind"`
	Header  EditorialStripHeader   `json:"header"`
	Slides  []EditorialStripSlide  `json:"slides"`
}

type EditorialStripHeader struct {
	Left  string `json:"left"`
	Brand string `json:"brand"`
	Right string `json:"right"`
}

type EditorialStripSlide struct {
	Image Image  `json:"image"`
	Line1 string `json:"line1"`
	Line2 string `json:"line2"`
}

func ValidateEditorialStripContent(raw json.RawMessage) error {
	var content EditorialStripContent
	if err := json.Unmarshal(raw, &content); err != nil {
		return fmt.Errorf("invalid editorial-strip content JSON: %w", err)
	}
	if content.Version != 1 {
		return errors.New("content version must be 1")
	}
	if content.Kind != "editorial-strip" {
		return errors.New("content kind must be editorial-strip")
	}
	if err := validateEditorialHeader(content.Header); err != nil {
		return fmt.Errorf("header: %w", err)
	}
	if len(content.Slides) < 3 {
		return errors.New("editorial-strip requires at least 3 slides")
	}
	if len(content.Slides) > 12 {
		return errors.New("editorial-strip may not exceed 12 slides")
	}
	for idx, slide := range content.Slides {
		if err := validateEditorialSlide(slide); err != nil {
			return fmt.Errorf("slides[%d]: %w", idx, err)
		}
	}
	return nil
}

func validateEditorialHeader(header EditorialStripHeader) error {
	if strings.TrimSpace(header.Left) == "" {
		return errors.New("header.left is required")
	}
	if len(header.Left) > 40 {
		return errors.New("header.left exceeds 40 characters")
	}
	if strings.TrimSpace(header.Brand) == "" {
		return errors.New("header.brand is required")
	}
	if len(header.Brand) > 80 {
		return errors.New("header.brand exceeds 80 characters")
	}
	if strings.TrimSpace(header.Right) == "" {
		return errors.New("header.right is required")
	}
	if len(header.Right) > 40 {
		return errors.New("header.right exceeds 40 characters")
	}
	return nil
}

func validateEditorialSlide(slide EditorialStripSlide) error {
	if err := validateURL(slide.Image.URL); err != nil {
		return fmt.Errorf("image: %w", err)
	}
	if strings.TrimSpace(slide.Line1) == "" {
		return errors.New("line1 is required")
	}
	if len(slide.Line1) > 80 {
		return errors.New("line1 exceeds 80 characters")
	}
	if strings.TrimSpace(slide.Line2) == "" {
		return errors.New("line2 is required")
	}
	if len(slide.Line2) > 120 {
		return errors.New("line2 exceeds 120 characters")
	}
	return nil
}
