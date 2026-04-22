import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  IS_PUBLIC_KEY,
  REQUEST_USER_ID,
} from './constants';

type JwtPayload = { sub: string };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing session cookie');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      const sub = payload.sub;
      if (!sub) {
        throw new UnauthorizedException('Invalid token');
      }
      (request as Request & { [REQUEST_USER_ID]: string })[REQUEST_USER_ID] =
        sub;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }

  private extractToken(request: Request): string | null {
    const cookies = request.cookies as Record<string, unknown> | undefined;
    const raw = cookies?.[ACCESS_TOKEN_COOKIE];
    if (typeof raw !== 'string' || !raw.trim()) {
      return null;
    }
    return raw.trim();
  }
}
