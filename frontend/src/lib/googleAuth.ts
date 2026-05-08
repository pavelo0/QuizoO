const apiBase = import.meta.env.VITE_API_URL || '/api';

function normalizeApiBase(baseUrl: string): string {
  if (/^https?:\/\//i.test(baseUrl)) {
    return baseUrl.replace(/\/+$/, '');
  }
  if (baseUrl.startsWith('/')) {
    return `${window.location.origin}${baseUrl}`.replace(/\/+$/, '');
  }
  return `${window.location.origin}/${baseUrl}`.replace(/\/+$/, '');
}

export function getGoogleAuthStartUrl(): string {
  return `${normalizeApiBase(apiBase)}/auth/google`;
}
