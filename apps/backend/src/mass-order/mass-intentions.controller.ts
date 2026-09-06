import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Request,
  Res,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
import { Roles } from '../auth/decorator/roles.decorator';
import { AuthenticatedRequest } from '../common/authenticated-request';
import { PrismaService } from '../prisma/prisma.service';
import { formatMassSubtitle, PdfService } from '../pdf/pdf.service';
import { MassOrderService } from './mass-order.service';

@Controller('masses/:massId/intentions')
export class MassIntentionsController {
  constructor(
    private readonly massOrderService: MassOrderService,
    private readonly pdfService: PdfService,
    private readonly prismaService: PrismaService
  ) {}

  @Get()
  @Roles(UserRole.PARISH, UserRole.ADMIN)
  async list(
    @Param('massId') massId: string,
    @Request() request: AuthenticatedRequest
  ) {
    return this.massOrderService.findMassOrderByMass(massId, request.user);
  }

  @Get('/download')
  @Roles(UserRole.PARISH, UserRole.ADMIN)
  @Header('Content-Type', 'application/pdf')
  async download(
    @Param('massId') massId: string,
    @Request() request: AuthenticatedRequest,
    @Res() res: Response
  ) {
    const orders = await this.massOrderService.findMassOrderByMass(
      massId,
      request.user
    );
    const mass = await this.prismaService.mass.findUnique({
      where: { massId },
      include: {
        parish: { select: { name: true, user: { select: { language: true } } } },
      },
    });
    if (!mass) throw new NotFoundException('Mass not found');

    // The document is for the owning parish, so it renders in the parish's
    // own language regardless of which role (parish or admin) downloads it.
    const language = mass.parish.user.language;
    const pdf = await this.pdfService.generateIntentionsPdf(
      formatMassSubtitle(mass.massType, mass.startAt, mass.parish.name, language),
      orders.map((o) => ({
        believerName: o.orderByBeliever.fullName,
        intension: o.intension,
      })),
      language
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="intentions-${massId}.pdf"`
    );
    res.send(pdf);
  }
}
