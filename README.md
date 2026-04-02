# QR Menu

Multi-tenant QR menu SaaS built as a `pnpm` monorepo with:

- `apps/frontend`: Next.js 14 App Router customer menu and admin panel
- `apps/backend`: NestJS REST + WebSocket API with MongoDB
- `packages/shared-types`: shared TypeScript contracts

## Stack

- Next.js 14
- NestJS
- MongoDB + Mongoose
- Socket.IO
- Tailwind CSS

## Prerequisites

- Node.js 20+
- `pnpm`
- Docker / Docker Compose

## Quickstart

1. Copy `.env.example` to `.env` and fill in real secrets and `CLOUDINARY_URL`.
2. Install dependencies:

```bash
pnpm install
```

3. Start the stack:

```bash
docker-compose up --build
```

4. Open:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

## Local app commands

```bash
pnpm dev
pnpm build
pnpm typecheck
```

## Monorepo layout

- `apps/frontend`
- `apps/backend`
- `packages/shared-types`

## Core flows included

- Tenant registration and JWT login
- Restaurant profile and theme updates
- Menu/category/item CRUD
- Public QR menu rendering
- Cart and public order placement
- Live order board over Socket.IO
- QR generation and Cloudinary image upload
