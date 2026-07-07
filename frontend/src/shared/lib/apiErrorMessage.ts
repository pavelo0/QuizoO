import axios from 'axios';

/**
 * Сообщение об ошибке из ответа Nest (поле `message`: string | string[]).
 */
export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as {
      message?: string | string[];
    };
    if (typeof data.message === 'string') {
      return data.message;
    }
    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
}

const KNOWN_ERROR_KEYS: Record<string, string> = {
  'Something went wrong': 'errors.generic',
  'Invalid display name': 'errors.invalidDisplayName',
};

export function apiErrorKey(error: unknown): string | null {
  const message = apiErrorMessage(error);
  return KNOWN_ERROR_KEYS[message] ?? null;
}

export function apiErrorText(
  error: unknown,
  t: (key: string, vars?: Record<string, string | number>) => string,
): string {
  const key = apiErrorKey(error);
  if (key) return t(key);
  const message = apiErrorMessage(error);
  if (!message || message === 'Something went wrong') {
    return t('errors.generic');
  }
  return message;
}
