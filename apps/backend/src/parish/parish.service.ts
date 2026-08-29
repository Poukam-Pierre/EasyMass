import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, UserRole } from '@prisma/client';
import { SignUpParishDto } from './dto/signupParish.dto';
import * as bcrypt from 'bcryptjs';
import {
  findUserByEmail,
  flattenUserRole,
  resolveAdminForUser,
  resolveParishForUser,
} from '../common/user.utils';

@Injectable()
export class ParishService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(parishData: SignUpParishDto, adminId: string) {
    const { city, email, password, ...rest } = parishData;
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
        user: { select: { email: true } },
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
      throw new ForbiddenException('Forbidden', {
        cause: new Error(),
        description: 'You may only manage your own parish.',
      });
    }
  }

  /**
   * This function passes the input and request to other validation function
   * and just waits for the result to perfom error action. If any error occurs
   * the function passes the result to signIn function and returns the result.
   * @param input receiving value from client side
   * @param request request object processed in the guard function
   * @returns successfull result object
   */
  async createParish(
    input: SignUpParishDto,
    requestUser: { id: string; role: UserRole }
  ): Promise<{ code: number; message: string }> {
    const user = await this.credentialsParishValidation(input, requestUser);

    if (!user) {
      throw new BadRequestException('Bad Request', {
        cause: new Error(),
        description: 'This account is already in use.',
      });
    }

    return { code: 200, message: 'New parish created successfully' };
  }

  /**
   * This function verifies that the input from the client exists in the database. If so,
   * the function returns null. Otherwise, the function hash password and creates a new
   * user account. Then returns the user object created.
   * @param input
   * @param requestUser
   * @returns
   */
  async credentialsParishValidation(
    input: SignUpParishDto,
    requestUser: { id: string; role: UserRole }
  ) {
    const { email, password } = input;
    const existing = await findUserByEmail(this.prismaService, email);
    if (existing) return null;

    // requestUser.id is the central User.userId (JWT `sub`), not
    // Administrator.adminId directly — resolve it. Throws ForbiddenException
    // if the caller isn't actually an admin (shouldn't happen behind
    // @Roles(ADMIN), but defends against it either way).
    const admin = await resolveAdminForUser(this.prismaService, requestUser.id);

    try {
      const hash = await bcrypt.hash(password, 10);
      input.password = hash;

      await this.create(input, admin.adminId);

      return {
        statusCode: 200,
        message: 'Parish created successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error', {
        cause: new Error(),
        description:
          'Error appears while processing hash and create new user parish into db.',
      });
    }
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
