# APIForge Headless CMS (NestJS)

Headless CMS built with NestJS and a small set of microservices: auth, content types, content, media, and permissions. The gateway provides a single entry point.

## Services

- Gateway (8080): routes requests to microservices
- Auth (8081): registration, login, JWT
- Content-Type (8082): dynamic schema definitions
- Content (8083): content CRUD for dynamic types
- Media (8084): file upload and media metadata
- Permission (8085): API and content-level permissions

## Prerequisites

- Node.js v18+
- PostgreSQL (or the configured Neon PostgreSQL)
- Docker (optional)

## Setup

```bash
npm install
```

Optional environment overrides in `.env`:

```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1h
```

## Running the Services

Start services in separate terminals:

```bash
npm run start:gateway
npm run start:auth
npm run start:content-type
npm run start:content
npm run start:media
npm run start:permission
```

Build all services:

```bash
npm run build
```

## Docker

Run the full stack (Postgres + all services in one container):

```bash
docker compose up --build
```

Gateway: `http://localhost:8080`

## API Endpoints

All endpoints are served via the gateway at `http://localhost:8080`.

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/users`
- Content types: `POST /api/content-types`, `GET /api/content-types`, `GET /api/content-types/api-id/:apiId`
- Content: `POST /api/content/:apiId`, `GET /api/content/:apiId`, `POST /api/content/:apiId/search`,
  `GET /api/content/:apiId/:id`, `PUT /api/content/:apiId/:id`, `DELETE /api/content/:apiId/:id`
- Media: `POST /api/media/upload`, `GET /api/media`, `GET /api/media/files/:filename`
- Permissions: `POST /api/permissions/api`, `POST /api/permissions/content`, `POST /api/permissions/api/check`

## Project Structure

```
apiforge-cms/
  apps/
    auth/
    content/
    content-type/
    gateway/
    media/
    permission/
  libs/
    common/
  uploads/
```

## Notes

- Database configuration lives in `libs/common/src/database/database.config.ts`.
- CORS is enabled at the gateway.
