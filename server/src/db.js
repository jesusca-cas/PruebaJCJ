import pg from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/prueba_jcj";

const needsSsl =
  process.env.PGSSLMODE === "require" ||
  /sslmode=require/i.test(connectionString) ||
  /railway/i.test(connectionString);

export const pool = new pg.Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function waitForDb() {
  for (let i = 0; i < 20; i++) {
    try {
      await query("SELECT 1");
      return;
    } catch (err) {
      console.error("PostgreSQL no lista:", err.message);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error("No se pudo conectar a PostgreSQL");
}
