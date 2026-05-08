import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

type SessionExpiredHandler = () => boolean;

let sessionExpiredHandler: SessionExpiredHandler | null = null;
let sessionExpiredNotified = false;

const ignoredSessionEndpoints = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/resend-verification',
  '/auth/google',
];

function shouldHandleSessionExpiry(url?: string): boolean {
  if (!url) return true;
  return !ignoredSessionEndpoints.some((endpoint) => url.includes(endpoint));
}

export function setSessionExpiredHandler(
  handler: SessionExpiredHandler | null,
): void {
  sessionExpiredHandler = handler;
}

export function resetSessionExpiredNotification(): void {
  sessionExpiredNotified = false;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url;
      if (!sessionExpiredNotified && shouldHandleSessionExpiry(requestUrl)) {
        const handled = sessionExpiredHandler?.() ?? false;
        if (handled) {
          sessionExpiredNotified = true;
        }
      }
    }
    return Promise.reject(error);
  },
);
