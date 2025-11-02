export async function postJson<T>(url: string, body?: unknown, auth?: string): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (auth) {
      headers.Authorization = `Bearer ${auth}`
    }
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) throw new Error((await res.json()).error || `HTTP ${res.status}`)
    return res.json()
  }