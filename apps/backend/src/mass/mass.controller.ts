import {
  Body,
  Controller,
  Patch,
  Post,
  Request,
  UseGuards,
  Param,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { MassService } from './mass.service';
import { AuthGuard } from '../auth/guard/auth.guards';
import { CreateMassDto } from './dto/create-mass.dto';
import { Prisma } from '@prisma/client';

@Controller('masses')
@UseGuards(AuthGuard)
export class MassController {
  constructor(private readonly massService: MassService) {}

  @Post('/create')
  create(@Request() request, @Body() input: CreateMassDto) {
    return this.massService.createMasses(input, request);
  }

  @Patch(':id')
  updateMass(
    @Param('id') id: string,
    @Body() updateMassDto: Prisma.MassUpdateInput
  ) {
    return this.massService.update(id, updateMassDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.massService.remove(id);
  }

  @Get()
  findAll(
    @Query('parishId') parishId: string,
    @Query('role') role?: 'HISTORY'
  ) {
    return this.massService.findAllByParish(parishId, role);
  }
}
