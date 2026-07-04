package validator

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

type MonoCollageContent struct {
	Version int                    `json:"version"`
	Kind    string                 `json:"kind"`
	Images  map[string]Image       `json:"images"`
	Label   string                 `json:"label"`
	Caption string                 `json:"caption"`
}

var requiredMonoCollageImageKeys = []string{
	"topLeft",
	"tallRight",
	"main",
	"midRight",
	"bottomRight",
}

func ValidateMonoCollageContent(raw json.RawMessage) error {
	var content MonoCollageContent
	if err := json.Unmarshal(raw, &content); err != nil {
		return fmt.Errorf("invalid mono-collage content JSON: %w", err)
	}
	if content.Version != 1 {
		return errors.New("content version must be 1")
	}
	if content.Kind != "mono-collage" {
		return errors.New("content kind must be mono-collage")
	}
	if len(content.Images) != len(requiredMonoCollageImageKeys) {
		return errors.New("mono-collage requires exactly 5 images")
	}
	for _, key := range requiredMonoCollageImageKeys {
		image, ok := content.Images[key]
		if !ok {
			return fmt.Errorf("images.%s is required", key)
		}
		if err := validateURL(image.URL); err != nil {
			return fmt.Errorf("images.%s: %w", key, err)
		}
	}
	if strings.TrimSpace(content.Label) == "" {
		return errors.New("label is required")
	}
	if len(content.Label) > 120 {
		return errors.New("label exceeds 120 characters")
	}
	if strings.TrimSpace(content.Caption) == "" {
		return errors.New("caption is required")
	}
	if len(content.Caption) > 400 {
		return errors.New("caption exceeds 400 characters")
	}
	return nil
}
