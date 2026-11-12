import { BadRequestException, Logger } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { validateSync } from 'class-validator';
import {
  generateAccountPassword,
  IsAccountPassword,
} from '../common/account-password';
import { MailMessage, MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccountSetupService } from './account-setup.service';

/** Lets fire-and-forget work (the background reset email) finish. */
const flushBackgroundWork = async () => {
  for (let i = 0; i < 10; i++) await new Promise(setImmediate);
};

describe('AccountSetupService', () => {
  const user = {
    userId: 'user-1',
    email: 'parish@example.com',
    role: UserRole.PARISH,
  };
  const admin = {
    userId: 'admin-1',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };
  let prisma: {
    accountSetupToken: Record<string, jest.Mock>;
    user: Record<string, jest.Mock>;
    refreshToken: Record<string, jest.Mock>;
    $transaction: jest.Mock;
  };
  let sent: MailMessage[];
  let mail: { send: jest.Mock };
  let service: AccountSetupService;

  beforeEach(() => {
    process.env.PARISH_APP_URL = 'https://parish.example.com/';
    process.env.ADMIN_APP_URL = 'https://admin.example.com';
    sent = [];
    prisma = {
      accountSetupToken: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        create: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      user: {
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      refreshToken: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
      // Both forms Prisma accepts: an array of queries, or a callback that
      // gets the transaction client (here, the same mock).
      $transaction: jest.fn((arg: unknown) =>
        typeof arg === 'function' ? arg(prisma) : Promise.all(arg as Promise<unknown>[])
      ),
    };
    mail = {
      send: jest.fn(async (message: MailMessage) => {
        sent.push(message);
      }),
    };
    service = new AccountSetupService(
      prisma as unknown as PrismaService,
      mail as unknown as MailService
    );
  });

  /** The raw token only ever exists in the email — pull it back out. */
  const tokenFromEmail = (index = 0) =>
    /token=([\w-]+)/.exec(sent[index].text)?.[1] as string;

  /** Makes the token from the last stored create() findable, as the DB
   * would, with the given expiry. */
  const storeLastToken = (expiresAt: Date) => {
    const calls = prisma.accountSetupToken.create.mock.calls;
    const { tokenHash, purpose, userId } = calls[calls.length - 1][0].data;
    prisma.accountSetupToken.findUnique.mockImplementation(async ({ where }) =>
      where.tokenHash === tokenHash
        ? { id: 'token-1', userId, tokenHash, purpose, expiresAt }
        : null
    );
  };

  describe('sendSetupLink', () => {
    it('emails a bilingual link and stores only the token hash', async () => {
      await service.sendSetupLink(user);

      const token = tokenFromEmail();
      expect(sent[0].to).toBe(user.email);
      expect(sent[0].text).toContain(
        `https://parish.example.com/account-setup?token=${token}`
      );
      expect(sent[0].text).toContain('Un compte EasyMesse a été créé');
      expect(sent[0].text).toContain('An EasyMesse account has been created');
      expect(sent[0].subject).toMatch(/Activez.*Activate/);
      expect(sent[0].html).toContain('Activer mon compte');
      expect(sent[0].html).toContain('Activate my account');

      const stored = prisma.accountSetupToken.create.mock.calls[0][0].data;
      expect(stored.userId).toBe(user.userId);
      expect(stored.purpose).toBe('SETUP');
      expect(stored.tokenHash).not.toContain(token);
      expect(stored.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('replaces earlier setup tokens so only the newest link works', async () => {
      await service.sendSetupLink(user);
      expect(prisma.accountSetupToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: user.userId, purpose: 'SETUP' },
      });
    });

    it('fails loudly when PARISH_APP_URL is missing', async () => {
      delete process.env.PARISH_APP_URL;
      await expect(service.sendSetupLink(user)).rejects.toThrow(
        'PARISH_APP_URL'
      );
      expect(sent).toHaveLength(0);
      expect(prisma.accountSetupToken.create).not.toHaveBeenCalled();
    });
  });

  describe('setup with a stored token', () => {
    const storedSetupToken = async (expiresAt: Date) => {
      await service.sendSetupLink(user);
      storeLastToken(expiresAt);
      return tokenFromEmail();
    };

    it('preview suggests a valid password and changes nothing', async () => {
      const token = await storedSetupToken(new Date(Date.now() + 60_000));
      prisma.accountSetupToken.deleteMany.mockClear();

      const { suggestedPassword } = await service.previewSetup(token);

      expect(isAccountPassword(suggestedPassword)).toBe(true);
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.accountSetupToken.deleteMany).not.toHaveBeenCalled();
    });

    it('preview rejects an expired link', async () => {
      const token = await storedSetupToken(new Date(Date.now() - 1));
      await expect(service.previewSetup(token)).rejects.toThrow(
        'setupLinkInvalid'
      );
    });

    it('sets the chosen password, verifies the email, burns every link and ends sessions', async () => {
      const token = await storedSetupToken(new Date(Date.now() + 60_000));
      prisma.accountSetupToken.deleteMany.mockClear();

      await service.completeSetup(token, 'Ab1!');

      const { data } = prisma.user.update.mock.calls[0][0];
      expect(await bcrypt.compare('Ab1!', data.password)).toBe(true);
      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { userId: user.userId, emailVerifiedAt: null },
        data: { emailVerifiedAt: expect.any(Date) },
      });
      expect(prisma.accountSetupToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: user.userId },
      });
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: user.userId },
      });
    });

    it('rejects an expired link', async () => {
      const token = await storedSetupToken(new Date(Date.now() - 1));
      await expect(service.completeSetup(token, 'Ab1!')).rejects.toThrow(
        BadRequestException
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects an unknown token', async () => {
      await storedSetupToken(new Date(Date.now() + 60_000));
      await expect(service.completeSetup('forged', 'Ab1!')).rejects.toThrow(
        'setupLinkInvalid'
      );
    });

    it('a setup link cannot be used as a reset link', async () => {
      const token = await storedSetupToken(new Date(Date.now() + 60_000));
      await expect(service.completeReset(token, 'Ab1!')).rejects.toThrow(
        'resetLinkInvalid'
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('resendSetupLink', () => {
    it('refuses an account that is already set up', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...user,
        emailVerifiedAt: new Date(),
      });
      await expect(service.resendSetupLink(user.userId)).rejects.toThrow(
        'accountAlreadyActive'
      );
      expect(sent).toHaveLength(0);
    });

    it('re-sends for an account still pending setup', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...user,
        emailVerifiedAt: null,
      });
      await service.resendSetupLink(user.userId);
      expect(sent).toHaveLength(1);
    });
  });

  describe('sendPasswordResetLink', () => {
    it('emails a parish a 1-hour bilingual link to the parish app', async () => {
      const before = Date.now();
      await service.sendPasswordResetLink(user);

      const token = tokenFromEmail();
      expect(sent[0].to).toBe(user.email);
      expect(sent[0].text).toContain(
        `https://parish.example.com/recovery/new-password?token=${token}`
      );
      expect(sent[0].subject).toMatch(/Réinitialisez.*Reset/);
      expect(sent[0].html).toContain('Choisir un nouveau mot de passe');
      expect(sent[0].html).toContain('Choose a new password');
      expect(sent[0].text).toContain('60 minutes');

      const stored = prisma.accountSetupToken.create.mock.calls[0][0].data;
      expect(stored.purpose).toBe('RESET');
      expect(stored.tokenHash).not.toContain(token);
      const validityMs = stored.expiresAt.getTime() - before;
      expect(validityMs).toBeGreaterThanOrEqual(60 * 60 * 1000);
      expect(validityMs).toBeLessThan(61 * 60 * 1000);
      expect(prisma.accountSetupToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: user.userId, purpose: 'RESET' },
      });
    });

    it('sends an admin to the admin app', async () => {
      await service.sendPasswordResetLink(admin);
      expect(sent[0].text).toContain(
        'https://admin.example.com/recovery/new-password?token='
      );
    });

    it('fails loudly when ADMIN_APP_URL is missing', async () => {
      delete process.env.ADMIN_APP_URL;
      await expect(service.sendPasswordResetLink(admin)).rejects.toThrow(
        'ADMIN_APP_URL'
      );
      expect(prisma.accountSetupToken.create).not.toHaveBeenCalled();
    });
  });

  describe('requestPasswordReset (self-service)', () => {
    it('emails the owner of a matching account', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...user, emailVerifiedAt: new Date() });

      await service.requestPasswordReset(user.email, UserRole.PARISH);
      await flushBackgroundWork();

      expect(sent).toHaveLength(1);
      expect(sent[0].to).toBe(user.email);
    });

    it('sends nothing, and resolves the same way, for an unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.requestPasswordReset('nobody@example.com', UserRole.PARISH)
      ).resolves.toBeUndefined();
      await flushBackgroundWork();

      expect(sent).toHaveLength(0);
    });

    it("sends nothing when the email belongs to another portal's account", async () => {
      prisma.user.findUnique.mockResolvedValue({ ...admin, emailVerifiedAt: new Date() });

      await service.requestPasswordReset(admin.email, UserRole.PARISH);
      await flushBackgroundWork();

      expect(sent).toHaveLength(0);
    });

    it('sends nothing again within a minute of the last reset email', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...user, emailVerifiedAt: new Date() });
      prisma.accountSetupToken.findFirst.mockResolvedValue({
        createdAt: new Date(Date.now() - 10_000),
      });

      await service.requestPasswordReset(user.email, UserRole.PARISH);
      await flushBackgroundWork();

      expect(sent).toHaveLength(0);
    });

    it('still resolves when the email fails, and logs it', async () => {
      const log = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      prisma.user.findUnique.mockResolvedValue({ ...user, emailVerifiedAt: new Date() });
      mail.send.mockRejectedValue(new Error('SMTP down'));

      await expect(
        service.requestPasswordReset(user.email, UserRole.PARISH)
      ).resolves.toBeUndefined();
      await flushBackgroundWork();

      expect(log).toHaveBeenCalledWith(
        expect.stringContaining(user.userId),
        expect.stringContaining('SMTP down')
      );
      log.mockRestore();
    });
  });

  describe('reset with a stored token', () => {
    const storedResetToken = async (expiresAt: Date) => {
      await service.sendPasswordResetLink(user);
      storeLastToken(expiresAt);
      return tokenFromEmail();
    };

    it('preview suggests a valid password and changes nothing', async () => {
      const token = await storedResetToken(new Date(Date.now() + 60_000));
      prisma.accountSetupToken.deleteMany.mockClear();

      const { suggestedPassword } = await service.previewReset(token);

      expect(isAccountPassword(suggestedPassword)).toBe(true);
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.accountSetupToken.deleteMany).not.toHaveBeenCalled();
    });

    it('sets the new password, verifies a not-yet-verified email, burns every link and ends sessions', async () => {
      const token = await storedResetToken(new Date(Date.now() + 60_000));
      prisma.accountSetupToken.deleteMany.mockClear();

      await service.completeReset(token, 'Ab1!');

      const { data } = prisma.user.update.mock.calls[0][0];
      expect(await bcrypt.compare('Ab1!', data.password)).toBe(true);
      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { userId: user.userId, emailVerifiedAt: null },
        data: { emailVerifiedAt: expect.any(Date) },
      });
      expect(prisma.accountSetupToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: user.userId },
      });
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: user.userId },
      });
    });

    it('lets only one of two concurrent submissions of the same link through', async () => {
      const token = await storedResetToken(new Date(Date.now() + 60_000));
      // Burning the token row only succeeds once, as in the database.
      let tokenRowLeft = true;
      prisma.accountSetupToken.deleteMany.mockImplementation(async ({ where }) => {
        if (where.id !== 'token-1') return { count: 0 };
        const count = tokenRowLeft ? 1 : 0;
        tokenRowLeft = false;
        return { count };
      });

      const results = await Promise.allSettled([
        service.completeReset(token, 'First1!pass'),
        service.completeReset(token, 'Second1!pass'),
      ]);

      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      const rejected = results.find((r) => r.status === 'rejected') as PromiseRejectedResult;
      expect(rejected.reason.message).toBe('resetLinkInvalid');
      expect(prisma.user.update).toHaveBeenCalledTimes(1);
    });

    it('rejects an expired link', async () => {
      const token = await storedResetToken(new Date(Date.now() - 1));
      await expect(service.completeReset(token, 'Ab1!')).rejects.toThrow(
        'resetLinkInvalid'
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('a reset link cannot be used as a setup link', async () => {
      const token = await storedResetToken(new Date(Date.now() + 60_000));
      await expect(service.previewSetup(token)).rejects.toThrow(
        'setupLinkInvalid'
      );
    });
  });

  describe('sendPasswordResetFor (admin-triggered)', () => {
    it('refuses an account still pending setup', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...user, emailVerifiedAt: null });
      await expect(service.sendPasswordResetFor(user.userId)).rejects.toThrow(
        'accountPendingSetup'
      );
      expect(sent).toHaveLength(0);
    });

    it("emails the reset link to the account's own address", async () => {
      prisma.user.findUnique.mockResolvedValue({ ...user, emailVerifiedAt: new Date() });
      await service.sendPasswordResetFor(user.userId);
      expect(sent).toHaveLength(1);
      expect(sent[0].to).toBe(user.email);
    });
  });

  it('unusablePasswordHash never matches an empty or common password', async () => {
    const hash = await AccountSetupService.unusablePasswordHash();
    expect(await bcrypt.compare('', hash)).toBe(false);
    expect(await bcrypt.compare('password', hash)).toBe(false);
  });

  it('generated passwords always satisfy the account password rule', () => {
    // The helper must actually reject weak passwords for this to mean anything.
    expect(isAccountPassword('Ab1!')).toBe(false);
    expect(isAccountPassword('abcdefghij1!')).toBe(false);
    expect(isAccountPassword('Abcdefgh1!')).toBe(true);
    for (let i = 0; i < 500; i++) {
      expect(isAccountPassword(generateAccountPassword())).toBe(true);
    }
  });
});

class PasswordHolder {
  @IsAccountPassword()
  password: string;
}

/** IsAccountPassword's failure message throws instead of returning text
 * (see the decorator), so a failed validation surfaces as an exception. */
function isAccountPassword(password: string): boolean {
  const holder = Object.assign(new PasswordHolder(), { password });
  try {
    return validateSync(holder).length === 0;
  } catch {
    return false;
  }
}
