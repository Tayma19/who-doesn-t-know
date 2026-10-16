const API_URL = "http://localhost:3000";
export const USE_MOCKS = true;


export async function request<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(API_URL + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message ?? 'Request failed'
    );
  }

  return data as T;
}

export const mockDelay = <T>(value: T, ms = 300): Promise<T> =>
  new Promise((r) => setTimeout(() => r(value), ms));

export const mockError = (message: string, ms = 300): Promise<never> =>
  new Promise((_, rej) => setTimeout(() => rej(new Error(message)), ms));
