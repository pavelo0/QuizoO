import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from './constants';

/** Маршрут без JWT (health, регистрация, логин и т.п.) */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
