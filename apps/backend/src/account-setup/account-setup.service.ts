import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountSetupToken, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { generateAccountPassword } from '../common/account-password';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { buildAccountSetupEmail } from './account-setup.email';

/**
 * The one flow by which a newly created account becomes usable: an emailed
 * one-time link that both verifies the email address and lets the owner
 * choose their own password. Until it's completed, User.emailVerifiedAt
 * stays null and AuthService.login refuses the account.
 */
@Injectable()
export class AccountSetupService {
  private static readonly LINK_VALIDITY_HOURS = 48;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService
  ) {}

  /** What User.password holds until setup completes — the column is
   * required, and a bcrypt hash of random bytes nobody ever saw can never
   * match a login attempt, so it's never a guessable value either. */
  static unusablePasswordHash(): Promise<string> {
    return bcrypt.hash(randomBytes(32).toString('hex'), 10);
  }

  /** Issues a fresh link and emails it. Replaces any earlier token, so
   * only the newest email ever works. Throws if the email can't be sent —
   * the caller decides whether that's fatal. */
  async sendSetupLink(user: Pick<User, 'userId' | 'email'>): Promise<void> {
    const baseUrl = process.env.PARISH_APP_URL;
    if (!baseUrl) {
      throw new Error('PARISH_APP_URL is not configured.');
    }

    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(
      Date.now() + AccountSetupService.LINK_VALIDITY_HOURS * 60 * 60 * 1000
    );
    await this.prismaService.$transaction([
      this.prismaService.accountSetupToken.deleteMany({
        where: { userId: user.userId },
      }),
      this.prismaService.accountSetupToken.create({
        data: { userId: user.userId, tokenHash: hashToken(token), expiresAt },
      }),
    ]);

    const setupUrl = `${baseUrl.replace(/\/$/, '')}/account-setup?token=${token}`;
    await this.mailService.send(
      buildAccountSetupEmail(
        user.email,
        setupUrl,
        AccountSetupService.LINK_VALIDITY_HOURS
      )
    );
  }

  /** Admin-triggered re-send, for a lost or expired email. Refused once
   * the account is already set up — from then on, its password belongs to
   * its owner alone. */
  async resendSetupLink(userId: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException('Account not found.', { cause: new Error() });
    }
    if (user.emailVerifiedAt) {
      throw new BadRequestException('accountAlreadyActive', {
        cause: new Error(),
        description: 'This account has already been set up.',
      });
    }
    await this.sendSetupLink(user);
  }

  /** Read-only first step of the setup page: confirms the link is still
   * usable and suggests a strong password the owner can keep or replace.
   * Deliberately changes nothing — mail scanners open links before people
   * do, and a scanner must not be able to use up the link. The suggestion
   * is generated per request and never stored. */
  async previewSetup(token: string): Promise<{ suggestedPassword: string }> {
    await this.findValidToken(token);
    return { suggestedPassword: generateAccountPassword() };
  }

  /** Verifies the email and sets the owner's chosen password in one step,
   * then burns the token so the link can't be reused, and ends any session
   * the account already has — whoever held the old password is logged out. */
  async completeSetup(token: string, password: string): Promise<void> {
    const record = await this.findValidToken(token);

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prismaService.$transaction([
      this.prismaService.user.update({
        where: { userId: record.userId },
        data: { password: passwordHash, emailVerifiedAt: new Date() },
      }),
      this.prismaService.accountSetupToken.deleteMany({
        where: { userId: record.userId },
      }),
      this.prismaService.refreshToken.deleteMany({
        where: { userId: record.userId },
      }),
    ]);
  }

  private async findValidToken(token: string): Promise<AccountSetupToken> {
    const record = await this.prismaService.accountSetupToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });
    if (!record || record.expiresAt <= new Date()) {
      throw new BadRequestException('setupLinkInvalid', {
        cause: new Error(),
        description:
          'This account setup link is invalid or has expired. Ask the platform administrator for a new one.',
      });
    }
    return record;
  }
}

/** Tokens are 256 random bits, so a fast unsalted hash is enough here —
 * bcrypt's slowness only matters for low-entropy secrets like passwords. */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
