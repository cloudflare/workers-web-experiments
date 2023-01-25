export function getTodosDb(): D1Database {
  const db = (process.env as { D1_TODOS_DB?: D1Database }).D1_TODOS_DB;
  if (!db) {
    throw new Error("No binding found for the D1_TODOS_DB database");
  }

  return db;
}
