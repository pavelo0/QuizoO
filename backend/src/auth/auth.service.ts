import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { PublicUser, userPublicSelect } from '../users/user-public.select';
import { ACCESS_TOKEN_COOKIE } from './constants';
import { VerificationCodeDeliveryService } from './verification-code-delivery.service';

const BCRYPT_ROUNDS = 10;
const CODE_TTL_MS = 15 * 60 * 1000;
const MIN_PASSWORD_LEN = 8;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly codes: VerificationCodeDeliveryService,
  ) {}

  async register(input: {
    email: string;
    password: string;
    username?: string | null;
  }): Promise<{ message: string; verificationCode?: string }> {
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

    this.codes.emailVerification(email, code);

    const verificationCode = this.codes.includeCodeInApiResponse()
      ? code
      : undefined;

    return {
      message: 'Check the server log for the verification code (lab mode).',
      ...(verificationCode !== undefined && { verificationCode }),
    };
  }

  async verifyEmailAndSignIn(
    emailRaw: string,
    codeRaw: string,
    res: Response,
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

    await this.setAuthCookie(updated.id, res);
    return updated;
  }

  async login(
    emailRaw: string,
    password: string,
    res: Response,
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

    await this.setAuthCookie(user.id, res);
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

  async requestPasswordReset(
    emailRaw: string,
  ): Promise<{ message: string; resetCode?: string }> {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.isBlocked) {
      return {
        message:
          'If an account exists for this email, a reset code was logged on the server.',
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

    this.codes.passwordReset(email, code);

    const resetCode = this.codes.includeCodeInApiResponse() ? code : undefined;

    return {
      message:
        'If an account exists for this email, a reset code was logged on the server.',
      ...(resetCode !== undefined && { resetCode }),
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
  ): Promise<{ user: PublicUser; message: string; verificationCode?: string }> {
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

    this.codes.emailVerification(newEmail, code);

    const verificationCode = this.codes.includeCodeInApiResponse()
      ? code
      : undefined;

    return {
      user: updated,
      message:
        'Email updated. Confirm the new address with the code sent to your inbox (see server log in lab mode).',
      ...(verificationCode !== undefined && { verificationCode }),
    };
  }

  async resendEmailVerification(
    emailRaw: string,
  ): Promise<{ message: string; verificationCode?: string }> {
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

    this.codes.emailVerification(email, code);

    const verificationCode = this.codes.includeCodeInApiResponse()
      ? code
      : undefined;

    return {
      message: 'A new verification code was generated (see server log).',
      ...(verificationCode !== undefined && { verificationCode }),
    };
  }

  private async setAuthCookie(userId: string, res: Response): Promise<void> {
    const token = await this.jwt.signAsync({ sub: userId });
    const secure = process.env.NODE_ENV === 'production';
    res.cookie(ACCESS_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
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
