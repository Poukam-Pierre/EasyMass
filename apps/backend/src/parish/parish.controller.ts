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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ROLE, Role } from '../auth/decorator/public.decorator';
import { AdminGuard } from '../auth/guard/admin.guards';
import { AuthGuard } from '../auth/guard/auth.guards';
import { UpdateParishData } from './dto/parishData.dto';
import { SignUpParishDto } from './dto/signupParish.dto';
import { ParishService } from './parish.service';

@Controller('parishes')
@ApiTags('Parishes')
export class ParishController {
  constructor(private readonly parishService: ParishService) {}

  @ApiOperation({
    summary: 'Get all parishes',
  })
  @ApiResponse({
    status: 200,
    description: 'Parishes retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Token is missing or invalid.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal Server Error. An error occurred while processing the request.',
  })
  @Get()
  @UseGuards(AdminGuard)
  @Role(ROLE.ADMIN)
  @Role(ROLE.ENGENEER)
  findAll() {
    return this.parishService.findAll();
  }

  @ApiOperation({
    summary: 'Retrieve all masses with their parish',
  })
  @ApiResponse({
    status: 200,
    description: 'Masses retreive successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Token is missing or invalid.',
  })
  @Get('/masses')
  @UseGuards(AdminGuard)
  @Role(ROLE.ADMIN)
  @Role(ROLE.ENGENEER)
  findAllMasses() {
    return this.parishService.findAllMasses();
  }

  @ApiOperation({
    summary: 'Get all cities',
  })
  @ApiResponse({
    status: 200,
    description: 'Cities retrieves successfully',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal Server Error. An error occurred while processing the request.',
  })
  @Get('/cities')
  @UseGuards(AuthGuard)
  getAllCities() {
    return this.parishService.findAllCities();
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  @Role(ROLE.ADMIN)
  @Role(ROLE.ENGENEER)
  findOne(@Param('id') id: string) {
    return this.parishService.findParish(+id);
  }

  @ApiOperation({
    summary: 'Update parish data',
  })
  @ApiResponse({
    status: 200,
    description: 'Parish updated successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Token is missing or invalid.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal Server Error. An error occurred while processing the request.',
  })
  @Patch(':id')
  @UseGuards(AuthGuard)
  updateParish(
    @Param('id') id: string,
    @Body() updateParishDto: UpdateParishData
  ) {
    return this.parishService.updateParish(+id, updateParishDto);
  }

  @ApiOperation({
    summary: 'Delete a parish',
  })
  @ApiResponse({
    status: 200,
    description: 'Parish deleted successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Token is missing or invalid.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal Server Error. An error occurred while processing the request.',
  })
  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() request) {
    return this.parishService.remove(+id, request);
  }

  @ApiOperation({
    summary: 'Create a new parish with the given data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Token is missing or invalid.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. You do not have permission to access this resource.',
  })
  @ApiResponse({
    status: 201,
    description: 'Parish created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid input data.',
  })
  @ApiResponse({
    status: 500,
    description:
      'Internal Server Error. An error occurred while processing the request.',
  })
  @Post('/new')
  @UseGuards(AdminGuard)
  @Role(ROLE.ADMIN)
  @Role(ROLE.ENGENEER)
  create(@Body() input: SignUpParishDto, @Request() request) {
    return this.parishService.createParish(input, request);
  }
}
