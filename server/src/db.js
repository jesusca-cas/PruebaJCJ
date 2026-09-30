import pg from "pg";

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/prueba_jcj",
});

export async function query(text, params) {
  return pool.query(text, params);
}
