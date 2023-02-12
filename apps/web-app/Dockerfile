FROM node:18-alpine AS pruner
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY . .
# install the root to ensure turbo is present
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --filter "@hasura-remix-boilerplate/monorepo"
RUN pnpm turbo prune --scope=@hasura-remix-boilerplate/web-app --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:18-alpine AS installer
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# First install the dependencies (as they change less often)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --filter "@hasura-remix-boilerplate/web-app..." --filter "@hasura-remix-boilerplate/monorepo"

FROM node:18-alpine AS production-dependencies
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=installer /app/ .

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm prune --prod

# Build the project
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm run --filter=@hasura-remix-boilerplate/web-app build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat
RUN apk update
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=production-dependencies /app .
COPY --from=builder /app/apps/web-app/remix.config.js ./apps/web-app/remix.config.js
COPY --from=builder /app/apps/web-app/build/ ./apps/web-app/build

CMD pnpm run --filter="@hasura-remix-boilerplate/web-app" start