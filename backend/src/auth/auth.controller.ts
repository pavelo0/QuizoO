import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PublicUser } from '../users/user-public.select';
import { AuthService } from './auth.service';
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
    @Body() body: { email: string; code: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    return this.auth.verifyEmailAndSignIn(body.email, body.code, res);
  }

  @Public()
  @Post('login')
  login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublicUser> {
    return this.auth.login(body.email, body.password, res);
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
}
