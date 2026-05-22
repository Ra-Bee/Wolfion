# ─────────────────────────────────────────────────────────────────
# Wolfion API server — production Docker image for Render / Railway / Fly
# ─────────────────────────────────────────────────────────────────
# Two-stage build: first install + bundle with esbuild, then run a slim
# runtime image. We build from the monorepo root so workspace links
# resolve correctly.
#
# Build context MUST be the repo root, not artifacts/api-server.
# On Render: set "Docker Build Context Directory" to "." and
# "Dockerfile Path" to "artifacts/api-server/Dockerfile".
# ─────────────────────────────────────────────────────────────────

FROM node:24-alpine AS build
WORKDIR /repo

# Enable corepack so the `pnpm` version pinned in package.json is used.
RUN corepack enable

# Copy lockfile + workspace manifest first for better layer caching.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY tsconfig.base.json tsconfig.json ./
# Copy every package.json so pnpm can resolve the workspace graph.
COPY artifacts/api-server/package.json artifacts/api-server/
COPY lib lib
COPY scripts scripts

# Install ALL deps (we'll prune below). Frozen lockfile = reproducible.
RUN pnpm install --frozen-lockfile

# Now copy the api-server source and build.
COPY artifacts/api-server artifacts/api-server
RUN pnpm --filter @workspace/api-server run build

# ─────────────────────────────────────────────────────────────────
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy ONLY the built bundle. The bundle is self-contained except for the
# `external` packages declared in build.mjs, which we install fresh.
COPY --from=build /repo/artifacts/api-server/dist ./dist
COPY --from=build /repo/artifacts/api-server/package.json ./package.json

# Install only runtime deps that esbuild left external (firebase-admin,
# pdf-parse, etc.). We use npm here to avoid pulling the whole pnpm
# workspace into the runtime image.
RUN npm install --omit=dev --no-package-lock --ignore-scripts \
      firebase-admin pdf-parse pino pino-pretty

# Render assigns $PORT dynamically; we honor it.
ENV PORT=8080
EXPOSE 8080

CMD ["node", "--enable-source-maps", "dist/index.mjs"]
