import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  /** Optional rich version — mail clients fall back to `text` without it. */
  html?: string;
  attachments?: { filename: string; content: Buffer }[];
}

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

  /** Single delivery path for every email the platform sends, so the
   * sender address and failure logging exist exactly once. Rethrows after
   * logging — each caller decides whether a failed send is fatal for it. */
  async send(message: MailMessage): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@easymesse.com',
        ...message,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${message.to}: ${error?.message ?? error}`
      );
      throw error;
    }
  }
}
