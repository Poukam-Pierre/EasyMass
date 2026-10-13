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
import { AuthenticatedRequest } from '../common/authenticated-request';
import { resolveAdminForUser } from '../common/user.utils';
import { PrismaService } from '../prisma/prisma.service';
import { AdministratorService } from './administrator.service';

@Controller('administrators')
@Roles(UserRole.ADMIN)
export class AdministratorController {
  constructor(
    private readonly administratorService: AdministratorService,
    private readonly prismaService: PrismaService
  ) {}

  @Get()
  findAll() {
    return this.administratorService.findAll();
  }

  @Get('/me')
  findMe(@Request() request: AuthenticatedRequest) {
    // Throws ForbiddenException if no Administrator row exists for this
    // user, consistent with every other /me-style lookup in the app —
    // previously this returned null/200 for a broken admin account instead.
    return resolveAdminForUser(this.prismaService, request.user.id);
  }

  @Patch('/me')
  async updateMe(
    @Request() request: AuthenticatedRequest,
    @Body() updateAdminDto: Prisma.AdministratorUpdateInput
  ) {
    const admin = await resolveAdminForUser(
      this.prismaService,
      request.user.id
    );
    return this.administratorService.update(admin.adminId, updateAdminDto);
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
