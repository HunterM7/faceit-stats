const rawBaseUrl = (import.meta.env.VITE_SERVER_URL || 'http://localhost:3333').trim();

export const apiBaseUrl = rawBaseUrl.replace(/\/+$/, '');

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}
