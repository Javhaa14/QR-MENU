FROM node:20-alpine AS builder

RUN corepack enable
WORKDIR /app

COPY . .

RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @qr-menu/shared-types build
RUN pnpm --filter @qr-menu/backend build

FROM node:20-alpine AS runner

RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/tsconfig.base.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend ./apps/backend
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/backend
EXPOSE 3001

CMD ["pnpm", "start"]
