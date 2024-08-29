import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMassDto } from './dto/create-mass.dto';

@Injectable()
export class MassService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * This function is responsible to create masses from parish owner. It's take the data of mass and
   * create them depending on the replicate boolean value. If it's true, then the function will create
   * masses at the same time on the week until the end of the actual year. Otherwise it will create
   * one mass at the specific time.
   * @param input data of a mass to create
   * @param request express request object that hold cretenrial parish data
   * @returns
   */
  async createMasses(
    input: CreateMassDto,
    request
  ): Promise<{ code: number; message: string }> {
    const { id } = request.user;
    const { replicate, processAt } = input;

    const existingMass = await this.findAllByParish(id);

    if (replicate) {
      const allDateProcessMasses =
        this.getDatesEvery7DaysUntilEndOfYear(processAt);

      const uniqueDateProcessMasses = this.getUniqueDate(
        allDateProcessMasses,
        existingMass.map((mass) => mass.processAt)
      );

      if (!uniqueDateProcessMasses)
        return { code: 200, message: 'All masses already exist!' };

      const listOfMasses = this.createListOfMasses(
        uniqueDateProcessMasses,
        input,
        id
      );

      try {
        await this.prismaService.mass.createMany({
          data: listOfMasses,
        });
        return { code: 201, message: 'Mass created successfully!' };
      } catch (error) {
        throw new InternalServerErrorException();
      }
    }

    const isMassAlreadyExists = existingMass.some(
      (mass) =>
        new Date(mass.processAt).getTime() === new Date(processAt).getTime()
    );

    if (isMassAlreadyExists) {
      throw new ConflictException('Mass already exists', {
        cause: new Error(),
        description: 'Mass already created by the same parish',
      });
    }

    input.createdByParish = {
      connect: {
        id: id,
      },
    };
    delete input.replicate;

    try {
      await this.create(input);
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

  async update(id: number, updateMassDto: Prisma.MassUpdateInput) {
    return this.prismaService.mass.update({
      where: { id },
      data: updateMassDto,
    });
  }

  async findAllByBeliever(believerId: string) {
    return this.prismaService.mass.findMany({
      where: {
        believerId,
      },
    });
  }

  async findAllByParish(parishId: number) {
    return this.prismaService.mass.findMany({
      where: {
        parishId,
      },
    });
  }

  async findOne(id: number) {
    return this.prismaService.mass.findUnique({
      where: {
        id,
      },
    });
  }

  async remove(id: number) {
    return this.prismaService.mass.delete({
      where: {
        id,
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

    const uniqueElements = Array.from(elementCount.entries())
      .filter(([date, count]) => count === 1)
      .map(([date]) => date);

    return uniqueElements;
  }

  private createListOfMasses(
    arrayDate: string[],
    input: CreateMassDto,
    id: number
  ) {
    const arrayOfMasses = arrayDate.map((date) => ({
      price: input.price,
      processAt: date,
      massType: input.massType,
      parishId: id,
    }));
    return arrayOfMasses;
  }
}
