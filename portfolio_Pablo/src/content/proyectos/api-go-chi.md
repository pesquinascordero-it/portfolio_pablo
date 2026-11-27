# API REST en Go con Chi

## Qué problema resuelve

Muchos portfolios tienen un backend monolítico o sin estructura clara. Este proyecto demuestra cómo construir una API REST escalable y mantenible en Go, con una arquitectura limpia que separa responsabilidades y es fácil de extender.

## Arquitectura

La aplicación sigue una arquitectura hexagonal (puertos y adaptadores), divida en capas:

### Estructura de carpetas

```
backend/
├── cmd/server/
│   └── main.go              # Punto de entrada
├── internal/
│   ├── api/
│   │   ├── handlers.go       # Controladores HTTP
│   │   └── middleware.go     # Middleware (autenticación, CORS)
│   ├── domain/
│   │   └── models.go         # Modelos de negocio
│   ├── repository/
│   │   └── postgres.go       # Acceso a datos
│   └── service/
│       └── post_service.go   # Lógica de negocio
├── go.mod
├── Dockerfile
└── docker-compose.yml
```

## Partes clave del código

### Ruteo con Chi

Chi es un router HTTP ligero. La configuración básica:

```go
func NewRouter(handler *handlers.Handler) *chi.Mux {
    r := chi.NewRouter()

    // Middleware global
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)
    r.Use(middleware.RequestID)

    // Rutas públicas
    r.Get("/posts", handler.ListPosts)
    r.Post("/contact", handler.SendContact)

    // Rutas privadas (con autenticación)
    r.Group(func(r chi.Router) {
        r.Use(middleware.Auth)
        r.Post("/posts", handler.CreatePost)
        r.Delete("/posts/{id}", handler.DeletePost)
    })

    return r
}
```

### Modelos y base de datos

Los modelos se definen como estructuras Go y se persisten en PostgreSQL:

```go
type Post struct {
    ID        string    `db:"id"`
    Title     string    `db:"title"`
    Body      string    `db:"body"`
    CreatedAt time.Time `db:"created_at"`
}

type PostRepository interface {
    CreatePost(ctx context.Context, post *Post) error
    GetPost(ctx context.Context, id string) (*Post, error)
    ListPosts(ctx context.Context) ([]*Post, error)
    DeletePost(ctx context.Context, id string) error
}
```

### Manejo de errores

Se usa un patrón de error personalizado para devolver códigos HTTP consistentes:

```go
type APIError struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
}

func (h *Handler) ListPosts(w http.ResponseWriter, r *http.Request) {
    posts, err := h.service.ListPosts(r.Context())
    if err != nil {
        respondError(w, http.StatusInternalServerError, "Failed to fetch posts")
        return
    }
    respondJSON(w, http.StatusOK, posts)
}
```

## Decisiones y alternativas

| Decisión | Alternativa | Por qué |
|----------|-------------|---------|
| **Chi** como router | Gorilla Mux, net/http | Ligero, cero dependencias externas, fácil de aprender |
| **PostgreSQL** como BD | MongoDB, SQLite | ACID completo, escalable, perfecto para un backend profesional |
| **Context** para control | Timeouts manuales | Standard de Go, cancel en cascada automático |
| **sqlc** para queries | ORM (gorm) | Type-safe, cero reflexión, SQL explícito |

## Despliegue

El proyecto incluye un `Dockerfile` multietapa:

```dockerfile
# Build stage
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o server ./cmd/server

# Runtime stage
FROM alpine:3.18
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
```

Y un `docker-compose.yml` para desarrollo:

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      DB_URL: postgres://user:pass@db:5432/api
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: api
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```

## Qué aprendí / próximos pasos

- **Go es rápido y ligero**: el binario es <30MB sin dependencias de runtime.
- **El manejo de errores es explícito**: no hay excepciones, lo que obliga a pensar en cada error.
- **Context es poderoso**: facilita timeouts y cancellations distribuidos.
- **Próximos pasos**:
  - Autenticación JWT
  - Logging estructurado con `zap`
  - Tests unitarios y de integración
  - Métricas con Prometheus

## Referencias

- [Chi Router](https://github.com/go-chi/chi)
- [sqlc](https://sqlc.dev) — Type-safe SQL queries
- [Go by Example](https://gobyexample.com)
