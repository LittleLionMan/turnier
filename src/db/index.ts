import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Database = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as typeof globalThis & { __db?: Database };

function createDb(): Database {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
  return drizzle(pool, { schema });
}

export const db: Database = globalForDb.__db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__db = db;
}
