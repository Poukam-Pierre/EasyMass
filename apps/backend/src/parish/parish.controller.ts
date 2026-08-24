import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ROLE, Role } from '../auth/decorator/public.decorator';
import { AdminGuard } from '../auth/guard/admin.guards';
import { AuthGuard } from '../auth/guard/auth.guards';
import { ParishService } from './parish.service';
import { SignUpParishDto } from './dto/signupParish.dto';

@Controller('parishes')
export class ParishController {
  constructor(private readonly parishService: ParishService) {}

  @Get()
  @UseGuards(AdminGuard)
  @Role(ROLE.ADMIN)
  @Role(ROLE.ENGINEER)
  findAll() {
    return this.parishService.findAll();
  }

  @Get('/masses')
  findAllMasses() {
    return this.parishService.findAllMasses();
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  @Role(ROLE.ADMIN)
  @Role(ROLE.ENGINEER)
  findOne(@Param('id') id: string) {
    return this.parishService.findParish(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateParishDto: Prisma.ParishUpdateInput
  ) {
    return this.parishService.update(id, updateParishDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.parishService.remove(id);
  }

  @Post('/new')
  @UseGuards(AdminGuard)
  @Role(ROLE.ADMIN)
  @Role(ROLE.ENGINEER)
  create(@Body() input: SignUpParishDto, @Request() request) {
    return this.parishService.createParish(input, request);
  }
}
