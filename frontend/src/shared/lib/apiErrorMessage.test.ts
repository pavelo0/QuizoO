import axios, { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { apiErrorMessage, apiErrorText } from './apiErrorMessage';
import { tStub } from '@/shared/test/tStub';

function axiosError(message: string | string[]): AxiosError {
  const error = new AxiosError('request failed');
  error.response = {
    data: { message },
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe('apiErrorMessage', () => {
  it('читает строку и массив из ответа Nest', () => {
    expect(apiErrorMessage(axiosError('Invalid email or password'))).toBe(
      'Invalid email or password',
    );
    expect(apiErrorMessage(axiosError(['one', 'two']))).toBe('one, two');
    expect(apiErrorMessage(new Error('boom'))).toBe('boom');
    expect(apiErrorMessage('nope')).toBe('Something went wrong');
    expect(axios.isAxiosError(axiosError('x'))).toBe(true);
  });

  it('переводит известный текст', () => {
    expect(apiErrorText(new Error('Something went wrong'), tStub)).toBe(
      'errors.generic',
    );
    expect(apiErrorText(axiosError('Module not found'), tStub)).toBe(
      'Module not found',
    );
  });
});
