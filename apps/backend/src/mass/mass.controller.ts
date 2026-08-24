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
import { MassStatus, MassType, UserRole } from '@prisma/client';
import { Roles } from '../auth/decorator/roles.decorator';
import { CreateMassDto } from './dto/create-mass.dto';
import { UpdateMassDto } from './dto/update-mass.dto';
import { MassService } from './mass.service';

@Controller('masses')
export class MassController {
  constructor(private readonly massService: MassService) {}

  @Post('/create')
  @Roles(UserRole.PARISH)
  create(@Request() request, @Body() input: CreateMassDto) {
    return this.massService.createMasses(input, request);
  }

  @Patch(':id')
  @Roles(UserRole.PARISH, UserRole.ADMIN)
  updateMass(
    @Param('id') id: string,
    @Body() updateMassDto: UpdateMassDto,
    @Request() request
  ) {
    return this.massService.update(id, updateMassDto, request.user);
  }

  @Delete(':id')
  @Roles(UserRole.PARISH, UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.massService.remove(id);
  }

  @Get()
  findAll(
    @Query('parishId') parishId: string,
    @Query('status') status?: MassStatus,
    @Query('massType') massType?: MassType,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    return this.massService.findAllByParish(parishId, {
      status,
      massType,
      from,
      to,
    });
  }
}
