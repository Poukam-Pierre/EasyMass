import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });
  }

  async sendWithAttachment(
    to: string,
    subject: string,
    text: string,
    attachment: { filename: string; content: Buffer }
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@easymesse.com',
        to,
        subject,
        text,
        attachments: [attachment],
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to}: ${error?.message ?? error}`
      );
      throw error;
    }
  }
}
