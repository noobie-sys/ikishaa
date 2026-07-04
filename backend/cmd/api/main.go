package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/ikisha/portfolio/backend/internal/application/commands"
	"github.com/ikisha/portfolio/backend/internal/application/queries"
	"github.com/ikisha/portfolio/backend/internal/domain/media"
	"github.com/ikisha/portfolio/backend/internal/domain/page"
	"github.com/ikisha/portfolio/backend/internal/domain/user"
	"github.com/ikisha/portfolio/backend/internal/infrastructure/auth"
	"github.com/ikisha/portfolio/backend/internal/infrastructure/cloudinary"
	"github.com/ikisha/portfolio/backend/internal/infrastructure/database"
	httpHandlers "github.com/ikisha/portfolio/backend/internal/interfaces/http/handlers"
	"github.com/ikisha/portfolio/backend/internal/interfaces/http/middleware"
	"github.com/ikisha/portfolio/backend/internal/interfaces/http/routes"
	"github.com/ikisha/portfolio/backend/pkg/config"
	"github.com/ikisha/portfolio/backend/pkg/logger"
)

func main() {
	cfg := config.MustLoad()
	logr := logger.New(cfg.AppEnv)
	ctx := context.Background()

	db, err := database.NewPool(ctx, cfg.DatabaseURL, cfg.DatabaseMaxConns)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("database handle: %v", err)
	}
	defer sqlDB.Close()

	pageRepo := database.NewPageRepository(db)
	userRepo := database.NewUserRepository(db)
	mediaRepo := database.NewMediaRepository(db)

	tokenService := auth.NewJWTService(cfg)
	googleOAuth := auth.NewGoogleOAuth(cfg)
	cloudinaryUploader, err := cloudinary.NewUploader(cfg.CloudinaryFormats)
	if err != nil {
		log.Fatalf("connect cloudinary: %v", err)
	}

	pageService := page.NewService(pageRepo)
	userService := user.NewService(userRepo)
	mediaService := media.NewService(mediaRepo, cloudinaryUploader, media.UploadPolicy{
		MaxBytes: cfg.MaxImageBytes,
		Folder:   cfg.CloudinaryFolder,
		Formats:  cfg.CloudinaryFormats,
	})

	commandBus := commands.NewBus(pageService)
	queryBus := queries.NewBus(pageRepo)

	authHandler := httpHandlers.NewAuthHandler(userService, tokenService, googleOAuth, cfg)
	pageHandler := httpHandlers.NewPageHandler(commandBus, queryBus)
	mediaHandler := httpHandlers.NewMediaHandler(mediaService)

	app := fiber.New(fiber.Config{AppName: "ikisha-api"})
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.FrontendURL,
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET,POST,PATCH,DELETE,OPTIONS",
	}))

	authMiddleware := middleware.Auth(tokenService)
	routes.Register(app, routes.Dependencies{
		Auth:       authHandler,
		Pages:      pageHandler,
		Media:      mediaHandler,
		AuthMw:     authMiddleware,
		PublicLogr: logr,
	})

	go func() {
		if err := app.Listen(cfg.HTTPAddr); err != nil {
			log.Fatalf("listen: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	<-stop

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := app.ShutdownWithContext(shutdownCtx); err != nil {
		log.Printf("shutdown: %v", err)
	}
}


