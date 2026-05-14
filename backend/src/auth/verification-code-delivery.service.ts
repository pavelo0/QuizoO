import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

@Injectable()
export class VerificationCodeDeliveryService {
  private readonly logger = new Logger(VerificationCodeDeliveryService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {}

  async emailVerification(email: string, code: string): Promise<void> {
    const appName = this.getAppName();
    await this.sendMail({
      to: email,
      subject: `${appName}: verify your email`,
      text: [
        `Your ${appName} verification code is: ${code}`,
        '',
        'This code expires in 15 minutes.',
        'If you did not create an account, you can ignore this email.',
      ].join('\n'),
    });
  }

  async passwordReset(email: string, code: string): Promise<void> {
    const appName = this.getAppName();
    await this.sendMail({
      to: email,
      subject: `${appName}: password reset code`,
      text: [
        `Your ${appName} password reset code is: ${code}`,
        '',
        'This code expires in 15 minutes.',
        'If you did not request a password reset, you can ignore this email.',
      ].join('\n'),
    });
  }

  private async sendMail(input: {
    to: string;
    subject: string;
    text: string;
  }): Promise<void> {
    const transporter = this.getTransporter();
    const from = this.getRequired('SMTP_FROM');

    try {
      await transporter.sendMail({
        from,
        to: input.to,
        subject: input.subject,
        text: input.text,
      });
    } catch (error) {
      this.logger.error(`Failed to send email to ${input.to}`, error);
      throw new InternalServerErrorException(
        'Failed to send verification email. Try again later.',
      );
    }
  }

  private getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const host = this.getRequired('SMTP_HOST');
    const user = this.getRequired('SMTP_USER');
    const pass = this.getRequired('SMTP_PASS');
    const port = this.getNumber('SMTP_PORT', 587);
    const secure = this.getBoolean('SMTP_SECURE', port === 465);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
    return this.transporter;
  }

  private getRequired(key: string): string {
    const value = this.config.get<string>(key)?.trim();
    if (!value) {
      throw new InternalServerErrorException(`${key} is not configured`);
    }
    return value;
  }

  private getBoolean(key: string, fallback: boolean): boolean {
    const value = this.config.get<string>(key)?.trim().toLowerCase();
    if (!value) {
      return fallback;
    }
    return value === 'true' || value === '1' || value === 'yes';
  }

  private getNumber(key: string, fallback: number): number {
    const value = this.config.get<string>(key)?.trim();
    if (!value) {
      return fallback;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new InternalServerErrorException(`${key} must be a valid number`);
    }
    return parsed;
  }

  private getAppName(): string {
    return this.config.get<string>('AUTH_APP_NAME')?.trim() || 'QuizoO';
  }
}
