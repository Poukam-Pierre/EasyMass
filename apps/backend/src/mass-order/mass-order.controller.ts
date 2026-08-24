import { Controller, Get, Query, Request } from '@nestjs/common';
import { MassOrderService } from './mass-order.service';

@Controller('/mass-order')
export class MassOrderController {
  constructor(private readonly massOrderService: MassOrderService) {}

  @Get('/active')
  findAllActive(@Request() request) {
    return this.massOrderService.findAllUnprocessMass(request);
  }

  @Get()
  findMassOrderByMass(@Query('massId') massId: string) {
    return this.massOrderService.findMassOrderByMass(massId);
  }
}
