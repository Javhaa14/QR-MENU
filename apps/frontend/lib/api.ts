const FALLBACK_API_URL = "http://localhost:3001";

export const clientApiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? FALLBACK_API_URL;

export const serverApiUrl =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  FALLBACK_API_URL;

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: RequestInit["body"] | object | unknown[];
  token?: string | null;
};

async function parseApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const data = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(data.message)) {
        message = data.message.join(", ");
      } else if (data.message) {
        message = data.message;
      }
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }

    throw new Error(message);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return undefined as T;
}

export async function apiFetch<T>(
  path: string,
  { token, headers, body, ...init }: ApiFetchOptions = {},
) {
  const nextHeaders = new Headers(headers);

  if (token) {
    nextHeaders.set("Authorization", `Bearer ${token}`);
  }

  const requestBody =
    body instanceof FormData || body === undefined
      ? body
      : typeof body === "string"
        ? body
        : JSON.stringify(body);

  if (!(body instanceof FormData) && body !== undefined && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(`${clientApiUrl}${path}`, {
    ...init,
    headers: nextHeaders,
    body: requestBody,
  });

  return parseApiResponse<T>(response);
}

type ServerFetchOptions = RequestInit & {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

export async function serverApiFetch<T>(path: string, init?: ServerFetchOptions) {
  const response = await fetch(`${serverApiUrl}${path}`, init);
  return parseApiResponse<T>(response);
}
