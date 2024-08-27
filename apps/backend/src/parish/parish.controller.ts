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
import { AuthGuard } from '../auth/guard/auth.guards';

@Controller('parishes')
export class ParishController {
  constructor(private readonly parishService: ParishService) {}

  @Get()
  @UseGuards(AdminGuard)
  @Role(ROLE.ADMIN)
  @Role(ROLE.ENGENEER)
  findAll() {
    return this.parishService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  @Role(ROLE.ADMIN)
  @Role(ROLE.ENGENEER)
  findOne(@Param('id') id: string) {
    return this.parishService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateParishDto: Prisma.ParishUpdateInput
  ) {
    return this.parishService.update(+id, updateParishDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.parishService.remove(+id);
  }
}
