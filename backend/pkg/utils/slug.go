package utils

import (
	"regexp"
	"strings"
)

var nonSlug = regexp.MustCompile(`[^a-z0-9-]+`)
var multiDash = regexp.MustCompile(`-+`)

func Slugify(value string) string {
	slug := strings.ToLower(strings.TrimSpace(value))
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = nonSlug.ReplaceAllString(slug, "-")
	slug = multiDash.ReplaceAllString(slug, "-")
	return strings.Trim(slug, "-")
}
