import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PublicUser } from '../users/user-public.select';
import { AuthService } from './auth.service';
import { OAUTH_STATE_COOKIE } from './constants';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  register(
    @Body()
    body: {
      email: string;
      password: string;
      username?: string;
    },
  ): Promise<{ message: string; verificationCode?: string }> {
    return this.auth.register(body);
  }

  @Public()
  @Post('verify-email')
  verifyEmail(
    @Body() body: { email: string; code: string; rememberMe?: boolean },
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    return this.auth.verifyEmailAndSignIn(
      body.email,
      body.code,
      res,
      body.rememberMe === true,
    );
  }

  @Public()
  @Post('login')
  login(
    @Body() body: { email: string; password: string; rememberMe?: boolean },
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    return this.auth.login(
      body.email,
      body.password,
      res,
      body.rememberMe === true,
    );
  }

  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response): { ok: true } {
    this.auth.logout(res);
    return { ok: true };
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(
    @Body() body: { email: string },
  ): Promise<{ message: string; resetCode?: string }> {
    return this.auth.requestPasswordReset(body.email);
  }

  @Public()
  @Post('reset-password')
  resetPassword(
    @Body() body: { email: string; code: string; newPassword: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    return this.auth.resetPassword(
      body.email,
      body.code,
      body.newPassword,
      res,
    );
  }

  @Public()
  @Post('resend-verification')
  resendVerification(
    @Body() body: { email: string },
  ): Promise<{ message: string; verificationCode?: string }> {
    return this.auth.resendEmailVerification(body.email);
  }

  @Public()
  @Get('google')
  googleAuth(@Res() res: Response): void {
    const redirectUrl = this.auth.beginGoogleAuth(res);
    res.redirect(redirectUrl);
  }

  @Public()
  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    if (!code || !state) {
      res.redirect(this.auth.getGoogleCallbackRedirect('missing_code'));
      return;
    }

    try {
      const rawCookies = (req as { cookies?: unknown }).cookies;
      const cookies =
        typeof rawCookies === 'object' && rawCookies !== null
          ? (rawCookies as Record<string, unknown>)
          : undefined;
      const stateCookie = cookies?.[OAUTH_STATE_COOKIE];
      await this.auth.handleGoogleCallback(
        code,
        state,
        typeof stateCookie === 'string' ? stateCookie : undefined,
        res,
      );
      res.redirect(this.auth.getGoogleCallbackRedirect());
    } catch {
      res.redirect(this.auth.getGoogleCallbackRedirect('google_auth_failed'));
    }
  }
}
