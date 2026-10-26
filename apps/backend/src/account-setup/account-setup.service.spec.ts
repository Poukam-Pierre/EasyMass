import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { validateSync } from 'class-validator';
import {
  generateAccountPassword,
  IsAccountPassword,
} from '../common/account-password';
import { MailMessage, MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccountSetupService } from './account-setup.service';

describe('AccountSetupService', () => {
  const user = { userId: 'user-1', email: 'parish@example.com' };
  let prisma: {
    accountSetupToken: Record<string, jest.Mock>;
    user: Record<string, jest.Mock>;
    refreshToken: Record<string, jest.Mock>;
    $transaction: jest.Mock;
  };
  let sent: MailMessage[];
  let service: AccountSetupService;

  beforeEach(() => {
    process.env.PARISH_APP_URL = 'https://parish.example.com/';
    sent = [];
    prisma = {
      accountSetupToken: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn(),
      },
      user: { findUnique: jest.fn(), update: jest.fn().mockResolvedValue({}) },
      refreshToken: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
      $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    };
    const mail = {
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
  const tokenFromEmail = () =>
    /account-setup\?token=([\w-]+)/.exec(sent[0].text)?.[1] as string;

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
      expect(stored.tokenHash).not.toContain(token);
      expect(stored.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('replaces earlier tokens so only the newest link works', async () => {
      await service.sendSetupLink(user);
      expect(prisma.accountSetupToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: user.userId },
      });
    });

    it('fails loudly when PARISH_APP_URL is missing', async () => {
      delete process.env.PARISH_APP_URL;
      await expect(service.sendSetupLink(user)).rejects.toThrow(
        'PARISH_APP_URL'
      );
      expect(sent).toHaveLength(0);
    });
  });

  describe('setup with a stored token', () => {
    const storedTokenFor = async (expiresAt: Date) => {
      await service.sendSetupLink(user);
      const { tokenHash } =
        prisma.accountSetupToken.create.mock.calls[0][0].data;
      prisma.accountSetupToken.findUnique.mockImplementation(
        async ({ where }) =>
          where.tokenHash === tokenHash
            ? { userId: user.userId, tokenHash, expiresAt }
            : null
      );
      return tokenFromEmail();
    };

    it('preview suggests a valid password and changes nothing', async () => {
      const token = await storedTokenFor(new Date(Date.now() + 60_000));
      prisma.accountSetupToken.deleteMany.mockClear();

      const { suggestedPassword } = await service.previewSetup(token);

      expect(isAccountPassword(suggestedPassword)).toBe(true);
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.accountSetupToken.deleteMany).not.toHaveBeenCalled();
    });

    it('preview rejects an expired link', async () => {
      const token = await storedTokenFor(new Date(Date.now() - 1));
      await expect(service.previewSetup(token)).rejects.toThrow(
        'setupLinkInvalid'
      );
    });

    it('sets the chosen password, verifies the email, burns the token and ends sessions', async () => {
      const token = await storedTokenFor(new Date(Date.now() + 60_000));
      prisma.accountSetupToken.deleteMany.mockClear();

      await service.completeSetup(token, 'Ab1!');

      const { data } = prisma.user.update.mock.calls[0][0];
      expect(await bcrypt.compare('Ab1!', data.password)).toBe(true);
      expect(data.emailVerifiedAt).toBeInstanceOf(Date);
      expect(prisma.accountSetupToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: user.userId },
      });
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: user.userId },
      });
    });

    it('rejects an expired link', async () => {
      const token = await storedTokenFor(new Date(Date.now() - 1));
      await expect(service.completeSetup(token, 'Ab1!')).rejects.toThrow(
        BadRequestException
      );
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects an unknown token', async () => {
      await storedTokenFor(new Date(Date.now() + 60_000));
      await expect(service.completeSetup('forged', 'Ab1!')).rejects.toThrow(
        'setupLinkInvalid'
      );
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
