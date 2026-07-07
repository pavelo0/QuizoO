import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes, randomInt } from 'crypto';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { PublicUser, userPublicSelect } from '../users/user-public.select';
import { ACCESS_TOKEN_COOKIE, OAUTH_STATE_COOKIE } from './constants';
import { VerificationCodeDeliveryService } from './verification-code-delivery.service';

const BCRYPT_ROUNDS = 10;
const CODE_TTL_MS = 15 * 60 * 1000;
const REMEMBER_ME_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_TOKEN_TTL_SECONDS = 12 * 60 * 60;
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const GOOGLE_PROVIDER = 'google';
const MIN_PASSWORD_LEN = 8;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly codes: VerificationCodeDeliveryService,
    private readonly config: ConfigService,
  ) {}

  beginGoogleAuth(res: Response): string {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      throw new BadRequestException('Google OAuth is not configured');
    }

    const state = randomBytes(24).toString('hex');
    const secure = process.env.NODE_ENV === 'production';
    res.cookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: OAUTH_STATE_TTL_MS,
      path: '/',
    });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: this.getGoogleRedirectUri(),
      response_type: 'code',
      scope: 'openid email profile',
      state,
      include_granted_scopes: 'true',
      prompt: 'select_account',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  getGoogleCallbackRedirect(errorCode?: string): string {
    const base = this.getFrontendUrl();
    const params = new URLSearchParams();
    if (errorCode) {
      params.set('oauthError', errorCode);
    }
    const query = params.toString();
    return `${base}/auth/oauth/callback${query ? `?${query}` : ''}`;
  }

  async handleGoogleCallback(
    codeRaw: string,
    stateRaw: string,
    stateCookieValue: string | undefined,
    res: Response,
  ): Promise<PublicUser> {
    const code = codeRaw.trim();
    const state = stateRaw.trim();
    if (!code || !state) {
      throw new UnauthorizedException('Invalid OAuth callback');
    }

    const storedState = stateCookieValue?.trim();
    this.clearOAuthStateCookie(res);
    if (!storedState || storedState !== state) {
      throw new UnauthorizedException('Invalid OAuth state');
    }

    const tokenPayload = await this.exchangeGoogleCode(code);
    const profile = await this.fetchGoogleProfile(tokenPayload.access_token);

    if (!profile.email || !profile.sub) {
      throw new UnauthorizedException(
        'Google account is missing required data',
      );
    }

    const email = profile.email.trim().toLowerCase();
    let user = await this.prisma.user.findFirst({
      where: {
        oauthProvider: GOOGLE_PROVIDER,
        oauthId: profile.sub,
      },
    });

    if (!user) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingByEmail) {
        if (
          existingByEmail.oauthProvider &&
          existingByEmail.oauthProvider !== GOOGLE_PROVIDER
        ) {
          throw new ConflictException(
            'This email is already linked to another sign-in provider',
          );
        }

        user = await this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            oauthProvider: GOOGLE_PROVIDER,
            oauthId: profile.sub,
            emailVerified: true,
            username:
              existingByEmail.username ??
              this.normalizeOAuthUsername(profile.name),
          },
        });
      } else {
        const randomPassword = randomBytes(48).toString('base64url');
        const passwordHash = await bcrypt.hash(randomPassword, BCRYPT_ROUNDS);
        user = await this.prisma.user.create({
          data: {
            email,
            passwordHash,
            username: this.normalizeOAuthUsername(profile.name),
            role: UserRole.USER,
            emailVerified: profile.email_verified ?? true,
            oauthProvider: GOOGLE_PROVIDER,
            oauthId: profile.sub,
          },
        });
      }
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Your account is blocked');
    }

    await this.setAuthCookie(user.id, res, { rememberMe: true });
    const safe = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: userPublicSelect,
    });
    if (!safe) {
      throw new NotFoundException('User not found');
    }
    return safe;
  }

  async register(input: {
    email: string;
    password: string;
    username?: string | null;
  }): Promise<{ message: string }> {
    const email = input.email.trim().toLowerCase();
    this.assertPassword(input.password);

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const code = this.generateSixDigitCode();
    const expires = new Date(Date.now() + CODE_TTL_MS);

    await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        username: input.username?.trim() || null,
        role: UserRole.USER,
        emailVerified: false,
        emailVerificationCode: code,
        emailVerificationExpiresAt: expires,
      },
    });

    await this.codes.emailVerification(email, code);

    return {
      message: 'Verification code sent to your email address.',
    };
  }

  async verifyEmailAndSignIn(
    emailRaw: string,
    codeRaw: string,
    res: Response,
    rememberMe = true,
  ): Promise<PublicUser> {
    const email = emailRaw.trim().toLowerCase();
    const code = codeRaw.trim();
    if (!code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.isBlocked) {
      throw new UnauthorizedException('Invalid verification code');
    }
    if (user.emailVerified) {
      throw new ConflictException('Email is already verified');
    }
    if (
      !user.emailVerificationCode ||
      user.emailVerificationCode !== code ||
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpiresAt: null,
      },
      select: userPublicSelect,
    });

    await this.setAuthCookie(updated.id, res, { rememberMe });
    return updated;
  }

  async login(
    emailRaw: string,
    password: string,
    res: Response,
    rememberMe = true,
  ): Promise<PublicUser> {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.isBlocked) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.emailVerified) {
      throw new UnauthorizedException('Verify your email before signing in');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.setAuthCookie(user.id, res, { rememberMe });
    const safe = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: userPublicSelect,
    });
    if (!safe) {
      throw new NotFoundException('User not found');
    }
    return safe;
  }

  logout(res: Response): void {
    const secure = process.env.NODE_ENV === 'production';
    res.clearCookie(ACCESS_TOKEN_COOKIE, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
    });
  }

  async requestPasswordReset(emailRaw: string): Promise<{ message: string }> {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.isBlocked) {
      return {
        message: 'If an account exists for this email, a reset code was sent.',
      };
    }

    const code = this.generateSixDigitCode();
    const expires = new Date(Date.now() + CODE_TTL_MS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetCode: code,
        passwordResetExpiresAt: expires,
      },
    });

    await this.codes.passwordReset(email, code);

    return {
      message: 'If an account exists for this email, a reset code was sent.',
    };
  }

  async resetPassword(
    emailRaw: string,
    codeRaw: string,
    newPassword: string,
    res: Response,
  ): Promise<PublicUser> {
    const email = emailRaw.trim().toLowerCase();
    const code = codeRaw.trim();
    this.assertPassword(newPassword);

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (
      !user ||
      user.isBlocked ||
      !user.passwordResetCode ||
      user.passwordResetCode !== code ||
      !user.passwordResetExpiresAt ||
      user.passwordResetExpiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired reset code');
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetCode: null,
        passwordResetExpiresAt: null,
      },
      select: userPublicSelect,
    });

    await this.setAuthCookie(updated.id, res);
    return updated;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.isBlocked) {
      throw new UnauthorizedException('Invalid session');
    }
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    this.assertPassword(newPassword);
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: userPublicSelect,
    });
    return updated;
  }

  async changeEmail(
    userId: string,
    currentPassword: string,
    newEmailRaw: string,
  ): Promise<{ user: PublicUser; message: string }> {
    const newEmail = newEmailRaw.trim().toLowerCase();
    if (!newEmail || !newEmail.includes('@')) {
      throw new BadRequestException('Invalid email');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.isBlocked) {
      throw new UnauthorizedException('Invalid session');
    }
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Password is incorrect');
    }
    if (user.email === newEmail) {
      throw new BadRequestException('This is already your email');
    }

    const taken = await this.prisma.user.findUnique({
      where: { email: newEmail },
    });
    if (taken) {
      throw new ConflictException('This email is already in use');
    }

    const code = this.generateSixDigitCode();
    const expires = new Date(Date.now() + CODE_TTL_MS);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        emailVerified: false,
        emailVerificationCode: code,
        emailVerificationExpiresAt: expires,
      },
      select: userPublicSelect,
    });

    await this.codes.emailVerification(newEmail, code);

    return {
      user: updated,
      message:
        'Email updated. Confirm the new address with the code sent to your inbox.',
    };
  }

  async resendEmailVerification(
    emailRaw: string,
  ): Promise<{ message: string }> {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.isBlocked) {
      throw new UnauthorizedException('Invalid request');
    }
    if (user.emailVerified) {
      throw new ConflictException('Email is already verified');
    }

    const code = this.generateSixDigitCode();
    const expires = new Date(Date.now() + CODE_TTL_MS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCode: code,
        emailVerificationExpiresAt: expires,
      },
    });

    await this.codes.emailVerification(email, code);

    return {
      message: 'A new verification code was sent to your email.',
    };
  }

  private async setAuthCookie(
    userId: string,
    res: Response,
    options?: { rememberMe?: boolean },
  ): Promise<void> {
    const rememberMe = options?.rememberMe ?? true;
    const token = await this.jwt.signAsync(
      { sub: userId },
      { expiresIn: rememberMe ? '7d' : SESSION_TOKEN_TTL_SECONDS },
    );
    const secure = process.env.NODE_ENV === 'production';
    const cookieOptions: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'lax';
      path: string;
      maxAge?: number;
    } = {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
    };
    if (rememberMe) {
      cookieOptions.maxAge = REMEMBER_ME_TTL_MS;
    }
    res.cookie(ACCESS_TOKEN_COOKIE, token, cookieOptions);
  }

  private clearOAuthStateCookie(res: Response): void {
    const secure = process.env.NODE_ENV === 'production';
    res.clearCookie(OAUTH_STATE_COOKIE, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
    });
  }

  private async exchangeGoogleCode(code: string): Promise<{
    access_token: string;
  }> {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('Google OAuth is not configured');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: this.getGoogleRedirectUri(),
        grant_type: 'authorization_code',
      }),
    });
    if (!response.ok) {
      throw new UnauthorizedException(
        'Failed to exchange Google authorization',
      );
    }

    const payload = (await response.json()) as { access_token?: string };
    if (!payload.access_token) {
      throw new UnauthorizedException('Google token response is invalid');
    }
    return { access_token: payload.access_token };
  }

  private async fetchGoogleProfile(accessToken: string): Promise<{
    sub: string;
    email: string;
    name?: string;
    email_verified?: boolean;
  }> {
    const response = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    if (!response.ok) {
      throw new UnauthorizedException('Failed to fetch Google profile');
    }

    return (await response.json()) as {
      sub: string;
      email: string;
      name?: string;
      email_verified?: boolean;
    };
  }

  private getGoogleRedirectUri(): string {
    const explicit = this.config.get<string>('GOOGLE_REDIRECT_URI')?.trim();
    if (explicit) {
      return explicit;
    }
    return `${this.getFrontendUrl()}/api/auth/google/callback`;
  }

  private getFrontendUrl(): string {
    const explicit = this.config.get<string>('AUTH_FRONTEND_URL')?.trim();
    if (explicit) {
      return explicit.replace(/\/+$/, '');
    }
    const cors = this.config.get<string>('CORS_ORIGIN');
    const origins =
      cors
        ?.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean) ?? [];
    const fallback =
      origins.find((origin) => origin.startsWith('https://')) ??
      origins[0] ??
      'https://localhost';
    return fallback.replace(/\/+$/, '');
  }

  private normalizeOAuthUsername(name?: string): string {
    const fallback = `user_${randomInt(1000, 9999)}`;
    if (!name) {
      return fallback;
    }
    const cleaned = name.trim().slice(0, 100);
    return cleaned.length > 0 ? cleaned : fallback;
  }

  private generateSixDigitCode(): string {
    return String(randomInt(100_000, 1_000_000));
  }

  private assertPassword(password: string): void {
    if (!password || password.length < MIN_PASSWORD_LEN) {
      throw new BadRequestException(
        `Password must be at least ${MIN_PASSWORD_LEN} characters`,
      );
    }
  }
}
