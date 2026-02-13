# Social Media API

A RESTful API built with NestJS following Clean Architecture principles. The project is organized into feature-based modules with clear separation between domain, application, infrastructure, and presentation layers.

## Tech Stack

- Runtime: Node.js
- Framework: NestJS 11
- Language: TypeScript (ESM)
- Database: PostgreSQL 17 (Docker)
- ORM: TypeORM
- Authentication: JWT (Passport)
- Validation: class-validator + class-transformer

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Docker & Docker Compose

### 1. Clone & Install

```bash
git clone <repo-url>
cd api-app
npm install
```

### 2. Environment

Create a `.env` file in the project root:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5435
DATABASE_USER=user1
DATABASE_PASSWORD=yes123
DATABASE_NAME=social_media_db
JWT_SECRET=supersecretkey
```

### 3. Start PostgreSQL

```bash
docker compose up -d
```

### 4. Run the App

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

## API Endpoints

All responses follow the BaseResponse format:

```json
{
  "statusCode": 200,
  "message": "Success",
  "timestamp": "2026-02-12T00:00:00.000Z",
  "data": { ... }
}
```

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Login, returns JWT |

Register `POST /auth/register`
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "password123"
}
```

Login `POST /auth/login`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Users

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/users` | JWT | `admin` | List all users |
| `GET` | `/users/:id` | JWT | any | Get user by ID |

### Posts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/posts/create` | JWT | Create a post |
| `GET` | `/posts` | No | List all posts |
| `GET` | `/posts/:id` | No | Get post by ID |
| `PATCH` | `/posts/:id/update` | JWT | Update own post |
| `DELETE` | `/posts/:id/delete` | JWT | Delete own post |

Create Post `POST /posts/create`
```json
{
  "content": "Hello world!"
}
```

Update Post `PATCH /posts/:id/update`
```json
{
  "content": "Updated content"
}
```

> Only the post author can update or delete their own post. Attempting to modify another user's post returns `403 Forbidden`.

## Architecture

```
src/
├── common/                         # Shared concerns
│   ├── decorators/
│   │   ├── roles.decorator.ts          # @Roles() for RBAC metadata
│   │   └── response-message.decorator.ts # @ResponseMessage() for response wrapper
│   ├── exceptions/
│   │   └── domain-exception.ts         # Framework-agnostic domain exceptions
│   ├── filters/
│   │   └── domain-exception.filter.ts  # Maps domain exceptions → HTTP responses
│   └── interceptors/
│       └── unify-response.interceptor.ts # Wraps all responses in BaseResponse
│
├── users/                          # User management module
│   ├── domain/
│   │   ├── user.entity.ts              # User domain entity (pure TS)
│   │   └── user.repository.interface.ts # Abstract UserRepository contract
│   ├── application/
│   │   ├── user.service.ts             # Business logic (register, find)
│   │   └── dtos/
│   │       ├── create-user.dto.ts      # Input validation
│   │       └── user-response.dto.ts    # Output shape (excludes password)
│   ├── infrastructure/
│   │   ├── user.infrastructure.module.ts # DIP binding
│   │   └── persistence/
│   │       ├── user.orm-entity.ts      # TypeORM entity
│   │       ├── user.mapper.ts          # Domain ↔ ORM mapping
│   │       └── user.repository.impl.ts # Concrete repository
│   ├── presentation/
│   │   └── user.controller.ts          # GET /users, GET /users/:id
│   └── user.module.ts
│
├── auth/                           # Authentication module
│   ├── application/
│   │   ├── auth.service.ts             # Register + Login + JWT generation
│   │   └── dtos/
│   │       └── login.dto.ts
│   ├── infrastructure/
│   │   ├── jwt.strategy.ts             # Passport JWT strategy
│   │   ├── jwt-auth.guard.ts           # Auth guard
│   │   └── roles.guard.ts             # RBAC guard
│   ├── presentation/
│   │   └── auth.controller.ts          # POST /auth/register, POST /auth/login
│   └── auth.module.ts
│
├── posts/                          # Posts module
│   ├── domain/
│   │   ├── post.entity.ts              # Post domain entity (content + userId)
│   │   └── post.repository.interface.ts
│   ├── application/
│   │   ├── post.service.ts             # CRUD + ownership validation
│   │   └── dtos/
│   │       ├── create-post.dto.ts
│   │       ├── update-post.dto.ts
│   │       └── post-response.dto.ts
│   ├── infrastructure/
│   │   ├── post.infrastructure.module.ts
│   │   └── persistence/
│   │       ├── post.orm-entity.ts      # ManyToOne → UserOrmEntity
│   │       ├── post.mapper.ts
│   │       └── post.repository.impl.ts
│   ├── presentation/
│   │   └── post.controller.ts          # CRUD endpoints
│   └── post.module.ts
│
├── app.module.ts                   # Root module (TypeORM + Config + all modules)
└── main.ts                         # Bootstrap (ValidationPipe, Filter, Interceptor, CORS)
```

### Layer Responsibilities

| Layer | Purpose | Depends On |
|---|---|---|
| Domain | Entities, repository interfaces | Nothing |
| Application | Use cases/services, DTOs | Domain |
| Infrastructure | ORM entities, mappers, concrete repos | Domain, Application |
| Presentation | Controllers | Application |

### Dependency Rule

Inner layers never depend on outer layers. The domain layer has no framework imports. Infrastructure implements domain interfaces via Dependency Inversion (DIP).

