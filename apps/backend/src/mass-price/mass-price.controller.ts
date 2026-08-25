import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { Currency, UserRole } from '@prisma/client';
import { Public } from '../auth/decorator/public.decorator';
import { Roles } from '../auth/decorator/roles.decorator';
import { AuthenticatedRequest } from '../common/authenticated-request';
import { SetMassPriceDto } from './dto/set-mass-price.dto';
import { MassPriceService } from './mass-price.service';

@Controller('masses/:massId/prices')
export class MassPriceController {
  constructor(private readonly massPriceService: MassPriceService) {}

  @Public()
  @Get()
  findForMass(@Param('massId') massId: string) {
    return this.massPriceService.findForMass(massId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  setPrice(
    @Param('massId') massId: string,
    @Body() dto: SetMassPriceDto,
    @Request() request: AuthenticatedRequest
  ) {
    return this.massPriceService.setPrice(massId, dto, request.user.id);
  }

  @Delete()
  @Roles(UserRole.ADMIN)
  remove(@Param('massId') massId: string, @Query('currency') currency: Currency) {
    return this.massPriceService.remove(massId, currency);
  }
}
