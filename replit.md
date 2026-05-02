# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Artifacts

- **Wolfion** (`artifacts/wolfion`) — React + Vite mobile-friendly web app for the Wolfion socks brand. Includes Clerk-powered login/sign-up, local role selection for Admin vs Customer, customer product browsing/cart/simple checkout, and an admin management dashboard with Production, Sales, Inventory, Yarn, and Cost & Profit sections.
- **UniRab** (`artifacts/uniless`) — Expo (React Native) mobile-first social productivity app for university students. Fully on-device (AsyncStorage) — no server, no shared backend. Features: glassmorphism UI with light/dark/system themes, 5 tabs (Home feed with stories, academic Dashboard, Messages, Explore, Profile), posts with privacy controls, friend graph + requests, study rooms, skill exchange, and a local heuristic AI study assistant. Folder/slug stays `uniless` for stability; display title is "UniRab". Demo seed users (maya/jordan/sara/diego @unirab.app, password `demo`).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Clerk via Replit-managed auth setup for the Wolfion web app

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
