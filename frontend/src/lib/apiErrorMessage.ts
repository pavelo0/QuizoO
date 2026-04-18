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
