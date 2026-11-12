import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountSetupToken,
  AccountTokenPurpose,
  User,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { generateAccountPassword } from '../common/account-password';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildAccountSetupEmail,
  buildPasswordResetEmail,
} from './account-setup.email';

/** Error key (translated by the frontends) for an unusable link, per flow. */
const INVALID_LINK_KEY: Record<AccountTokenPurpose, string> = {
  SETUP: 'setupLinkInvalid',
  RESET: 'resetLinkInvalid',
};

/** Which app a role's links open in — each role has its own portal. */
const APP_URL_ENV: Partial<Record<UserRole, string>> = {
  PARISH: 'PARISH_APP_URL',
  ADMIN: 'ADMIN_APP_URL',
};

type LinkRecipient = Pick<User, 'userId' | 'email' | 'role'>;

/**
 * The emailed one-time links by which an account owner chooses their own
 * password — nobody else ever sets or sees it:
 * - SETUP: a newly created account. Completing it also verifies the email;
 *   until then User.emailVerifiedAt stays null and AuthService.login
 *   refuses the account.
 * - RESET: a forgotten password, requested by the owner from the login
 *   page or sent by an admin on their behalf.
 * A link only works for the flow it was issued for.
 */
@Injectable()
export class AccountSetupService {
  private static readonly SETUP_VALIDITY_HOURS = 48;
  private static readonly RESET_VALIDITY_MINUTES = 60;
  /** A self-service request within this long of the previous reset email
   * sends nothing — stops anyone from flooding someone's inbox. */
  private static readonly RESET_REQUEST_COOLDOWN_MS = 60_000;

  private readonly logger = new Logger(AccountSetupService.name);

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

  /** Issues a fresh setup link and emails it. Replaces any earlier setup
   * link, so only the newest email ever works. Throws if the email can't
   * be sent — the caller decides whether that's fatal. */
  async sendSetupLink(user: LinkRecipient): Promise<void> {
    const baseUrl = appUrlFor(user.role);
    const token = await this.issueToken(
      user.userId,
      AccountTokenPurpose.SETUP,
      AccountSetupService.SETUP_VALIDITY_HOURS * 60 * 60 * 1000
    );
    await this.mailService.send(
      buildAccountSetupEmail(
        user.email,
        `${baseUrl}/account-setup?token=${token}`,
        AccountSetupService.SETUP_VALIDITY_HOURS
      )
    );
  }

  /** Admin-triggered re-send, for a lost or expired email. Refused once
   * the account is already set up — from then on, its password belongs to
   * its owner alone (a reset link is the way to help them). */
  async resendSetupLink(userId: string): Promise<void> {
    const user = await this.findUserOrThrow(userId);
    if (user.emailVerifiedAt) {
      throw new BadRequestException('accountAlreadyActive', {
        cause: new Error(),
        description: 'This account has already been set up.',
      });
    }
    await this.sendSetupLink(user);
  }

  /** Issues a fresh reset link (replacing earlier ones) and emails it to
   * the account's own address. Throws if the email can't be sent. */
  async sendPasswordResetLink(user: LinkRecipient): Promise<void> {
    const baseUrl = appUrlFor(user.role);
    const token = await this.issueToken(
      user.userId,
      AccountTokenPurpose.RESET,
      AccountSetupService.RESET_VALIDITY_MINUTES * 60 * 1000
    );
    await this.mailService.send(
      buildPasswordResetEmail(
        user.email,
        `${baseUrl}/recovery/new-password?token=${token}`,
        AccountSetupService.RESET_VALIDITY_MINUTES
      )
    );
  }

  /** Admin-triggered reset for an active account. One still pending setup
   * gets its setup link re-sent instead (resendSetupLink), whose email
   * explains that the account is new. */
  async sendPasswordResetFor(userId: string): Promise<void> {
    const user = await this.findUserOrThrow(userId);
    if (!user.emailVerifiedAt) {
      throw new BadRequestException('accountPendingSetup', {
        cause: new Error(),
        description:
          'This account has not been set up yet. Resend its setup email instead.',
      });
    }
    await this.sendPasswordResetLink(user);
  }

