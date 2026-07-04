package auth

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"

	"github.com/ikisha/portfolio/backend/pkg/config"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type GoogleProfile struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Name     string `json:"name"`
	Picture  string `json:"picture"`
	Verified bool   `json:"verified_email"`
}

type GoogleOAuth struct {
	config *oauth2.Config
}

func NewGoogleOAuth(cfg config.Config) *GoogleOAuth {
	return &GoogleOAuth{
		config: &oauth2.Config{
			ClientID:     cfg.GoogleClientID,
			ClientSecret: cfg.GoogleClientSecret,
			RedirectURL:  cfg.GoogleRedirectURL,
			Scopes:       []string{"openid", "email", "profile"},
			Endpoint:     google.Endpoint,
		},
	}
}

func (g *GoogleOAuth) AuthCodeURL(state string) string {
	return g.config.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

func (g *GoogleOAuth) ExchangeProfile(ctx context.Context, code string) (*GoogleProfile, error) {
	token, err := g.config.Exchange(ctx, code)
	if err != nil {
		return nil, err
	}
	client := g.config.Client(ctx, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, errors.New("google profile request failed")
	}
	var profile GoogleProfile
	if err := json.NewDecoder(resp.Body).Decode(&profile); err != nil {
		return nil, err
	}
	if !profile.Verified {
		return nil, errors.New("google email is not verified")
	}
	return &profile, nil
}
