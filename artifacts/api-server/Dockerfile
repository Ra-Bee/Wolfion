# ─────────────────────────────────────────────────────────────────
# Wolfion API server — production Docker image for Render / Railway / Fly
# ─────────────────────────────────────────────────────────────────
# Two-stage build: first install + bundle with esbuild, then run a slim
# runtime image. We build from the monorepo root so workspace links
# resolve correctly.
#
# Build context MUST be the repo root, not artifacts/api-server.
# On Render: dockerfilePath = artifacts/api-server/Dockerfile,
# dockerContext = "." (already set in render.yaml).
# ─────────────────────────────────────────────────────────────────

FROM node:24-alpine AS build
WORKDIR /repo

# Enable corepack so the `pnpm` version pinned in package.json is used.
RUN corepack enable

# Copy lockfile + workspace manifest + root configs first so layer
# caching survives source edits.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY tsconfig.base.json tsconfig.json ./

# Strip the root `preinstall` lifecycle script. Locally it guards
# against `npm install`, but inside Docker it fires under busybox sh
# and trips up corepack's pnpm wrapper. Removing it does NOT touch
# dependency resolution (lockfile is the source of truth) and is
# only applied inside this build stage.
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json'));delete p.preinstall;if(p.scripts)delete p.scripts.preinstall;fs.writeFileSync('package.json',JSON.stringify(p,null,2));"

# pnpm --frozen-lockfile validates EVERY workspace package's
# package.json against the lockfile, so we must copy them all even
# though we only build the api-server. The files are tiny.
COPY artifacts/api-server/package.json     artifacts/api-server/package.json
COPY artifacts/wolfion/package.json        artifacts/wolfion/package.json
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/package.json
COPY artifacts/uniless/package.json        artifacts/uniless/package.json
COPY scripts/package.json                  scripts/package.json
COPY lib/api-spec/package.json             lib/api-spec/package.json
COPY lib/api-client-react/package.json     lib/api-client-react/package.json
COPY lib/api-zod/package.json              lib/api-zod/package.json
COPY lib/db/package.json                   lib/db/package.json
COPY lib/integrations-openai-ai-react/package.json  lib/integrations-openai-ai-react/package.json
COPY lib/integrations-openai-ai-server/package.json lib/integrations-openai-ai-server/package.json

# Install ONLY the api-server and its transitive workspace deps.
# `--filter "@workspace/api-server..."` (note the trailing `...`)
# includes the package and everything it depends on, skipping the
# heavy frontend deps (wolfion, mockup-sandbox, uniless/expo).
# `--ignore-scripts` skips postinstall hooks (e.g. native compilation)
# that aren't needed for our esbuild bundle.
RUN pnpm install --frozen-lockfile --ignore-scripts \
      --filter "@workspace/api-server..."

# Now copy the api-server source + any libs it actually imports.
COPY lib lib
COPY artifacts/api-server artifacts/api-server

# Invoke esbuild directly via node. Going through `pnpm run build`
# makes pnpm 11 re-validate the workspace and fail on
# ERR_PNPM_IGNORED_BUILDS (core-js). The bundler doesn't care about
# any of that — it just needs node_modules to be in place.
RUN cd artifacts/api-server && node ./build.mjs

# ─────────────────────────────────────────────────────────────────
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy ONLY the built bundle. The bundle is self-contained except for
# the `external` packages declared in build.mjs.
COPY --from=build /repo/artifacts/api-server/dist ./dist

# Write a fresh, minimal package.json (do NOT copy the workspace
# package.json — it contains "workspace:*" deps that npm can't parse).
# Then install only the runtime externals from build.mjs.
RUN echo '{"name":"wolfion-api-runtime","private":true,"type":"module"}' > package.json \
 && npm install --omit=dev --no-package-lock --ignore-scripts \
      firebase-admin@^13 pdf-parse@^2 pino@^9 pino-pretty@^13

ENV PORT=8080
EXPOSE 8080

CMD ["node", "--enable-source-maps", "dist/index.mjs"]
