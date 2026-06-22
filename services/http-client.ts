export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export async function fetchWithSession(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const request = () => fetch(input, { ...init, credentials: "same-origin" });
  let response = await request();

  if (response.status === 401) {
    const refreshed = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
    });
    if (refreshed.ok) response = await request();
  }

  return response;
}

export async function httpClient<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetchWithSession(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => undefined);
    throw new HttpError(response.statusText, response.status, body);
  }

  return response.json() as Promise<T>;
}
