/**
 * Central API client
 *
 * HOW REQUESTS ARE ROUTED:
 *
 * DEVELOPMENT (npm run dev):
 *   .env should have PUBLIC_API_URL= (empty)
 *   Requests go to /api/* → Vite proxies to http://localhost:4000
 *   This avoids CORS completely.
 *
 * PRODUCTION:
 *   .env should have PUBLIC_API_URL=https://api.yourdomain.com
 *   Requests go directly to that domain.
 *
 * WHY: If PUBLIC_API_URL is set to http://localhost:4000 in dev,
 * requests go directly to port 4000 from the browser (CORS error).
 * The proxy only works when the request goes to the SAME origin as the client.
 */

// In dev: empty string → requests go to same origin → Vite proxy forwards to :4000
// In prod: your API domain
function getBase(): string {
  if (typeof import.meta === 'undefined') return '';
  const url = import.meta.env?.PUBLIC_API_URL;
  // Only use if it's a real external URL (starts with http)
  return url && url.startsWith('http') ? url : '';
}

const BASE = getBase();

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const url = `${BASE}${path}`;

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    throw new ApiError(`Network error — is the server running on port 4000?`, 0);
  }

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      errMsg = data.error || data.message || errMsg;
    } catch {}
    throw new ApiError(errMsg, res.status);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export const api = {
  get:    <T>(path: string)                 => request<T>(path),
  post:   <T>(path: string, body?: unknown) => request<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  }),
  put:    <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string)                 => request<T>(path, { method: 'DELETE' }),
};

export default api;
