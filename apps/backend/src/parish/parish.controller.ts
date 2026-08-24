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
import { Prisma, UserRole } from '@prisma/client';
import { Public } from '../auth/decorator/public.decorator';
import { Roles } from '../auth/decorator/roles.decorator';
import { resolveParishForUser } from '../common/user.utils';
import { PrismaService } from '../prisma/prisma.service';
import { ParishService } from './parish.service';
import { SignUpParishDto } from './dto/signupParish.dto';

@Controller('parishes')
export class ParishController {
  constructor(
    private readonly parishService: ParishService,
    private readonly prismaService: PrismaService
  ) {}

  @Get('/me/dashboard')
  @Roles(UserRole.PARISH)
  async myDashboard(@Request() request) {
    const parish = await resolveParishForUser(
      this.prismaService,
      request.user.id
    );
    return this.parishService.getDashboard(parish.parishId);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query('city') city?: string, @Query('name') name?: string) {
    return this.parishService.findAll({ city, name });
  }

  @Public()
  @Get('/visible')
  findAllVisible() {
    return this.parishService.findAllVisible();
  }

  @Public()
  @Get('/masses')
  findAllMasses() {
    return this.parishService.findAllMasses();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.parishService.findParish(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateParishDto: Prisma.ParishUpdateInput,
    @Request() request
  ) {
    return this.parishService.update(id, updateParishDto, request.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() request) {
    return this.parishService.remove(id, request.user);
  }

  @Post('/new')
  @Roles(UserRole.ADMIN)
  create(@Body() input: SignUpParishDto, @Request() request) {
    return this.parishService.createParish(input, request);
  }

  @Patch(':id/block')
  @Roles(UserRole.ADMIN)
  block(@Param('id') id: string, @Body('isBlocked') isBlocked: boolean) {
    return this.parishService.setBlocked(id, isBlocked);
  }

  @Patch(':id/payout-block')
  @Roles(UserRole.ADMIN)
  payoutBlock(
    @Param('id') id: string,
    @Body('payoutBlocked') payoutBlocked: boolean
  ) {
    return this.parishService.setPayoutBlocked(id, payoutBlocked);
  }

  @Patch(':id/payout-method')
  @Roles(UserRole.ADMIN, UserRole.PARISH)
  payoutMethod(
    @Param('id') id: string,
    @Body('payoutNumber') payoutNumber: string,
    @Request() request
  ) {
    return this.parishService.setPayoutNumber(id, payoutNumber, request.user);
  }
}
