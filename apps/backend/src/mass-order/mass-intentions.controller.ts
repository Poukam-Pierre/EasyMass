import { Controller, Get, Header, Param, Request, Res } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Response } from 'express';
import { Roles } from '../auth/decorator/roles.decorator';
import { AuthenticatedRequest } from '../common/authenticated-request';
import { PdfService } from '../pdf/pdf.service';
import { MassOrderService } from './mass-order.service';

@Controller('masses/:massId/intentions')
export class MassIntentionsController {
  constructor(
    private readonly massOrderService: MassOrderService,
    private readonly pdfService: PdfService
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
}
