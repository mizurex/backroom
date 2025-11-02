import { useState } from "react"
import { useNavigate } from "react-router-dom"

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5000"

async function postJson<T>(path: string, body: unknown): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	})
	if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`)
	return res.json()
}

export default function AuthPage() {
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	async function handleRegister() {
		try {
			setLoading(true)
			const data = await postJson<{ token: string; user: { username: string } }>("/api/auth/register", { username, password })
			localStorage.setItem("token", data.token)
			localStorage.setItem("username", username)
			navigate("/chat")
		} catch {
			alert("Failed to register")
		} finally {
			setLoading(false)
		}
	}

	async function handleLogin() {
		try {
			setLoading(true)
			const data = await postJson<{ token: string; user: { username: string } }>("/api/auth/login", { username, password })
			localStorage.setItem("token", data.token)
			localStorage.setItem("username", username)
			navigate("/chat")
		} catch {
			alert("Failed to login")
		} finally {
			setLoading(false)
		}
	}

	return (
		<div style={{ maxWidth: 420, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
			<h2 style={{ marginTop: 0, marginBottom: 12 }}>Welcome to Cozy</h2>
			<p style={{ marginTop: 0, color: "#666" }}>Create an account or sign in to start chatting.</p>

			<div style={{ display: "grid", gap: 8, marginTop: 12 }}>
				<input placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
				<input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
				<div style={{ display: "flex", gap: 8 }}>
					<button onClick={handleRegister} disabled={!username || !password || loading}>Register</button>
					<button onClick={handleLogin} disabled={!username || !password || loading}>Login</button>
				</div>
			</div>
		</div>
	)
}