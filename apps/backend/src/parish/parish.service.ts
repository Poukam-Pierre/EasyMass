import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AccountSetupService } from '../account-setup/account-setup.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UserRole } from '@prisma/client';
import { SignUpParishDto } from './dto/signupParish.dto';
import {
  findUserByEmail,
  flattenUserRole,
  resolveAdminForUser,
  resolveParishForUser,
} from '../common/user.utils';

@Injectable()
export class ParishService {
  private readonly logger = new Logger(ParishService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly accountSetupService: AccountSetupService
  ) {}

  async create(parishData: SignUpParishDto, adminId: string) {
    const { city, email, ...rest } = parishData;
    const password = await AccountSetupService.unusablePasswordHash();
    return this.prismaService.parish.create({
      data: {
        ...rest,
        city: {
          connect: {
            city_id: city.city_id,
          },
        },
        createdByAdmin: {
          connect: {
            adminId,
          },
        },
        user: {
          create: {
            email,
            password,
            role: UserRole.PARISH,
          },
        },
      },
      include: { user: true },
    });
  }

  async findAll(filters?: { city?: string; name?: string }) {
    return this.prismaService.parish.findMany({
      where: {
        city: filters?.city
          ? { city_name: { contains: filters.city, mode: 'insensitive' } }
          : undefined,
        name: filters?.name
          ? { contains: filters.name, mode: 'insensitive' }
          : undefined,
      },
      select: {
        parishId: true,
        name: true,
        phone: true,
        managerName: true,
        createdAt: true,
        updatedAt: true,
        isBlocked: true,
        payoutBlocked: true,
        city: { select: { city_name: true } },
        user: { select: { email: true, emailVerifiedAt: true } },
      },
    });
  }

  /** Believer-facing, public: parishes visible for ordering a mass. */
  async findAllVisible() {
    return this.prismaService.parish.findMany({
      where: { isBlocked: false },
      select: {
        parishId: true,
        name: true,
        city: { select: { city_name: true } },
      },
    });
  }

  async setBlocked(parishId: string, isBlocked: boolean) {
    return this.prismaService.parish.update({
      where: { parishId },
      data: { isBlocked },
    });
  }

  async setPayoutBlocked(parishId: string, payoutBlocked: boolean) {
    return this.prismaService.parish.update({
      where: { parishId },
      data: { payoutBlocked },
    });
  }

  async setPayoutNumber(
    parishId: string,
    payoutNumber: string,
    requestUser: { id: string; role: UserRole }
  ) {
    await this.assertCanManage(parishId, requestUser);
    // Changing the payout number invalidates the previously derived NotchPay
    // recipient — clear receiverId so the next withdrawal re-derives it.
    return this.prismaService.parish.update({
      where: { parishId },
      data: { payoutNumber, receiverId: null },
    });
  }

  async findParish(parishId: string) {
    return await this.prismaService.parish.findUnique({
      where: {
        parishId,
      },
    });
  }

  async findOneByMail(email: string) {
    const user = await findUserByEmail(this.prismaService, email);
    const flattened = user && flattenUserRole(user);
    return flattened?.role === UserRole.PARISH ? flattened : null;
  }

  /** requestUser omitted = trusted internal/system call (bypasses the
   * ownership check); every HTTP-facing caller must pass it. */
  async update(
    parishId: string,
    updateParishDto: Prisma.ParishUpdateInput,
    requestUser?: { id: string; role: UserRole }
  ) {
    if (requestUser) await this.assertCanManage(parishId, requestUser);
    return this.prismaService.parish.update({
      where: {
        parishId,
      },
      data: updateParishDto,
    });
  }

  async remove(parishId: string, requestUser: { id: string; role: UserRole }) {
    await this.assertCanManage(parishId, requestUser);
    return this.prismaService.parish.delete({
      where: {
        parishId,
      },
    });
  }

  /** ADMIN may manage any parish; a PARISH caller may only manage its own. */
  private async assertCanManage(
    parishId: string,
    requestUser: { id: string; role: UserRole }
  ) {
    if (requestUser.role === UserRole.ADMIN) return;

    const parish = await resolveParishForUser(
      this.prismaService,
      requestUser.id
    );
    if (parish.parishId !== parishId) {
      throw new ForbiddenException('You may only manage your own parish.', {
        cause: new Error(),
      });
    }
  }

