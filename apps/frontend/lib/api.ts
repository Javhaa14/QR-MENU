
export const clientApiUrl =
  process.env.NEXT_PUBLIC_API_URL 

export const serverApiUrl =
  process.env.NEXT_PUBLIC_API_URL 

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: RequestInit["body"] | object | unknown[];
  token?: string | null;
};

async function parseApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const rawBody = await response.text();
  const hasJsonBody =
    contentType.includes("application/json") ||
    rawBody.trim().startsWith("{") ||
    rawBody.trim().startsWith("[");

  const parsedBody = (() => {
    if (!rawBody || !hasJsonBody) {
      return null;
    }

    try {
      return JSON.parse(rawBody) as T | { message?: string | string[] };
    } catch {
      return null;
    }
  })();

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    if (parsedBody && typeof parsedBody === "object" && "message" in parsedBody) {
      const data = parsedBody as { message?: string | string[] };
      if (Array.isArray(data.message)) {
        message = data.message.join(", ");
      } else if (data.message) {
        message = data.message;
      }
    } else if (rawBody) {
      message = rawBody;
    }

    throw new Error(message);
  }

  if (parsedBody !== null) {
    return parsedBody as T;
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

  const baseUrl = clientApiUrl?.replace(/\/$/, "") ?? "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`${baseUrl}${cleanPath}`, {
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
  const baseUrl = serverApiUrl?.replace(/\/$/, "") ?? "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`${baseUrl}${cleanPath}`, init);
  return parseApiResponse<T>(response);
}
