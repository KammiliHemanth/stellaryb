const API_BASE = import.meta.env.VITE_API_URL || '';

export function getApiUrl(path: string): string {
  if (!API_BASE) return '';
  return `${API_BASE}${path}`;
}

export function isApiConfigured(): boolean {
  return !!API_BASE;
}
