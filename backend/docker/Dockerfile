FROM golang:1.22-alpine AS build
WORKDIR /app
RUN apk add --no-cache ca-certificates
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/api ./cmd/api

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=build /bin/api /bin/api
EXPOSE 8080
CMD ["/bin/api"]
