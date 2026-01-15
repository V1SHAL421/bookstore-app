const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080/api/v1";
let accessToken: string | null = null;
let user: { id: string; email: string; full_name: string; role: string } | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function setUser(userData: { id: string; email: string; full_name: string; role: string } | null) {
  user = userData;
  if (typeof window !== 'undefined') {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  }
}

export function getUser() {
  if (user) return user;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user');
    if (stored) {
      user = JSON.parse(stored);
      return user;
    }
  }
  return null;
}

export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {

  const headers = new Headers(options?.headers || {});

  headers.set("Content-Type", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  return res;
}


export async function postJSON<TResponse, TBody>(url: string, body: TBody): Promise<TResponse> {
  const res = await apiFetch(url, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const payload = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(`API request failed with status ${res.status} and payload ${payload}`);
  }

  return payload as TResponse;
}

export async function getJSON<TResponse>(url: string): Promise<TResponse> {
  const res = await apiFetch(url);

  const text = await res.text();
  const payload = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(`API request failed with status ${res.status} and payload ${payload}`);
  }

  return payload as TResponse;
}
