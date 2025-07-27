import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
// import { ROLE, Role } from '../auth/decorator/public.decorator';
// import { AdminGuard } from '../auth/guard/admin.guards';
// import { AuthGuard } from '../auth/guard/auth.guards';
import { PriestService } from './priest.service';
import { AdminGuard } from '../../app/auth/guard/admin.guards';
import { ROLE, Role } from '../../app/auth/decorator/public.decorator';
import { AuthGuard } from '../../app/auth/guard/auth.guards';

@Controller('priest')
export class PriestController {
  constructor(private readonly priestService: PriestService) {}

  create(@Body() createPriestDto: Prisma.PriestCreateInput) {
    return this.priestService.create(createPriestDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  @Role(ROLE.ADMIN)
  @Role(ROLE.ENGENEER)
  findAll() {
    return this.priestService.findAll();
  }

  findOne(email: string) {
    return this.priestService.findOne(email);
  }

  @Post(':id')
  @UseGuards(AuthGuard)
  update(id: string, updatePriestDto: Prisma.PriestUpdateInput) {
    return this.priestService.update(+id, updatePriestDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.priestService.remove(+id);
  }
}
