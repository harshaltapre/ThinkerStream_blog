export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function getAuthHeaders(): HeadersInit {
  const sessionId = localStorage.getItem("sessionId");
  return sessionId ? { Authorization: `Bearer ${sessionId}` } : {};
}

export function createAuthorizedRequest(method: string, url: string, data?: unknown) {
  return fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}
