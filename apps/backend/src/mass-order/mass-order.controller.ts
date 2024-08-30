import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { MassOrderService } from './mass-order.service';
import { AuthGuard } from '../auth/guard/auth.guards';

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
  findMassOrderByMass(@Param('massId') massId: string) {
    return this.massOrderService.findMassOrderByMass(+massId);
  }
}
