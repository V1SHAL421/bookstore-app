const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080/api/v1";
let accessToken: string | null = null;
let user: { id: string; email: string; full_name: string; role: string } | null = null;
let refreshPromise: Promise<boolean> | null = null;

function clearAuth() {
  accessToken = null;
  user = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

function getAccessToken() {
  return accessToken;
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

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      clearAuth();
      return false;
    }

    const text = await res.text();
    const payload = text ? JSON.parse(text) : null;
    if (payload?.access_token) {
      setAccessToken(payload.access_token);
    }
    if (payload?.user) {
      setUser(payload.user);
    }
    return Boolean(payload?.access_token);
  } catch (err) {
    console.error("Failed to refresh token:", err);
    clearAuth();
    return false;
  }
}

export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const isAuthEndpoint =
    endpoint.startsWith("/users/login") ||
    endpoint.startsWith("/users/signup") ||
    endpoint.startsWith("/users/refresh");

  if (!isAuthEndpoint && typeof window !== "undefined" && !accessToken) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken();
    }
    await refreshPromise;
    refreshPromise = null;
  }

  const headers = new Headers(options?.headers || {});

  headers.set("Content-Type", "application/json");
  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const canRefresh =
    (res.status === 401 || (res.status === 403 && !token)) &&
    !endpoint.startsWith("/users/login") &&
    !endpoint.startsWith("/users/signup") &&
    !endpoint.startsWith("/users/refresh");

  if (canRefresh) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retryHeaders = new Headers(options?.headers || {});
      retryHeaders.set("Content-Type", "application/json");
      if (accessToken) {
        retryHeaders.set("Authorization", `Bearer ${accessToken}`);
      }
      const retryRes = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: retryHeaders,
        credentials: "include",
      });
      if (retryRes.status === 401) {
        clearAuth();
      }
      return retryRes;
    }
    clearAuth();
  } else if (res.status === 401 && !isAuthEndpoint) {
    clearAuth();
  }

  return res;
}


export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, payload: unknown, message = "API request failed") {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export async function postJSON<TResponse, TBody>(url: string, body: TBody): Promise<TResponse> {
  const res = await apiFetch(url, {
    method: "POST",
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const payload = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, payload, `API request failed with status ${res.status}`);
  }

  return payload as TResponse;
}

export async function getJSON<TResponse>(url: string): Promise<TResponse> {
  const res = await apiFetch(url);

  const text = await res.text();
  const payload = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, payload, `API request failed with status ${res.status}`);
  }

  return payload as TResponse;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/users/logout", { method: "POST" });
  } catch (err) {
    console.error("Logout failed:", err);
  }
  clearAuth();
  if (typeof window !== "undefined") {
    window.location.href = "/auth";
  }
}
