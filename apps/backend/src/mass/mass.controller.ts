import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '../auth/guard/auth.guards';
import { CreateMassDto } from './dto/create-mass.dto';
import { MassService } from './mass.service';

@Controller('masses')
@UseGuards(AuthGuard)
@ApiTags('masses')
export class MassController {
  constructor(private readonly massService: MassService) {}

  @ApiOperation({
    summary: 'Create masses',
  })
  @ApiResponse({
    status: 200,
    description: 'Masses has been created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorize exception',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 409,
    description: 'Mass exists already',
  })
  @ApiResponse({
    status: 400,
    description: 'Missing/bad data request',
  })
  @Post('/create')
  @UseGuards(AuthGuard)
  create(@Req() request, @Body() input: CreateMassDto) {
    return this.massService.createMasses(input, request);
  }

  @Patch(':id')
  updateMass(
    @Param('id') id: string,
    @Body() updateMassDto: Prisma.MassUpdateInput
  ) {
    return this.massService.update(+id, updateMassDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.massService.remove(+id);
  }

  @ApiOperation({
    summary: 'Find all masses created',
  })
  @ApiResponse({
    status: 200,
    description: 'Masses requested successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorize exception',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() request) {
    const { id } = request.user;
    return this.massService.findAllMasses(+id);
  }

  @ApiOperation({
    summary: 'Find unique mass',
  })
  @ApiResponse({
    status: 200,
    description: 'Mass requested successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorize exception',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 404,
    description: 'Data with the correspondant ID does not exis',
  })
  @Get('unique_mass')
  @UseGuards(AuthGuard)
  findUniqueMass(@Query('massId') massId: string) {
    return this.massService.getOneMassData(+massId);
  }
}
