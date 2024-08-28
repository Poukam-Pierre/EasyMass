import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
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

      allDateProcessMasses.map(async (date) => {
        const isMassAlreadyExists = existingMass.some(
          (mass) => mass.processAt === date
        );
        if (isMassAlreadyExists) {
          throw new ConflictException('Mass already exists', {
            cause: new Error(),
            description: `The mass ${date} is already created!`,
          });
        } else {
          input.createByParish = {
            connect: {
              id: id,
            },
          };

          input.processAt = date;
          try {
            await this.create(input);
          } catch (error) {
            throw new InternalServerErrorException();
          }
        }
      });
      return { code: 200, message: 'Masses created successfully!' };
    }

    const isMassAlreadyExists = existingMass.some(
      (mass) => mass.processAt === processAt
    );
    if (isMassAlreadyExists) {
      throw new ConflictException('Mass already exists', {
        cause: new Error(),
        description: 'Mass already created by the same parish',
      });
    }

    input.createByParish = {
      connect: {
        id: id,
      },
    };

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
  private getDatesEvery7DaysUntilEndOfYear(startDate: Date): Date[] {
    const dates = [];
    const currentYear = new Date().getFullYear();
    const endDate = new Date(currentYear, 11, 31);

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7);
    }
    return dates;
  }
}
