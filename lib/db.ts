import { PrismaClient } from "@prisma/client";
import Database from "better-sqlite3";

declare global {
  // eslint-disable-next-line no-var
  var _db: ReturnType<typeof createDb> | undefined;
}

function createDb() {
  return new Database(process.cwd() + "/dev.db");
}

const db = global._db ?? createDb();
if (process.env.NODE_ENV !== "production") global._db = db;

export { db };

// Keep Prisma for type generation reference (not used at runtime yet)
export type { PrismaClient };
