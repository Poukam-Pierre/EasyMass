import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { Public } from '../auth/decorator/public.decorator';
import { Roles } from '../auth/decorator/roles.decorator';
import { CityService } from './city.service';

@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Public()
  @Get()
  findAll() {
    return this.cityService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cityService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createCityDto: Prisma.CityCreateInput) {
    return this.cityService.create(createCityDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCityDto: Prisma.CityUpdateInput
  ) {
    return this.cityService.update(id, updateCityDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.cityService.remove(id);
  }
}
