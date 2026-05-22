import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Lazy: do not throw or open a pool at import time. This lets servers
// that don't actually use Postgres (e.g. Wolfion API after the
// Firebase migration) boot without DATABASE_URL set.
let _pool: pg.Pool | null = null;
let _db: NodePgDatabase<typeof schema> | null = null;

function ensure(): { pool: pg.Pool; db: NodePgDatabase<typeof schema> } {
  if (_pool && _db) return { pool: _pool, db: _db };
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set to use the database.",
    );
  }
  _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  _db = drizzle(_pool, { schema });
  return { pool: _pool, db: _db };
}

export const pool = new Proxy({} as pg.Pool, {
  get(_t, prop) {
    const p = ensure().pool as unknown as Record<string | symbol, unknown>;
    const v = p[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(p) : v;
  },
});

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_t, prop) {
    const d = ensure().db as unknown as Record<string | symbol, unknown>;
    const v = d[prop];
    return typeof v === "function" ? (v as (...a: unknown[]) => unknown).bind(d) : v;
  },
});

export * from "./schema";
