import { useEffect, useState } from "react";

export default function App() {
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("token"));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Error al iniciar sesión");
      return;
    }
    localStorage.setItem("token", data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  if (user) {
    return (
      <div className="card">
        <h1>Esta proyecto es una prueba de JCJ</h1>
        <p>Sesión de {user.username}.</p>
        <button onClick={logout}>Cerrar sesión</button>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <h1>Iniciar sesión</h1>
      <p className="hint">Usuario demo / demo</p>
      {error && <p className="error">{error}</p>}
      <label htmlFor="username">Usuario</label>
      <input
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
      />
      <label htmlFor="password">Contraseña</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      <button type="submit">Entrar</button>
    </form>
  );
}
