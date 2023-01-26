import { Bindings } from "hono/dist/types/types";

export function getTodosDb(env: Bindings): D1Database {
  const db = env["D1_TODOS_DB"] as D1Database | undefined;
  if (!db) {
    throw new Error("No binding found for the D1_TODOS_DB database");
  }

  return db;
}
