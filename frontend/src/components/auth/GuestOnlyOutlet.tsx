import type { ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import { RedirectIfSignedIn } from '@/components/auth/RedirectIfSignedIn';

/**
 * Дочерние маршруты только для гостя (логин / регистрация).
 * Сброс пароля вынесен сюда нарочно — им могут пользоваться и залогиненные.
 */
export function GuestOnlyOutlet(): ReactElement {
  return (
    <RedirectIfSignedIn>
      <Outlet />
    </RedirectIfSignedIn>
  );
}
