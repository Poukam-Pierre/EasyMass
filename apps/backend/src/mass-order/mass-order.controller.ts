import { Controller, Get, Query, Request } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorator/roles.decorator';
import { AuthenticatedRequest } from '../common/authenticated-request';
import { MassOrderService } from './mass-order.service';

@Controller('/mass-order')
export class MassOrderController {
  constructor(private readonly massOrderService: MassOrderService) {}

  @Get('/active')
  @Roles(UserRole.PARISH)
  findAllActive(@Request() request: AuthenticatedRequest) {
    return this.massOrderService.findAllUnprocessMass(request.user);
  }

  @Get()
  @Roles(UserRole.PARISH, UserRole.ADMIN)
  findMassOrderByMass(
    @Query('massId') massId: string,
    @Request() request: AuthenticatedRequest
  ) {
    return this.massOrderService.findMassOrderByMass(massId, request.user);
  }
}
