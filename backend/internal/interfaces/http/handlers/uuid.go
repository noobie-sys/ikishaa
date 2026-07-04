package handlers

import "github.com/google/uuid"

func uuidParse(value string) (uuid.UUID, error) {
	return uuid.Parse(value)
}