  /**
   * The public "Forgot password?" request. Resolves the same way, at the
   * same speed, whether or not the email belongs to an account of `role`,
   * so it can't be used to find out who has an account: the email is sent
   * in the background and a failure is only logged.
   */
  async requestPasswordReset(email: string, role: UserRole): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user || user.role !== role) return;

    void this.sendRequestedReset(user).catch((error) =>
      this.logger.error(
        `Password reset email for user ${user.userId} failed`,
        error instanceof Error ? error.stack : String(error)
      )
    );
  }

  private async sendRequestedReset(user: User): Promise<void> {
    const latest = await this.prismaService.accountSetupToken.findFirst({
      where: { userId: user.userId, purpose: AccountTokenPurpose.RESET },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    const sinceLast = latest
      ? Date.now() - latest.createdAt.getTime()
      : Infinity;
    if (sinceLast < AccountSetupService.RESET_REQUEST_COOLDOWN_MS) return;

    await this.sendPasswordResetLink(user);
  }

  /** Read-only first step of the setup page: confirms the link is still
   * usable and suggests a strong password the owner can keep or replace.
   * Deliberately changes nothing — mail scanners open links before people
   * do, and a scanner must not be able to use up the link. The suggestion
   * is generated per request and never stored. */
  previewSetup(token: string): Promise<{ suggestedPassword: string }> {
    return this.preview(token, AccountTokenPurpose.SETUP);
  }

  /** Same as previewSetup, for a reset link. */
  previewReset(token: string): Promise<{ suggestedPassword: string }> {
    return this.preview(token, AccountTokenPurpose.RESET);
  }

  /** Verifies the email and sets the owner's chosen password. */
  completeSetup(token: string, password: string): Promise<void> {
    return this.complete(token, AccountTokenPurpose.SETUP, password);
  }

  /** Sets the owner's new password. Opening the link proves they own the
   * address, so an account that never finished setup is verified too. */
  completeReset(token: string, password: string): Promise<void> {
    return this.complete(token, AccountTokenPurpose.RESET, password);
  }

  private async preview(
    token: string,
    purpose: AccountTokenPurpose
  ): Promise<{ suggestedPassword: string }> {
    await this.findValidToken(token, purpose);
    return { suggestedPassword: generateAccountPassword() };
  }

  /** Sets the password and marks the email verified (if it wasn't), then
   * burns every link the account has, of either purpose, so none can be
   * used to change the password again, and ends any session the account
   * already has — whoever held the old password is logged out.
   *
   * The link is burned first, in the same transaction: concurrent
   * submissions of one link (a double-click, or someone racing the owner)
   * both pass findValidToken, but only one can delete the row — the other
   * sees count 0 and is refused, so a link really is used only once. */
  private async complete(
    token: string,
    purpose: AccountTokenPurpose,
    password: string
  ): Promise<void> {
    const record = await this.findValidToken(token, purpose);
    const { userId } = record;

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prismaService.$transaction(async (tx) => {
      const { count } = await tx.accountSetupToken.deleteMany({
        where: { id: record.id },
      });
      if (count === 0) throw invalidLink(purpose);

      await tx.user.update({
        where: { userId },
        data: { password: passwordHash },
      });
      await tx.user.updateMany({
        where: { userId, emailVerifiedAt: null },
        data: { emailVerifiedAt: new Date() },
      });
      await tx.accountSetupToken.deleteMany({ where: { userId } });
      await tx.refreshToken.deleteMany({ where: { userId } });
    });
  }

  private async findUserOrThrow(userId: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException('Account not found.', { cause: new Error() });
    }
    return user;
  }

  /** Stores a new token's hash, replacing the user's earlier ones for the
   * same purpose, and returns the raw token for the email. */
  private async issueToken(
    userId: string,
    purpose: AccountTokenPurpose,
    validityMs: number
  ): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + validityMs);
    await this.prismaService.$transaction([
      this.prismaService.accountSetupToken.deleteMany({
        where: { userId, purpose },
      }),
      this.prismaService.accountSetupToken.create({
        data: { userId, purpose, tokenHash: hashToken(token), expiresAt },
      }),
    ]);
    return token;
  }

  private async findValidToken(
    token: string,
    purpose: AccountTokenPurpose
  ): Promise<AccountSetupToken> {
    const record = await this.prismaService.accountSetupToken.findUnique({
      where: { tokenHash: hashToken(token) },
    });
    if (!record || record.purpose !== purpose || record.expiresAt <= new Date()) {
      throw invalidLink(purpose);
    }
    return record;
  }
}

function invalidLink(purpose: AccountTokenPurpose): BadRequestException {
  return new BadRequestException(INVALID_LINK_KEY[purpose], {
    cause: new Error(),
    description:
      purpose === AccountTokenPurpose.SETUP
        ? 'This account setup link is invalid or has expired. Ask the platform administrator for a new one.'
        : 'This password reset link is invalid or has expired. Request a new one from the login page.',
  });
}

/** Base URL of the app a role's links open in, from its env var. Throws if
 * unset, before any token is stored. */
function appUrlFor(role: UserRole): string {
  const envName = APP_URL_ENV[role];
  const baseUrl = envName ? process.env[envName] : undefined;
  if (!envName || !baseUrl) {
    throw new Error(
      `${envName ?? `An app URL for role ${role}`} is not configured.`
    );
  }
  return baseUrl.replace(/\/$/, '');
}

/** Tokens are 256 random bits, so a fast unsalted hash is enough here —
 * bcrypt's slowness only matters for low-entropy secrets like passwords. */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