  /**
   * Creates the parish account, then emails its owner the account-setup
   * link (verify email + choose password). A failed email doesn't undo the
   * creation — the admin sees `setupEmailSent: false` and can resend via
   * resendSetupLink once the mail problem is fixed.
   */
  async createParish(
    input: SignUpParishDto,
    requestUser: { id: string; role: UserRole }
  ): Promise<{ code: number; message: string; setupEmailSent: boolean }> {
    const parish = await this.createParishAccount(input, requestUser);

    if (!parish) {
      throw new BadRequestException('This account is already in use.', {
        cause: new Error(),
      });
    }

    try {
      await this.accountSetupService.sendSetupLink(parish.user);
    } catch (error) {
      this.logger.error(
        `Parish ${parish.parishId} created, but its setup email failed: ${error?.message ?? error}`
      );
      return {
        code: 200,
        message: 'New parish created, but the setup email could not be sent.',
        setupEmailSent: false,
      };
    }

    return {
      code: 200,
      message: 'New parish created successfully',
      setupEmailSent: true,
    };
  }

  /** Returns null if the email is already taken by any account. */
  private async createParishAccount(
    input: SignUpParishDto,
    requestUser: { id: string; role: UserRole }
  ) {
    const existing = await findUserByEmail(this.prismaService, input.email);
    if (existing) return null;

    // requestUser.id is the central User.userId (JWT `sub`), not
    // Administrator.adminId directly — resolve it. Throws ForbiddenException
    // if the caller isn't actually an admin (shouldn't happen behind
    // @Roles(ADMIN), but defends against it either way).
    const admin = await resolveAdminForUser(this.prismaService, requestUser.id);

    try {
      return await this.create(input, admin.adminId);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error appears while creating new user parish into db.',
        { cause: new Error() }
      );
    }
  }

  async resendSetupLink(parishId: string) {
    const parish = await this.prismaService.parish.findUnique({
      where: { parishId },
    });
    if (!parish) {
      throw new NotFoundException('Parish not found.', { cause: new Error() });
    }
    await this.accountSetupService.resendSetupLink(parish.userId);
    return { code: 200, message: 'Setup email sent.' };
  }

  /** Believer-facing, public: masses still open for ordering, at visible parishes. */
  async findAllMasses() {
    const parishWithItsOwnMasses = await this.prismaService.parish.findMany({
      where: { isBlocked: false },
      select: {
        name: true,
        city: { select: { city_name: true } },
        mass: {
          where: { status: 'OPEN' },
          select: {
            massId: true,
            price: true,
            startAt: true,
            massType: true,
          },
        },
      },
    });

    return parishWithItsOwnMasses.map(({ mass, city, ...parishData }) => ({
      ...parishData,
      city: city?.city_name,
      massData: mass.map(({ startAt, ...massData }) => ({
        ...massData,
        dateTime: startAt,
      })),
    }));
  }

  /** masses created, money earned/withdrawn, intentions treated, roster. */
  async getDashboard(parishId: string) {
    const [
      massesCreatedCount,
      massesByStatusRaw,
      incomeAgg,
      withdrawnAgg,
      intentionsTreatedCount,
      priests,
    ] = await Promise.all([
      this.prismaService.mass.count({ where: { parishId } }),
      this.prismaService.mass.groupBy({
        by: ['status'],
        where: { parishId },
        _count: { massId: true },
      }),
      this.prismaService.transaction.aggregate({
        where: {
          ownerId: parishId,
          ownerType: 'PARISH',
          transactionType: 'INCOME',
        },
        _sum: { amount: true },
      }),
      this.prismaService.transaction.aggregate({
        where: {
          ownerId: parishId,
          ownerType: 'PARISH',
          transactionType: 'WITHDRAWAL',
        },
        _sum: { amount: true },
      }),
      this.prismaService.massOrder.count({
        where: { mass: { parishId, status: 'COMPLETED' } },
      }),
      this.prismaService.priest.findMany({ where: { homeParishId: parishId } }),
    ]);

    return {
      massesCreatedCount,
      massesByStatus: massesByStatusRaw.map((s) => ({
        status: s.status,
        count: s._count.massId,
      })),
      moneyEarned: incomeAgg._sum.amount ?? 0,
      moneyWithdrawn: Math.abs(withdrawnAgg._sum.amount ?? 0),
      intentionsTreatedCount,
      priests,
    };
  }
}
