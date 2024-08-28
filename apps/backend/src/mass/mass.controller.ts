import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { MassService } from './mass.service';
import { AuthGuard } from '../auth/guard/auth.guards';
import { CreateMassDto } from './dto/create-mass.dto';

@Controller('masses')
export class MassController {
  constructor(private readonly massService: MassService) {}

  @Post('/create')
  @UseGuards(AuthGuard)
  create(@Request() request, @Body(ValidationPipe) input: CreateMassDto) {
    return this.massService.createMasses(input, request);
  }
}
