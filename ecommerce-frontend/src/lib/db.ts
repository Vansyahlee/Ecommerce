import { Pool } from "pg";

const globalForPool = globalThis as unknown as { pool: Pool | undefined };

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  return new Pool({ connectionString, max: 10 });
}

export const pool = globalForPool.pool ?? createPool();

if (process.env.NODE_ENV !== "production") globalForPool.pool = pool;
