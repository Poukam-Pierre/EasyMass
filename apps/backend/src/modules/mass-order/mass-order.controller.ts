import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MassOrderService } from './mass-order.service';

@Controller('/mass-order')
@ApiTags('mass-order')
export class MassOrderController {
  constructor(private readonly massOrderService: MassOrderService) {}

  // @Get('/active')
  // @UseGuards(AuthGuard)
  // findAllActive(@Request() request) {
  //   return this.massOrderService.findAllUnprocessMass(request);
  // }

  // // @Get()
  // // @UseGuards(AuthGuard)
  // // findMassOrderByMass(@Query('massId') massId: string) {
  // //   return this.massOrderService.findMassOrderByMass(+massId);
  // // }

  // @ApiOperation({
  //   summary: 'Find out all masses created by parish',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Requests retreive successfully',
  // })
  // @ApiResponse({
  //   status: 500,
  //   description: 'Internal server error',
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'No mass requested found',
  // })
  // @ApiResponse({
  //   status: 401,
  //   description: 'Unauthorize exception',
  // })
  // @Get()
  // @UseGuards(AuthGuard)
  // getAllMassOrder(@Req() request) {
  //   return this.massOrderService.findAllMassOrder(request);
  // }
}
