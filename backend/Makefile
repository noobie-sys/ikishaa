AIR_VERSION ?= v1.52.3
AIR_BIN := ./bin/air

.PHONY: dev install-air

dev: install-air
	$(AIR_BIN) -c .air.toml

install-air:
	GOBIN=$$(pwd)/bin go install github.com/air-verse/air@$(AIR_VERSION)
