import {
  Injectable
} from '@nestjs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { PrismaService } from '../../prisma/prisma.service';

dayjs.extend(utc);
@Injectable()
export class MassService {
  constructor(private readonly prismaService: PrismaService) {}

  // /**
  //  * This function is responsible to create masses from parish owner. It's take the data of mass and
  //  * create them depending on the replicate boolean value. If it's true, then the function will create
  //  * masses at the same time on the week until the end of the givrn period. Otherwise it will create
  //  * one mass at the specific time.
  //  * @param input data of a mass to create
  //  * @param request express request object that hold cretenrial parish data
  //  * @returns
  //  */
  // async createMasses(input: CreateMassDto, request) {
  //   const { id } = request.user;
  //   const { canReplicate, processAt, period, price } = input;

  //   let dataMassesByPeriod;
  //   try {
  //     const { masses: existingMass } = await this.findAllMasses(id);

  //     // verify if mass exist already
  //     const isMassAlreadyExists = existingMass.some(
  //       (mass) =>
  //         new Date(mass.dayOfMass).getTime() === new Date(processAt).getTime()
  //     );

  //     if (isMassAlreadyExists) throw new ConflictException('massExistAlready');

  //     if (canReplicate) {
  //       // create array of masses data according to the period
  //       dataMassesByPeriod = this.getDataMassesByPeriod(
  //         period,
  //         processAt,
  //         price,
  //         id
  //       );
  //     }
  //     // create mass in the db
  //     await this.prismaService.mass.createMany({
  //       data: !canReplicate
  //         ? {
  //             processAt,
  //             price,
  //             parishId: id,
  //           }
  //         : dataMassesByPeriod,
  //     });

  //     return { code: 201, message: 'Mass created successfully!' };
  //   } catch (error) {
  //     console.log('Error while creating new mass :', error);
  //     if (error instanceof ConflictException) {
  //       throw new ConflictException('massExistAlready');
  //     }
  //     throw new InternalServerErrorException('serverError');
  //   }
  // }

  // async create(createMassDto: Prisma.MassCreateInput) {
  //   return this.prismaService.mass.create({
  //     data: createMassDto,
  //   });
  // }

  // async update(id: number, updateMassDto: Prisma.MassUpdateInput) {
  //   return this.prismaService.mass.update({
  //     where: { id },
  //     data: updateMassDto,
  //   });
  // }

  // async findAllByBeliever(believerId: string) {
  //   return this.prismaService.mass.findMany({
  //     where: {
  //       believerId,
  //     },
  //   });
  // }

  // // TODO: JSDocs
  // async findAllMasses(parishId: number) {
  //   try {
  //     const masses = await this.prismaService.mass.findMany({
  //       where: {
  //         parishId,
  //       },
  //       select: {
  //         id: true,
  //         price: true,
  //         processAt: true,
  //         createdAt: true,
  //       },
  //     });

  //     console.log('masses data :', masses);
  //     const restructuredMasses = masses.map(
  //       ({ id, price, processAt, createdAt }) => {
  //         return {
  //           id,
  //           price,
  //           dayOfMass: processAt,
  //           createdAt,
  //           status: dayjs(processAt).subtract(30, 'minutes').isAfter(dayjs())
  //             ? 'open'
  //             : dayjs(processAt).subtract(30, 'minutes').isBefore(dayjs()) &&
  //               dayjs(processAt).isAfter(dayjs())
  //             ? 'locked'
  //             : dayjs(processAt).isBefore(dayjs()) &&
  //               dayjs(processAt).isAfter(dayjs().add(2, 'h'))
  //             ? 'in progress'
  //             : 'done',
  //         };
  //       }
  //     );

  //     console.log('Masses restructured :', restructuredMasses);
  //     return {
  //       statusCode: 200,
  //       masses: restructuredMasses,
  //     };
  //   } catch (error) {
  //     console.log('Error arise while fetching all mass data :', error);
  //     throw new InternalServerErrorException('serverError');
  //   }
  // }

  // // async findAll(parishId: number) {
  // //   return this.prismaService.mass.findMany({
  // //     where: {
  // //       parishId,
  // //     },
  // //     include: {
  // //       massOrder: true,
  // //     },
  // //   });
  // // }

  // //TODO: Set up JSDocs
  // async getOneMassData(massId: number) {
  //   try {
  //     const massData = await this.prismaService.mass.findUnique({
  //       where: {
  //         id: massId,
  //         processAt: {
  //           lte: new Date(),
  //         },
  //       },
  //       select: {
  //         id: true,
  //         processAt: true,
  //       },
  //     });

  //     if (!massData) throw new NotFoundException('massNotFound');

  //     return {
  //       statusCode: 200,
  //       massData,
  //     };
  //   } catch (error) {
  //     console.log('Error arise while fetching mass informations :', error);
  //     if (error instanceof NotFoundException) {
  //       throw new NotFoundException(error.message);
  //     }
  //     throw new InternalServerErrorException('serverError');
  //   }
  // }
  // async findOne(id: number) {
  //   return this.prismaService.mass.findUnique({
  //     where: {
  //       id,
  //     },
  //   });
  // }

  // async remove(id: number) {
  //   return this.prismaService.mass.delete({
  //     where: {
  //       id,
  //     },
  //   });
  // }

  // private getDataMassesByPeriod(
  //   period: ReplicationPeriodEnum,
  //   startDate: Date,
  //   price: number,
  //   id: number
  // ) {
  //   const data = [];
  //   let currentDate = dayjs(startDate);
  //   let endDate: Dayjs;

  //   switch (period) {
  //     case ReplicationPeriodEnum.MONTHLY:
  //       endDate = currentDate.add(30, 'days');
  //       break;
  //     case ReplicationPeriodEnum.YEARLY:
  //       endDate = currentDate.endOf('year');
  //       break;
  //   }

  //   // process repetition every week in the whole period
  //   while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
  //     data.push({
  //       processAt: dayjs(currentDate).toDate(),
  //       price,
  //       parishId: id,
  //     });

  //     // add 7 days to the last mass process date
  //     currentDate = currentDate.add(7, 'days');
  //   }
  //   return data;
  // }

  // // private getUniqueDate(arrayDate1: string[], arrayDate2: string[]): string[] {
  // //   const elementCount = new Map<string, number>();

  // //   const newArrayDate2 = arrayDate2.filter(
  // //     (date) => new Date(arrayDate1[0]) <= new Date(date)
  // //   );

  // //   arrayDate1.concat(newArrayDate2).forEach((date) => {
  // //     elementCount.set(date, (elementCount.get(date) || 0) + 1);
  // //   });

  // //   const uniqueElements = Array.from(elementCount.entries())
  // //     .filter(([date, count]) => count === 1)
  // //     .map(([date]) => date);

  // //   return uniqueElements;
  // // }
}
