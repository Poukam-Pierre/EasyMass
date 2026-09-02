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
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorator/roles.decorator';
import { AuthenticatedRequest } from '../common/authenticated-request';
import { resolveParishForUser } from '../common/user.utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriestDto } from './dto/create-priest.dto';
import { UpdatePriestDto } from './dto/update-priest.dto';
import { PriestService } from './priest.service';

@Controller('priest')
export class PriestController {
  constructor(
    private readonly priestService: PriestService,
    private readonly prismaService: PrismaService
  ) {}

  /** Parish sees its own roster; admin can filter by any parish. */
  @Get()
  @Roles(UserRole.PARISH, UserRole.ADMIN)
  async findAll(
    @Request() request: AuthenticatedRequest,
    @Query('available') available?: string,
    @Query('parishId') parishId?: string
  ) {
    const homeParishId =
      request.user.role === UserRole.ADMIN
        ? parishId
        : (await resolveParishForUser(this.prismaService, request.user.id))
            .parishId;

    if (!homeParishId) return this.priestService.findAll();

    return this.priestService.findAllForParish(homeParishId, {
      available: available === undefined ? undefined : available === 'true',
    });
  }

  @Get(':id')
  @Roles(UserRole.PARISH, UserRole.ADMIN)
  findOne(@Param('id') id: string, @Request() request: AuthenticatedRequest) {
    return this.priestService.findOne(id, request.user);
  }

  @Post()
  @Roles(UserRole.PARISH)
  async create(
    @Body() input: CreatePriestDto,
    @Request() request: AuthenticatedRequest
  ) {
    const parish = await resolveParishForUser(
      this.prismaService,
      request.user.id
    );
    return this.priestService.create(input, parish.parishId);
  }

  @Patch(':id')
  @Roles(UserRole.PARISH, UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updatePriestDto: UpdatePriestDto,
    @Request() request: AuthenticatedRequest
  ) {
    return this.priestService.update(id, updatePriestDto, request.user);
  }

  @Delete(':id')
  @Roles(UserRole.PARISH, UserRole.ADMIN)
  remove(@Param('id') id: string, @Request() request: AuthenticatedRequest) {
    return this.priestService.remove(id, request.user);
  }
}
