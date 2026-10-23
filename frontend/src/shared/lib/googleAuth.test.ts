import { describe, expect, it } from 'vitest';
import { getGoogleAuthStartUrl } from './googleAuth';

describe('getGoogleAuthStartUrl', () => {
  it('собирает адрес старта OAuth от текущего origin', () => {
    expect(getGoogleAuthStartUrl()).toBe(
      `${window.location.origin}/api/auth/google`,
    );
  });
});
