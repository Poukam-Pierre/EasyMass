import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MassService } from '../mass/mass.service';

@Injectable()
export class MassOrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly massService: MassService,
  ) {}

  // async create(createMassOrderDto: Prisma.MassOrderCreateInput) {
  //   return this.prismaService.massOrder.create({
  //     data: createMassOrderDto
  //   });
  // }

  // /**
  //  * This function takes a request data coming from Authorization and extract user inclut early into authorization file.
  //  * Then fetch all masses created by parish. Next, filter the result to only have masses that its processAt field data is more than the actual date
  //  * and the massOrder field data won't null. The result figure out the masses that won't be process yet and they are ordered. Then extract the massId
  //  * field from the new result and fetch the massOrder according to those massId field. The final result will figure out the massOrders with his masses
  //  * and the owners.
  //  * @param request
  //  * @returns
  //  */
  // async findAllUnprocessMass(request) {
  //   const { id } = request.user;

  //   try {
  //     const masses = await this.massService.findAll(id);
  //     const allUnprocessMass = masses.filter(
  //       (mass) =>
  //         new Date(mass.processAt) >= new Date() && mass.massOrder.length !== 0
  //     );

  //     const massIds = allUnprocessMass.map((mass) => mass.id);

  //     const allUnprocessMasses = await this.prismaService.massOrder.findMany({
  //       where: {
  //         createdByParish: {
  //           id
  //         }
  //       },
  //       select: {
  //         MassOrderHasMasses: {
  //           select: {
  //             massOrder: {
  //               select: {
  //                 id: true,
  //                 massType: true,
  //                 createdAt: true,
  //                 orderByBeliever: {
  //                   select: {
  //                     name: true
  //                   }
  //                 },
  //                 MassOrderHasMasses: {
  //                   select: {
  //                     mass: {
  //                       select: {
  //                         processAt: true
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     });

  //     const restructuredMassOrder = massOrder
  //       .map((tt) => tt.MassOrderHasMasses)
  //       .flat()
  //       .map(
  //         ({
  //           massOrder: {
  //             id,
  //             MassOrderHasMasses,
  //             createdAt,
  //             massType,
  //             orderByBeliever
  //           }
  //         }) => {
  //           const proceedDates = MassOrderHasMasses.map(
  //             (tt) => tt.mass.processAt
  //           );
  //           const status = `${
  //             proceedDates.filter((date) => date > new Date()).length
  //           }/${proceedDates.length}`;

  //           return {
  //             id,
  //             registrationDate: createdAt,
  //             massType,
  //             name: orderByBeliever.name,
  //             startDate: new Date(
  //               Math.min(
  //                 ...MassOrderHasMasses.map((tt) => tt.mass.processAt.getTime())
  //               )
  //             ),
  //             endDate: new Date(
  //               Math.max(
  //                 ...MassOrderHasMasses.map((tt) => tt.mass.processAt.getTime())
  //               )
  //             ),
  //             status
  //           };
  //         }
  //       );

  //     return {
  //       statusCode: 200,
  //       data: restructuredMassOrder
  //     };
  //   } catch (error) {
  //     console.log('Error arise while fetching all requested masses :', error);
  //     throw new InternalServerErrorException('serveError');
  //   }
  // }
}
