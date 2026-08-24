import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MassStatus, MassType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { resolveParishForUser } from '../common/user.utils';
import { CreateMassDto } from './dto/create-mass.dto';
import { UpdateMassDto } from './dto/update-mass.dto';

export interface MassFilters {
  status?: MassStatus;
  massType?: MassType;
  from?: string;
  to?: string;
}

@Injectable()
export class MassService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates masses for the authenticated parish. If replicate=true, creates
   * one mass every 7 days at the same time-of-day from startAt until the end
   * of the current year (skipping any that already exist); otherwise creates
   * a single mass, rejecting an exact-timestamp duplicate.
   */
  async createMasses(
    input: CreateMassDto,
    request
  ): Promise<{ code: number; message: string }> {
    const parish = await resolveParishForUser(
      this.prismaService,
      request.user.id
    );
    const parishId = parish.parishId;
    const { replicate, startAt, estimatedDurationMinutes, price, massType } =
      input;

    const existingMass = await this.findAllByParish(parishId);

    if (replicate) {
      const allDates = this.getDatesEvery7DaysUntilEndOfYear(startAt);

      const uniqueDates = this.getUniqueDate(
        allDates,
        existingMass.map((mass) => mass.startAt.toISOString())
      );

      if (!uniqueDates.length)
        return { code: 200, message: 'All masses already exist!' };

      const listOfMasses = this.createListOfMasses(
        uniqueDates,
        input,
        parishId
      );

      try {
        await this.prismaService.mass.createMany({ data: listOfMasses });
        return { code: 201, message: 'Mass created successfully!' };
      } catch (error) {
        throw new InternalServerErrorException();
      }
    }

    const isMassAlreadyExists = existingMass.some(
      (mass) => mass.startAt.getTime() === new Date(startAt).getTime()
    );

    if (isMassAlreadyExists) {
      throw new ConflictException('Mass already exists', {
        cause: new Error(),
        description: 'Mass already created by the same parish',
      });
    }

    const createInput: Prisma.MassCreateInput = {
      price,
      startAt: new Date(startAt),
      estimatedDurationMinutes,
      massType,
      parish: { connect: { parishId } },
    };

    try {
      await this.create(createInput);
      return { code: 200, message: 'Mass created successfully!' };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async create(createMassDto: Prisma.MassCreateInput) {
    return this.prismaService.mass.create({
      data: createMassDto,
    });
  }

  /** startAt/estimatedDurationMinutes may only change while status=OPEN. */
  async update(
    massId: string,
    updateMassDto: UpdateMassDto,
    requestUser: { id: string; role: string }
  ) {
    const mass = await this.prismaService.mass.findUnique({
      where: { massId },
    });
    if (!mass) {
      throw new ConflictException('Mass not found');
    }

    if (requestUser.role !== 'ADMIN') {
      const parish = await resolveParishForUser(
        this.prismaService,
        requestUser.id
      );
      if (parish.parishId !== mass.parishId) {
        throw new ForbiddenException('Forbidden', {
          cause: new Error(),
          description: 'You may only manage your own masses.',
        });
      }
    }

    const changesSchedule =
      updateMassDto.startAt !== undefined ||
      updateMassDto.estimatedDurationMinutes !== undefined;
    if (changesSchedule && mass.status !== 'OPEN') {
      throw new ConflictException('Conflict', {
        cause: new Error(),
        description:
          'startAt/estimatedDurationMinutes can only be changed while the mass is still OPEN.',
      });
    }

    return this.prismaService.mass.update({
      where: { massId },
      data: {
        ...updateMassDto,
        startAt: updateMassDto.startAt
          ? new Date(updateMassDto.startAt)
          : undefined,
      },
    });
  }

  async findAllByParish(parishId: string, filters?: MassFilters) {
    return this.prismaService.mass.findMany({
      where: {
        parishId,
        status: filters?.status,
        massType: filters?.massType,
        startAt:
          filters?.from || filters?.to
            ? {
                gte: filters?.from ? new Date(filters.from) : undefined,
                lte: filters?.to ? new Date(filters.to) : undefined,
              }
            : undefined,
      },
      select: {
        massId: true,
        price: true,
        startAt: true,
        estimatedDurationMinutes: true,
        status: true,
        createdAt: true,
        massType: true,
      },
      orderBy: { startAt: 'asc' },
    });
  }

  async findAll(parishId: string) {
    return this.prismaService.mass.findMany({
      where: {
        parishId,
      },
      include: {
        massOrder: true,
      },
    });
  }

  async findOne(massId: string) {
    return this.prismaService.mass.findUnique({
      where: {
        massId,
      },
    });
  }

  async remove(massId: string) {
    return this.prismaService.mass.delete({
      where: {
        massId,
      },
    });
  }

  private getDatesEvery7DaysUntilEndOfYear(startDate: string): string[] {
    const dates: string[] = [];
    const currentYear = new Date().getFullYear();
    const endDate = new Date(currentYear, 11, 31);

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate).toISOString());
      currentDate.setDate(currentDate.getDate() + 7);
    }
    return dates;
  }

  private getUniqueDate(arrayDate1: string[], arrayDate2: string[]): string[] {
    const elementCount = new Map<string, number>();

    const newArrayDate2 = arrayDate2.filter(
      (date) => new Date(arrayDate1[0]) <= new Date(date)
    );

    arrayDate1.concat(newArrayDate2).forEach((date) => {
      elementCount.set(date, (elementCount.get(date) || 0) + 1);
    });

    return Array.from(elementCount.entries())
      .filter(([, count]) => count === 1)
      .map(([date]) => date);
  }

  private createListOfMasses(
    arrayDate: string[],
    input: CreateMassDto,
    parishId: string
  ): Prisma.MassCreateManyInput[] {
    return arrayDate.map((date) => ({
      price: input.price,
      startAt: new Date(date),
      estimatedDurationMinutes: input.estimatedDurationMinutes,
      massType: input.massType,
      parishId,
    }));
  }
}
