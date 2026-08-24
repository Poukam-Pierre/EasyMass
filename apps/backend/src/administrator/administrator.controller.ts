import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Request,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { Roles } from '../auth/decorator/roles.decorator';
import { AdministratorService } from './administrator.service';

@Controller('administrators')
@Roles(UserRole.ADMIN)
export class AdministratorController {
  constructor(private readonly administratorService: AdministratorService) {}

  @Get()
  findAll() {
    return this.administratorService.findAll();
  }

  @Get('/me')
  findMe(@Request() request) {
    return this.administratorService.findByUserId(request.user.id);
  }

  @Patch('/me')
  updateMe(
    @Request() request,
    @Body() updateAdminDto: Prisma.AdministratorUpdateInput
  ) {
    return this.administratorService.updateByUserId(
      request.user.id,
      updateAdminDto
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.administratorService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdminDto: Prisma.AdministratorUpdateInput
  ) {
    return this.administratorService.update(id, updateAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.administratorService.remove(id);
  }
}
