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
import { Prisma } from '@prisma/client';
import { ROLE, Role } from '../auth/decorator/public.decorator';
import { AdminGuard } from '../auth/guard/admin.guards';
import { AuthGuard } from '../auth/guard/auth.guards';
import { SignUpParishDto } from './dto/signupParish.dto';
import { ParishService } from './parish.service';

@Controller('parishes')
@ApiTags('Parish')
export class ParishController {
  constructor(private readonly parishService: ParishService) {}

  @Get()
  @UseGuards(AdminGuard)
  @Role(ROLE.ADMIN)
  @Role(ROLE.ENGENEER)
  findAll() {
    return this.parishService.findAll();
  }

  @Get('/masses')
  findAllMasses() {
    return this.parishService.findAllMasses();
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  @Role(ROLE.ADMIN)
  @Role(ROLE.ENGENEER)
  findOne(@Param('id') id: string) {
    return this.parishService.findParish(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateParishDto: Prisma.ParishUpdateInput
  ) {
    return this.parishService.update(+id, updateParishDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.parishService.remove(+id);
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
  // TODO: uncomment this when the admin data credentials is ready
  // @UseGuards(AdminGuard)
  // @Role(ROLE.ADMIN)
  // @Role(ROLE.ENGENEER)
  create(@Body() input: SignUpParishDto, @Request() request) {
    return this.parishService.createParish(input, request);
  }
}
