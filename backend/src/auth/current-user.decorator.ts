import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { REQUEST_USER_ID } from './constants';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const id = (request as Request & Record<string, string | undefined>)[
      REQUEST_USER_ID
    ];
    if (!id) {
      throw new Error('CurrentUserId used without JwtAuthGuard');
    }
    return id;
  },
);
