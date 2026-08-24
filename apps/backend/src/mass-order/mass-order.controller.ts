import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth.guards';
import { MassOrderService } from './mass-order.service';

@Controller('/mass-order')
export class MassOrderController {
  constructor(private readonly massOrderService: MassOrderService) {}

  @Get('/active')
  @UseGuards(AuthGuard)
  findAllActive(@Request() request) {
    return this.massOrderService.findAllUnprocessMass(request);
  }

  @Get()
  @UseGuards(AuthGuard)
  findMassOrderByMass(@Query('massId') massId: string) {
    return this.massOrderService.findMassOrderByMass(massId);
  }
}
