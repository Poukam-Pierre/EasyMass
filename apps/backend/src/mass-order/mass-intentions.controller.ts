import {
  Controller,
  ForbiddenException,
  Get,
  Header,
  Param,
  Request,
  Res,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
import { Roles } from '../auth/decorator/roles.decorator';
import { MassService } from '../mass/mass.service';
import { PdfService } from '../pdf/pdf.service';
import { PrismaService } from '../prisma/prisma.service';
import { resolveParishForUser } from '../common/user.utils';
import { MassOrderService } from './mass-order.service';

@Controller('masses/:massId/intentions')
export class MassIntentionsController {
  constructor(
    private readonly massOrderService: MassOrderService,
    private readonly massService: MassService,
    private readonly pdfService: PdfService,
    private readonly prismaService: PrismaService
  ) {}

  @Get()
  @Roles(UserRole.PARISH, UserRole.ADMIN)
  async list(@Param('massId') massId: string, @Request() request) {
    await this.assertOwnsMass(massId, request);
    return this.massOrderService.findMassOrderByMass(massId);
  }

  @Get('/download')
  @Roles(UserRole.PARISH, UserRole.ADMIN)
  @Header('Content-Type', 'application/pdf')
  async download(
    @Param('massId') massId: string,
    @Request() request,
    @Res() res: Response
  ) {
    await this.assertOwnsMass(massId, request);
    const orders = await this.massOrderService.findMassOrderByMass(massId);
    const pdf = await this.pdfService.generateIntentionsPdf(
      `Mass Intentions — ${massId}`,
      orders.map((o) => ({
        believerName: o.orderByBeliever.fullName,
        intension: o.intension,
      }))
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="intentions-${massId}.pdf"`
    );
    res.send(pdf);
  }

  private async assertOwnsMass(massId: string, request) {
    if (request.user.role === 'ADMIN') return;
    const mass = await this.massService.findOne(massId);
    const parish = await resolveParishForUser(
      this.prismaService,
      request.user.id
    );
    if (!mass || mass.parishId !== parish.parishId) {
      throw new ForbiddenException('Forbidden', {
        cause: new Error(),
        description: 'You may only view intentions for your own masses.',
      });
    }
  }
}
