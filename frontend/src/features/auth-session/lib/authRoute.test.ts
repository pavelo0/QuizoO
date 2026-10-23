import { describe, expect, it } from 'vitest';
import { getHomeRouteByRole, getHomeRouteForUser } from './authRoute';

describe('getHomeRouteByRole', () => {
  it('ведёт админа в панель, остальных в кабинет', () => {
    expect(getHomeRouteByRole('ADMIN')).toBe('/app/admin');
    expect(getHomeRouteByRole('USER')).toBe('/app');
    expect(getHomeRouteByRole(null)).toBe('/app');
    expect(getHomeRouteForUser(undefined)).toBe('/app');
    expect(getHomeRouteForUser({ role: 'ADMIN' })).toBe('/app/admin');
  });
});
