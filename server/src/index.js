import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import { query } from "./db.js";

const PORT = Number(process.env.PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET || "demo-secret-change-me";

async function seed() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  const hash = await bcrypt.hash("demo", 10);
  await query(
    `INSERT INTO users (username, password_hash)
     VALUES ('demo', $1)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [hash]
  );
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "No autenticado" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);
app.use(express.json());

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body || {};
  const result = await query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password || "", user.password_hash))) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "8h",
  });
  res.json({ token, user: { id: user.id, username: user.username } });
});

app.get("/api/me", auth, (req, res) => {
  res.json({ user: req.user });
});

await seed();
app.listen(PORT, "0.0.0.0", () => {
  console.log(`API en http://localhost:${PORT}`);
});
