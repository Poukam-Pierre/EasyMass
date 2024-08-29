import {
  Body,
  Controller,
  Patch,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
  Param,
  Delete,
} from '@nestjs/common';
import { MassService } from './mass.service';
import { AuthGuard } from '../auth/guard/auth.guards';
import { CreateMassDto } from './dto/create-mass.dto';
import { Prisma } from '@prisma/client';

@Controller('masses')
export class MassController {
  constructor(private readonly massService: MassService) {}

  @Post('/create')
  @UseGuards(AuthGuard)
  create(@Request() request, @Body(ValidationPipe) input: CreateMassDto) {
    return this.massService.createMasses(input, request);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  updateMass(
    @Param('id') id: string,
    @Body() updateMassDto: Prisma.MassUpdateInput
  ) {
    return this.massService.update(+id, updateMassDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.massService.remove(+id);
  }
}
