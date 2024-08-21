import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ParishService } from './parish.service';
import { AdminGuard } from '../auth/guard/admin.guards';
import { ROLE, Role } from '../auth/decorator/public.decorator';

@Controller('parishes')
@UseGuards(AdminGuard)
export class ParishController {
  constructor(private readonly parishService: ParishService) {}

  @Post()
  @Role(ROLE.ADMIN)
  create(@Body() createParishDto: Prisma.ParishCreateInput) {
    return this.parishService.create(createParishDto);
  }

  @Get()
  @Role(ROLE.ADMIN)
  @Role(ROLE.ENGENEER)
  findAll() {
    return this.parishService.findAll();
  }

  @Get(':id')
  @Role(ROLE.ADMIN)
  @Role(ROLE.ENGENEER)
  findOne(@Param('id') id: string) {
    return this.parishService.findOne(+id);
  }

  @Patch(':id')
  @Role(ROLE.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateParishDto: Prisma.ParishUpdateInput
  ) {
    return this.parishService.update(+id, updateParishDto);
  }

  @Role(ROLE.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parishService.remove(+id);
  }
}