### Domain Exceptions

Custom framework-agnostic exceptions that get mapped to HTTP status codes by `DomainExceptionFilter`:

| Exception | HTTP Status |
|---|---|
| `EntityNotFoundException` | `404 Not Found` |
| `EntityConflictException` | `409 Conflict` |
| `UnauthorizedException` | `401 Unauthorized` |
| `ForbiddenException` | `403 Forbidden` |

## SOLID Principles

| Principle | Description | How It's Applied |
|---|---|---|
| S — Single Responsibility | A class should have only one reason to change | Each class has one job: `UserService` → user logic, `AuthService` → auth logic, `PostController` → HTTP routing, `UserMapper` → entity mapping. Auth and Users are separate modules. |
| O — Open/Closed | Open for extension, closed for modification | Adding a new module (e.g. `comments/`) or a new exception (e.g. `RateLimitException`) requires only new files — no modification to existing code. |
| L — Liskov Substitution | Subtypes must be substitutable for their base types | `PostRepositoryImpl` must be able to replace `PostRepository` without breaking `PostService`. This means any new implementation (e.g. `PostInMemoryRepository`) can be swapped in and everything still works. |
| I — Interface Segregation | Depend on small, specific interfaces instead of large ones | Each repository defines only the methods it needs (`PostRepository` ≠ `UserRepository`). DTOs are split per use case (`CreatePostDto` ≠ `UpdatePostDto` ≠ `PostResponseDto`). |
| D — Dependency Inversion | Depend on abstractions, not concretions | `PostService` depends on `PostRepository` (abstract, domain layer). `PostRepositoryImpl` (infrastructure) provides the concrete implementation. Bound via `{ provide: PostRepository, useClass: PostRepositoryImpl }`. |


## Patterns

### 1. Repository Pattern

Abstracts data access behind an interface. The domain defines what operations exist, the infrastructure decides how.

```
UserRepository (abstract)  →  UserRepositoryImpl (TypeORM)
PostRepository (abstract)  →  PostRepositoryImpl (TypeORM)
```

`PostService` calls `this.postRepository.save(post)`, it has no idea whether that writes to PostgreSQL, MongoDB, or a JSON file.

### 2. Factory Method

Entities use a static `create()` method with a private constructor to enforce valid creation:

```typescript
// Cannot do: new User({ ... })   constructor is private
// Must do:   User.create({ ... })
const user = User.create({ id, username, email, password });
const post = Post.create({ id, content, userId });
```

This guarantees every entity passes through a single controlled entry point (defaults like `role = USER`, `createdAt = now` are set here).

### 3. Data Mapper

`UserMapper` and `PostMapper` handle conversion between domain entities (pure TS) and ORM entities (TypeORM-decorated):

```
Domain Entity  ←──  Mapper  ──→  ORM Entity
   User        ←  UserMapper  →  UserOrmEntity
   Post        ←  PostMapper  →  PostOrmEntity
```

This keeps TypeORM decorators out of the domain layer entirely.

### 4. Data Transfer Object (DTO)

Separate objects for input and output, each with only the relevant fields:

| DTO | Purpose | Fields |
|---|---|---|
| `CreateUserDto` | Input validation | username, email, password |
| `CreatePostDto` | Input validation | content |
| `UpdatePostDto` | Partial update | content (optional) |
| `UserResponseDto` | API output | id, username, email, role, timestamps (no password) |
| `PostResponseDto` | API output | id, content, userId, user, timestamps |
| `LoginDto` | Auth input | email, password |

### 5. Dependency Injection (IoC)

NestJS's built-in IoC container manages object lifecycle and wiring. All services are `@Injectable()` and receive dependencies via constructor injection.

### 6. Decorator Pattern

Custom decorators attach metadata to route handlers without modifying their logic:

```typescript
@Roles(UserRole.ADMIN)           // Attaches required roles metadata
@ResponseMessage('All posts')    // Attaches custom response message
@UseGuards(JwtAuthGuard)         // Attaches authentication behavior
async findAll() { ... }          // Handler logic stays clean
```

### 7. Interceptor Pattern

`UnifyResponseInterceptor` wraps every successful response in a consistent `BaseResponse<T>` format without touching any controller code

```
Controller returns: { id, content, ... }
                         ↓
Interceptor wraps:  { statusCode: 200, message: "Post created", timestamp: "...", data: { id, content, ... } }
```

## References

- [Clean Architecture — Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles — Wikipedia](https://en.wikipedia.org/wiki/SOLID)
- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS Guards](https://docs.nestjs.com/guards)
- [NestJS Interceptors](https://docs.nestjs.com/interceptors)
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- [NestJS Custom Decorators](https://docs.nestjs.com/custom-decorators)
- [TypeORM Documentation](https://typeorm.io/)
- [Passport.js — JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)
- [Repository Pattern — Martin Fowler](https://martinfowler.com/eaaCatalog/repository.html)
- [Data Mapper Pattern — Martin Fowler](https://martinfowler.com/eaaCatalog/dataMapper.html)
- [Data Transfer Object — Martin Fowler](https://martinfowler.com/eaaCatalog/dataTransferObject.html)
- [Factory Method — Refactoring Guru](https://refactoring.guru/design-patterns/factory-method)
- [Decorator Pattern — Refactoring Guru](https://refactoring.guru/design-patterns/decorator)
- [Dependency Injection — Martin Fowler](https://martinfowler.com/articles/injection.html)
