import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Лабораторная «доставка» кодов без внешнего SMTP: лог в консоль сервера.
 * Опционально тот же код возвращается в JSON, если включён AUTH_RETURN_VERIFICATION_CODE.
 */
@Injectable()
export class VerificationCodeDeliveryService {
  constructor(private readonly config: ConfigService) {}

  emailVerification(email: string, code: string): void {
    console.log(`[QuizoO auth] Email verification code for ${email}: ${code}`);
  }

  passwordReset(email: string, code: string): void {
    console.log(`[QuizoO auth] Password reset code for ${email}: ${code}`);
  }

  includeCodeInApiResponse(): boolean {
    return this.config.get<string>('AUTH_RETURN_VERIFICATION_CODE') === 'true';
  }
}
