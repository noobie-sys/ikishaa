package database

import (
	"context"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func NewPool(ctx context.Context, databaseURL string, maxConns int32) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		SkipDefaultTransaction: true,
	})
	if err != nil {
		return nil, err
	}
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	sqlDB.SetMaxOpenConns(int(maxConns))
	sqlDB.SetMaxIdleConns(2)
	sqlDB.SetConnMaxLifetime(time.Hour)
	sqlDB.SetConnMaxIdleTime(30 * time.Minute)
	if err := sqlDB.PingContext(ctx); err != nil {
		return nil, err
	}
	return db, nil
}
