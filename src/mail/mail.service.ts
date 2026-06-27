import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailer: MailerService) {}

  async sendOtp(to: string, code: string | number, purpose = 'login') {
    try {
      const info = await this.mailer.sendMail({
        to,
        from: process.env.MAIL_FROM,
        subject: `Your ${purpose.toUpperCase()} code`,
        template: 'otp',
        context: { code, purpose },
      });
      this.logger.log(`OTP email sent to ${to} (id: ${info?.messageId})`);
    } catch (err) {
      this.logger.error(`Failed to send OTP email to ${to}`, err as Error);
      throw err;
    }
  }

  async sendWelcome(to: string, name?: string) {
    const appName = process.env.APP_NAME ?? 'MyApp';
    const baseUrl = process.env.APP_BASE_URL ?? '#';
    const brandColor = process.env.BRAND_COLOR ?? '#4e73df';
    const helpUrl = process.env.HELP_URL ?? 'mailto:support@yourdomain.tld';
    const ctaUrl =
      baseUrl && baseUrl !== '#'
        ? baseUrl.replace(/\/$/, '') + '/dashboard'
        : '#';

    // return so callers can log info if they want
    return await this.mailer.sendMail({
      to,
      from: process.env.MAIL_FROM,
      subject: `Welcome to ${appName} 👋`,
      template: 'welcome',
      context: {
        name: name ?? 'there',
        appName,
        baseUrl,
        brandColor,
        helpUrl,
        ctaUrl,
      },
    });
  }
}
