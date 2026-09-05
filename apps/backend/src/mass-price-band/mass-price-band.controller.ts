import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { Currency, UserRole } from '@prisma/client';
import { Roles } from '../auth/decorator/roles.decorator';
import { AuthenticatedRequest } from '../common/authenticated-request';
import { CreateMassPriceBandDto } from './dto/create-mass-price-band.dto';
import { UpdateMassPriceBandDto } from './dto/update-mass-price-band.dto';
import { MassPriceBandService } from './mass-price-band.service';

@Controller('mass-price-bands')
@Roles(UserRole.ADMIN)
export class MassPriceBandController {
  constructor(private readonly massPriceBandService: MassPriceBandService) {}

  @Get()
  findAll(@Query('currency') currency?: Currency) {
    return this.massPriceBandService.findAll(currency);
  }

  @Post()
  create(
    @Body() dto: CreateMassPriceBandDto,
    @Request() request: AuthenticatedRequest
  ) {
    return this.massPriceBandService.create(dto, request.user.id);
  }

  @Patch(':massPriceBandId')
  update(
    @Param('massPriceBandId') massPriceBandId: string,
    @Body() dto: UpdateMassPriceBandDto,
    @Request() request: AuthenticatedRequest
  ) {
    return this.massPriceBandService.update(
      massPriceBandId,
      dto,
      request.user.id
    );
  }

  @Delete(':massPriceBandId')
  remove(@Param('massPriceBandId') massPriceBandId: string) {
    return this.massPriceBandService.remove(massPriceBandId);
  }
}
